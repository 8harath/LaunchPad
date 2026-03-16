'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  FileClock,
  SearchCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { InboxPreview } from '@/components/inbox-preview'
import { MessageComposer } from '@/components/message-composer'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardStatCard } from '@/components/dashboard-stat-card'
import { ActionCard } from '@/components/action-card'
import { FilterPanel } from '@/components/filter-panel'
import { APPLICATION_STATUS_OPTIONS, JOB_STATUS_OPTIONS, normalizeApplicationStatus } from '@/lib/recruitment'

type Job = {
  id: string
  title: string
  status: string
  created_at: string
  applications?: { id: string; status: string }[]
}

type ApplicantPreview = {
  id: string
  status: string
  created_at: string
  job_id: string
  jobs: {
    id: string
    title: string
    companies: {
      admin_id: string
      name: string
    }
  }
  student_profiles: {
    headline: string | null
    skills: string[]
    profiles: {
      full_name: string
      email: string
    } | null
  } | null
}

const JOB_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'applications', label: 'Most applicants' },
]

export default function CompanyDashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [company, setCompany] = useState<any>(null)
  const [recentApplicants, setRecentApplicants] = useState<ApplicantPreview[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()
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

        const {
          data: { session },
        } = await supabase.auth.getSession()

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single()

        setUserName(profile?.full_name || authUser.email || undefined)

        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('admin_id', authUser.id)
          .single()

        if (!companyData) {
          setLoading(false)
          return
        }

        setCompany(companyData)

        const [jobsResponse, messagesResponse] = await Promise.all([
          fetch(`/api/jobs?companyId=${companyData.id}`),
          fetch('/api/messages', {
            headers: { Authorization: `Bearer ${session?.access_token || ''}` },
          }),
        ])

        let loadedJobs: Job[] = []
        if (jobsResponse.ok) {
          const { jobs: jobData } = await jobsResponse.json()
          loadedJobs = jobData || []
          setJobs(loadedJobs)
        }

        if (messagesResponse.ok) {
          const payload = await messagesResponse.json()
          setMessages(payload.messages || [])
        }

        const applicantResponses = await Promise.all(
          loadedJobs.slice(0, 6).map((job) =>
            fetch(`/api/applications?jobId=${job.id}`, {
              headers: { Authorization: `Bearer ${session?.access_token || ''}` },
            })
          )
        )

        const applicantPayloads = await Promise.all(
          applicantResponses.map(async (response) => (response.ok ? response.json() : { applications: [] }))
        )

        const applicants = applicantPayloads
          .flatMap((payload) => payload.applications || [])
          .sort(
            (left: ApplicantPreview, right: ApplicantPreview) =>
              new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
          )

        setRecentApplicants(applicants.slice(0, 6))
      } catch (error) {
        console.error('Error fetching recruiter dashboard:', error)
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

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    if (!company) {
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const targetJob = jobs.find((job) => job.id === jobId)
    if (!targetJob) {
      return
    }

    const response = await fetch('/api/jobs', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({
        jobId,
        companyId: company.id,
        title: targetJob.title,
        description: '',
        requirements: [],
        status: newStatus,
      }),
    })

    if (response.ok) {
      setJobs((current) =>
        current.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
      )
    }
  }

  const visibleJobs = useMemo(() => {
    return [...jobs]
      .filter((job) => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        const matchesSearch = !normalizedQuery || job.title.toLowerCase().includes(normalizedQuery)
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((left, right) => {
        if (sortBy === 'oldest') {
          return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
        }
        if (sortBy === 'title') {
          return left.title.localeCompare(right.title)
        }
        if (sortBy === 'applications') {
          return (right.applications?.length || 0) - (left.applications?.length || 0)
        }
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      })
  }, [jobs, searchQuery, sortBy, statusFilter])

  const totalApplications = jobs.reduce((total, job) => total + (job.applications?.length || 0), 0)
  const activeJobs = jobs.filter((job) => job.status === 'open').length
  const statusOverview = APPLICATION_STATUS_OPTIONS.reduce<Record<string, number>>((accumulator, option) => {
    accumulator[option.value] = recentApplicants.filter(
      (application) => normalizeApplicationStatus(application.status) === option.value
    ).length
    return accumulator
  }, {})
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
        <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
        <main className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Company profile not found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <BackButton fallbackHref="/" className="rounded-full" />
            <Button asChild className="rounded-full">
              <Link href="/dashboard/company/post-job">
                Post new role
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Recruiter workspace
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                Manage hiring from one structured workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Control role status, review the pipeline, and stay in touch with candidates without losing context.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <DashboardStatCard icon={BriefcaseBusiness} value={jobs.length} label="Jobs posted" helper="All role states" />
              <DashboardStatCard icon={Users} value={totalApplications} label="Applicants" helper="Across your openings" />
              <DashboardStatCard icon={FileClock} value={activeJobs} label="Open roles" helper="Currently hiring" />
              <DashboardStatCard icon={SearchCheck} value={recentApplicants.length} label="Recent applicants" helper="Latest candidate activity" />
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Primary actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The main workflows recruiters typically need after logging in.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                href="/dashboard/company/post-job"
                icon={BriefcaseBusiness}
                eyebrow="Create"
                title="Post a new role"
                description="Open a fresh position with requirements, salary, and deadline."
              />
              <ActionCard
                href={jobs[0] ? `/dashboard/company/applications/${jobs[0].id}` : '/dashboard/company'}
                icon={SearchCheck}
                eyebrow="Review"
                title="Review applicants"
                description="Open candidate pipelines and move promising applicants forward."
              />
              <ActionCard
                href="/profile"
                icon={Users}
                eyebrow="Brand"
                title="Update company profile"
                description="Improve candidate trust with a strong company profile."
              />
            </div>
          </section>

          <InboxPreview
            title="Messaging inbox"
            description="Recent candidate conversations and follow-ups."
            messages={recentMessages}
            href="/messages"
          />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {APPLICATION_STATUS_OPTIONS.map((option) => (
            <Card key={option.value} className="rounded-[1.5rem] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{option.label}</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{statusOverview[option.value] || 0}</p>
            </Card>
          ))}
        </div>

        <FilterPanel
          title="Manage your role list"
          description="Search roles, filter by status, and sort by activity to keep hiring organized."
          searchValue={searchQuery}
          searchPlaceholder="Search posted roles..."
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        >
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </p>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-background/80">
                <SelectValue placeholder="All jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                {JOB_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Sort
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-background/80">
                <SelectValue placeholder="Newest first" />
              </SelectTrigger>
              <SelectContent>
                {JOB_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FilterPanel>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleJobs.length === 1 ? '1 role visible' : `${visibleJobs.length} roles visible`}
          </p>
          <p className="text-sm text-muted-foreground">
            {totalApplications} applicants across {activeJobs} active roles
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {visibleJobs.length === 0 ? (
            <Card className="col-span-full rounded-[1.75rem] p-8 text-center">
              <p className="text-lg font-semibold text-foreground">No jobs match the current filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reset filters or create a new role to keep the pipeline moving.
              </p>
            </Card>
          ) : (
            visibleJobs.map((job) => (
              <Card key={job.id} className="interactive-card rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.applications?.length || 0} applicants
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Role status
                  </p>
                  <Select value={job.status} onValueChange={(value) => void handleJobStatusChange(job.id, value)}>
                    <SelectTrigger className="mt-3 h-11 rounded-full border-border/70 bg-background/80">
                      <SelectValue placeholder="Choose status" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href={`/dashboard/company/applications/${job.id}`}>Review candidates</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href={`/dashboard/company/post-job?jobId=${job.id}`}>Edit role</Link>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent candidates</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The latest applicants across your most recent roles.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {recentApplicants.length > 0 ? (
              recentApplicants.map((application) => (
                <Card key={application.id} className="rounded-[1.75rem] p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {application.student_profiles?.profiles?.full_name || 'Unnamed candidate'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.jobs.title}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                  {application.student_profiles?.headline ? (
                    <p className="mt-3 text-sm text-foreground">{application.student_profiles.headline}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(application.student_profiles?.skills || []).slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button asChild className="rounded-full">
                      <Link href={`/dashboard/company/applications/${application.job_id}`}>Open candidate</Link>
                    </Button>
                    {application.student_profiles?.profiles ? (
                      <MessageComposer
                        applicationId={application.id}
                        recipientId={application.student_profiles.profiles.email ? application.student_profiles.profiles.email : ''}
                        recipientLabel={application.student_profiles.profiles.full_name}
                        buttonLabel="Message"
                      />
                    ) : null}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="rounded-[1.75rem] p-8 text-center xl:col-span-2">
                <p className="text-lg font-semibold text-foreground">No recent applicants yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  New candidates will appear here as soon as they apply to one of your roles.
                </p>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
