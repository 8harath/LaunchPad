'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Clock3,
  Compass,
  FileStack,
  Sparkles,
  TrendingUp,
  UserCircle2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ApplicationProgress } from '@/components/application-progress'
import { CareerInsightsBoard } from '@/components/career-insights-board'
import { InboxPreview } from '@/components/inbox-preview'
import { MessageComposer } from '@/components/message-composer'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DashboardStatCard } from '@/components/dashboard-stat-card'
import { ActionCard } from '@/components/action-card'
import { FilterPanel } from '@/components/filter-panel'
import {
  APPLICATION_STATUS_OPTIONS,
  countJobMatchScore,
  formatSalaryRange,
  normalizeApplicationStatus,
} from '@/lib/recruitment'

type Application = {
  id: string
  status: string
  created_at: string
  jobs: {
    id: string
    title: string
    location: string | null
    job_type: string | null
    salary_min: number | null
    salary_max: number | null
    deadline: string | null
    companies: {
      id: string
      name: string
      admin_id: string
      logo_url: string | null
    }
  }
}

type JobMatch = {
  id: string
  title: string
  location: string | null
  job_type: string | null
  salary_min: number | null
  salary_max: number | null
  deadline: string | null
  description: string
  requirements: string[]
  companies: {
    id: string
    name: string
    industry: string | null
  }
  matchScore: number
}

type CommunityPayload = {
  reviews: any[]
  stories: any[]
  insights: any[]
}

const STATUS_FILTERS = [{ value: 'all', label: 'All activity' }, ...APPLICATION_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'company', label: 'Company A-Z' },
  { value: 'role', label: 'Role A-Z' },
]

export default function StudentDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [matchedJobs, setMatchedJobs] = useState<JobMatch[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [community, setCommunity] = useState<CommunityPayload>({ reviews: [], stories: [], insights: [] })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()
  const [userId, setUserId] = useState<string>()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/auth/login')
          return
        }

        setUserId(authUser.id)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        const [profileResult, studentResult, applicationsResponse, jobsResponse, messagesResponse, communityResponse, existingMatchNotifications] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', authUser.id).single(),
          supabase.from('student_profiles').select('skills').eq('id', authUser.id).maybeSingle(),
          fetch(`/api/applications?studentId=${authUser.id}`, {
            headers: { Authorization: `Bearer ${session?.access_token || ''}` },
          }),
          fetch('/api/jobs'),
          fetch('/api/messages', {
            headers: { Authorization: `Bearer ${session?.access_token || ''}` },
          }),
          fetch('/api/community'),
          supabase
            .from('notifications')
            .select('entity_id')
            .eq('user_id', authUser.id)
            .eq('type', 'job_match'),
        ])

        setUserName(profileResult.data?.full_name || authUser.email || undefined)

        let loadedApplications: Application[] = []
        if (applicationsResponse.ok) {
          const payload = await applicationsResponse.json()
          loadedApplications = payload.applications || []
          setApplications(loadedApplications)
        }

        let loadedJobs: JobMatch[] = []
        if (jobsResponse.ok) {
          const payload = await jobsResponse.json()
          const appliedJobIds = new Set(
            loadedApplications.map((application) => application.jobs?.id).filter(Boolean)
          )
          loadedJobs = (payload.jobs || [])
            .map((job: any) => ({
              ...job,
              matchScore: countJobMatchScore(studentResult.data?.skills || [], job.requirements || []),
            }))
            .filter((job: JobMatch) => !appliedJobIds.has(job.id) && job.matchScore > 0)
            .sort((left: JobMatch, right: JobMatch) => right.matchScore - left.matchScore)

          setMatchedJobs(loadedJobs.slice(0, 4))
        }

        if (messagesResponse.ok) {
          const payload = await messagesResponse.json()
          setMessages(payload.messages || [])
        }

        if (communityResponse.ok) {
          setCommunity(await communityResponse.json())
        }

        const existingNotificationIds = new Set((existingMatchNotifications.data || []).map((item) => item.entity_id))
        const newMatches = loadedJobs.filter((job) => !existingNotificationIds.has(job.id)).slice(0, 2)

        if (newMatches.length > 0) {
          await supabase.from('notifications').insert(
            newMatches.map((job) => ({
              user_id: authUser.id,
              title: 'New job match',
              message: `${job.title} at ${job.companies.name} matches your profile.`,
              type: 'job_match',
              entity_id: job.id,
              action_url: `/browse/${job.id}`,
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching student dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('newest')
  }

  const visibleApplications = useMemo(() => {
    return [...applications]
      .filter((application) => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        const normalizedStatus = normalizeApplicationStatus(application.status)
        const matchesSearch =
          !normalizedQuery ||
          application.jobs.title.toLowerCase().includes(normalizedQuery) ||
          application.jobs.companies.name.toLowerCase().includes(normalizedQuery)

        const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((left, right) => {
        if (sortBy === 'oldest') {
          return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
        }
        if (sortBy === 'company') {
          return left.jobs.companies.name.localeCompare(right.jobs.companies.name)
        }
        if (sortBy === 'role') {
          return left.jobs.title.localeCompare(right.jobs.title)
        }
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      })
  }, [applications, searchQuery, sortBy, statusFilter])

  const activeApplications = applications.filter((application) =>
    ['under_review', 'shortlisted', 'interview_scheduled'].includes(normalizeApplicationStatus(application.status))
  ).length
  const waitingApplications = applications.filter((application) =>
    ['applied', 'under_review'].includes(normalizeApplicationStatus(application.status))
  ).length
  const completedApplications = applications.filter((application) =>
    ['accepted', 'rejected'].includes(normalizeApplicationStatus(application.status))
  ).length
  const recentMessages = messages
    .slice(-4)
    .reverse()
    .map((message) => ({
      id: message.id,
      senderName: message.sender?.full_name || message.sender?.email || 'Unknown sender',
      recipientName: message.recipient?.full_name || message.recipient?.email || 'Unknown recipient',
      subject: message.subject,
      body: message.body,
      createdAt: message.created_at,
      read: message.read,
    }))
  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'all' || sortBy !== 'newest'

  if (loading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="student" userName={userName} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="student" userName={userName} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <BackButton fallbackHref="/" className="rounded-full" />
            <Button asChild className="rounded-full">
              <Link href="/browse">
                Browse new roles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Student dashboard
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                Run your job search like a structured pipeline.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Manage applications, talk to recruiters, and keep an eye on new roles that match your skills.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <DashboardStatCard icon={FileStack} value={applications.length} label="Applications" helper="Tracked end to end" />
              <DashboardStatCard icon={TrendingUp} value={activeApplications} label="In progress" helper="Shortlists and reviews" />
              <DashboardStatCard icon={Clock3} value={waitingApplications} label="Awaiting review" helper="Waiting on recruiter action" />
              <DashboardStatCard icon={Compass} value={matchedJobs.length} label="Profile matches" helper="Recommended openings" />
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Primary actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The next workflows most students need right away.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                href="/browse"
                icon={Compass}
                eyebrow="Discover"
                title="Find opportunities"
                description="Explore roles, salary ranges, deadlines, and requirements."
              />
              <ActionCard
                href="/profile"
                icon={UserCircle2}
                eyebrow="Profile"
                title="Strengthen your profile"
                description="Keep skills, resume links, projects, and experience recruiter-ready."
              />
              <ActionCard
                href="/community"
                icon={Sparkles}
                eyebrow="Learn"
                title="Study hiring insights"
                description="Read company reviews, outcomes, and success stories."
              />
            </div>
          </section>

          <InboxPreview
            title="Inbox preview"
            description="Recent recruiter messages and conversation updates."
            messages={recentMessages}
            href="/messages"
          />
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Matched jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Opportunities that overlap with your current skill profile.
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/browse">View all jobs</Link>
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {matchedJobs.length > 0 ? (
              matchedJobs.map((job) => (
                <Card key={job.id} className="rounded-[1.75rem] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.companies.name}
                        {job.companies.industry ? `, ${job.companies.industry}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground">
                      {job.matchScore}% match
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.slice(0, 4).map((requirement) => (
                      <span key={requirement} className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
                        {requirement}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{job.location || 'Flexible location'}</span>
                    <span>{job.job_type || 'Role type not specified'}</span>
                    <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="mt-5">
                    <Button asChild className="rounded-full">
                      <Link href={`/browse/${job.id}`}>View role</Link>
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="rounded-[1.75rem] p-8 text-center xl:col-span-2">
                <p className="text-lg font-semibold text-foreground">No personalized matches yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add more skills and project details to your profile to improve job matching.
                </p>
              </Card>
            )}
          </div>
        </div>

        <FilterPanel
          title="Filter your application pipeline"
          description="Search by role or company, narrow by stage, and keep the list focused."
          searchValue={searchQuery}
          searchPlaceholder="Search by role or company..."
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        >
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Stage
            </p>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 w-full rounded-full border border-border/70 bg-background/80 px-4 text-sm text-foreground"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Sort
            </p>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full rounded-full border border-border/70 bg-background/80 px-4 text-sm text-foreground"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FilterPanel>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleApplications.length === 1
              ? '1 application visible'
              : `${visibleApplications.length} applications visible`}
          </p>
          <p className="text-sm text-muted-foreground">
            {completedApplications} completed, {waitingApplications} waiting, {activeApplications} active
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {visibleApplications.length === 0 ? (
            <Card className="col-span-full rounded-[1.75rem] p-8 text-center">
              <p className="text-lg font-semibold text-foreground">No applications match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reset filters or browse more roles to build out your pipeline.
              </p>
            </Card>
          ) : (
            visibleApplications.map((application) => (
              <Card key={application.id} className="interactive-card rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{application.jobs.title}</h3>
                    <p className="text-sm text-muted-foreground">{application.jobs.companies.name}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{application.jobs.location || 'Flexible location'}</span>
                  <span>{application.jobs.job_type || 'Role type not specified'}</span>
                  <span>{formatSalaryRange(application.jobs.salary_min, application.jobs.salary_max)}</span>
                  {application.jobs.deadline ? (
                    <span>Apply by {new Date(application.jobs.deadline).toLocaleDateString()}</span>
                  ) : null}
                </div>

                <div className="mt-5">
                  <ApplicationProgress status={application.status} />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href={`/browse/${application.jobs.id}`}>View role</Link>
                  </Button>
                  {application.jobs.companies.admin_id ? (
                    <MessageComposer
                      applicationId={application.id}
                      recipientId={application.jobs.companies.admin_id}
                      recipientLabel={application.jobs.companies.name}
                      defaultSubject={`Regarding ${application.jobs.title}`}
                    />
                  ) : null}
                </div>
              </Card>
            ))
          )}
        </div>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Career insights</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Company reviews, success stories, and practical hiring advice.
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/community">Open community</Link>
            </Button>
          </div>

          <CareerInsightsBoard
            reviews={community.reviews}
            stories={community.stories}
            insights={community.insights}
          />
        </section>
      </main>
    </div>
  )
}
