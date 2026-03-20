'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ExternalLink, FileStack, Sparkles, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardStatCard } from '@/components/dashboard-stat-card'
import { FilterPanel } from '@/components/filter-panel'
import { APPLICATION_STATUS_OPTIONS, normalizeApplicationStatus } from '@/lib/recruitment'

type Application = {
  id: string
  student_id: string
  status: string
  resume_url: string | null
  cover_letter: string | null
  created_at: string
  student_profiles: {
    university: string | null
    major: string | null
    graduation_year: number | null
    headline: string | null
    location: string | null
    current_title: string | null
    current_company: string | null
    years_of_experience: number | null
    experience_summary: string | null
    project_highlights: string | null
    certifications: string[]
    languages: string[]
    availability_notice_period: string | null
    skills: string[]
    preferred_job_types: string[]
    expected_salary_min: number | null
    expected_salary_max: number | null
    resume_url: string | null
    github_url: string | null
    linkedin_url: string | null
    portfolio_url: string | null
    twitter_url: string | null
    instagram_url: string | null
    leetcode_url: string | null
    devfolio_url: string | null
    profiles: {
      id: string
      full_name: string
      email: string
      bio: string | null
      avatar_url: string | null
    } | null
  } | null
}

const REVIEW_STATUS_OPTIONS = [
  { value: 'all', label: 'All candidates' },
  ...APPLICATION_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Candidate A-Z' },
]

export default function ApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const jobId = params.jobId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        setUserName(profile?.full_name || user.email || undefined)

        const { data: jobData } = await supabase
          .from('jobs')
          .select('*, companies(*)')
          .eq('id', jobId)
          .single()

        const jobRecord = jobData as any

        if (jobRecord) {
          setJob(jobRecord)
          if (jobRecord.companies.admin_id !== user.id) {
            router.push('/dashboard/company')
            return
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()
        const response = await fetch(`/api/applications?jobId=${jobId}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
        })
        if (response.ok) {
          const { applications: applicationData } = await response.json()
          setApplications(applicationData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setApplications((current) =>
          current.map((application) =>
            application.id === applicationId ? { ...application, status: newStatus } : application
          )
        )
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('newest')
  }

  const visibleApplications = [...applications]
    .filter((application) => {
      const candidate = application.student_profiles?.profiles
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const normalizedSkills = (application.student_profiles?.skills || []).join(' ').toLowerCase()
      const headline = application.student_profiles?.headline?.toLowerCase() || ''

      const matchesSearch =
        !normalizedQuery ||
        candidate?.full_name?.toLowerCase().includes(normalizedQuery) ||
        candidate?.email?.toLowerCase().includes(normalizedQuery) ||
        headline.includes(normalizedQuery) ||
        normalizedSkills.includes(normalizedQuery)

      const matchesStatus = statusFilter === 'all' || normalizeApplicationStatus(application.status) === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((left, right) => {
      if (sortBy === 'oldest') {
        return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
      }
      if (sortBy === 'name') {
        return (left.student_profiles?.profiles?.full_name || '').localeCompare(
          right.student_profiles?.profiles?.full_name || ''
        )
      }
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })

  const inReview = applications.filter((application) => normalizeApplicationStatus(application.status) === 'under_review').length
  const advanced = applications.filter((application) =>
    ['shortlisted', 'interview_scheduled', 'accepted'].includes(normalizeApplicationStatus(application.status))
  ).length
  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'all' || sortBy !== 'newest'

  const handleOpenConversation = async (applicationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId }),
      })

      if (!response.ok) {
        return
      }

      const conversation = await response.json()
      router.push(`/messages?conversationId=${conversation.id}`)
    } catch (error) {
      console.error('Error opening conversation:', error)
    }
  }
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

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <BackButton fallbackHref="/dashboard/company" className="mb-4 rounded-full" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Candidate review
              </div>
              <h1 className="mb-2 mt-4 text-4xl font-bold text-foreground">
                Applications for {job?.title}
              </h1>
              <p className="text-muted-foreground">
                Screen candidates, open supporting links, and update hiring status without leaving the workflow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <DashboardStatCard icon={Users} value={applications.length} label="Applicants" helper="All submitted candidates" />
              <DashboardStatCard icon={FileStack} value={inReview} label="In review" helper="Currently being assessed" />
              <DashboardStatCard icon={Sparkles} value={advanced} label="Advanced" helper="Accepted or offer stage" />
            </div>
          </div>
        </div>

        <FilterPanel
          title="Filter the candidate pipeline"
          description="Search by name, email, headline, or skill and sort the review list in real time."
          searchValue={searchQuery}
          searchPlaceholder="Search by candidate, email, or skill..."
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
                <SelectValue placeholder="All candidates" />
              </SelectTrigger>
              <SelectContent>
                {REVIEW_STATUS_OPTIONS.map((option) => (
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
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FilterPanel>

        <div className="mt-5 flex flex-wrap gap-3">
          {REVIEW_STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={statusFilter === option.value ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleApplications.length === 1
              ? '1 candidate visible'
              : `${visibleApplications.length} candidates visible`}
          </p>
          <p className="text-sm text-muted-foreground">
            {inReview} in review, {advanced} advanced
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {visibleApplications.length === 0 ? (
            <Card className="rounded-[1.75rem] p-8 text-center">
              <p className="text-lg font-semibold text-foreground">No candidates match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reset filters to return to the full applicant list.
              </p>
              <Button variant="outline" className="mt-5 rounded-full" onClick={handleResetFilters}>
                Reset filters
              </Button>
            </Card>
          ) : (
            visibleApplications.map((application) => {
              const candidate = application.student_profiles?.profiles
              const profile = application.student_profiles

              return (
                <Card key={application.id} className="interactive-card rounded-[1.75rem] p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {candidate?.full_name || 'Unnamed candidate'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate?.email || 'No email available'}
                          </p>
                          {profile?.headline ? (
                            <p className="mt-2 text-sm text-foreground">{profile.headline}</p>
                          ) : null}
                        </div>
                        <StatusBadge status={application.status} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {profile?.university ? (
                          <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5">
                            {profile.university}
                            {profile.major ? `, ${profile.major}` : ''}
                          </span>
                        ) : null}
                        {profile?.location ? (
                          <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5">
                            {profile.location}
                          </span>
                        ) : null}
                        {profile?.current_title ? (
                          <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5">
                            {profile.current_title}
                          </span>
                        ) : null}
                        {profile?.years_of_experience !== null && profile?.years_of_experience !== undefined ? (
                          <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5">
                            {profile.years_of_experience} years experience
                          </span>
                        ) : null}
                        {profile?.availability_notice_period ? (
                          <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5">
                            {profile.availability_notice_period}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-full rounded-[1.25rem] border border-border/70 bg-background/80 p-4 lg:w-72">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Update status
                      </p>
                      <Select value={application.status} onValueChange={(value) => handleStatusChange(application.id, value)}>
                        <SelectTrigger className="mt-3 h-11 w-full rounded-full border-border/70 bg-background/80">
                          <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="under_review">Under review</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interview_scheduled">Interview scheduled</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {candidate?.bio ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Profile summary</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{candidate.bio}</p>
                      </div>
                    ) : null}

                    {profile?.experience_summary ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Experience</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{profile.experience_summary}</p>
                      </div>
                    ) : null}

                    {profile?.project_highlights ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Projects</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{profile.project_highlights}</p>
                      </div>
                    ) : null}

                    {application.cover_letter ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Cover letter</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{application.cover_letter}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => void handleOpenConversation(application.id)}
                    >
                      Open Messages
                    </Button>
                    {(application.resume_url || profile?.resume_url) ? (
                      <a
                        href={application.resume_url || profile?.resume_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/60"
                      >
                        View resume
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    {profile?.github_url ? <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/60">GitHub</a> : null}
                    {profile?.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/60">LinkedIn</a> : null}
                    {profile?.portfolio_url ? <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/60">Portfolio</a> : null}
                    {profile?.leetcode_url ? <a href={profile.leetcode_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/60">LeetCode</a> : null}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {profile?.skills?.length ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Skills</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profile.skills.slice(0, 6).map((skill) => (
                            <span key={skill} className="rounded-full bg-accent/70 px-2.5 py-1 text-xs text-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {profile?.certifications?.length ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Certifications</p>
                        <p className="mt-2 text-sm text-muted-foreground">{profile.certifications.join(', ')}</p>
                      </div>
                    ) : null}

                    {profile?.languages?.length ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Languages</p>
                        <p className="mt-2 text-sm text-muted-foreground">{profile.languages.join(', ')}</p>
                      </div>
                    ) : null}

                    {(profile?.expected_salary_min || profile?.expected_salary_max) ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                        <p className="text-sm font-semibold text-foreground">Compensation</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {profile.expected_salary_min ? `INR ${profile.expected_salary_min.toLocaleString()}` : 'Flexible'}
                          {profile.expected_salary_max ? ` - INR ${profile.expected_salary_max.toLocaleString()}` : ''}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
