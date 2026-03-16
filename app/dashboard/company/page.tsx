'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileClock,
  LayoutList,
  SearchCheck,
  Sparkles,
  Users,
} from 'lucide-react'
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
import { ActionCard } from '@/components/action-card'
import { FilterPanel } from '@/components/filter-panel'

type Job = {
  id: string
  title: string
  status: string
  created_at: string
  applications?: { id: string }[]
}

const JOB_STATUS_OPTIONS = [
  { value: 'all', label: 'All jobs' },
  { value: 'open', label: 'Open roles' },
  { value: 'closed', label: 'Closed roles' },
  { value: 'filled', label: 'Filled roles' },
]

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

        if (companyData) {
          setCompany(companyData)

          const response = await fetch(`/api/jobs?companyId=${companyData.id}`)
          if (response.ok) {
            const { jobs: jobData } = await response.json()
            setJobs(jobData || [])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
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

  const visibleJobs = [...jobs]
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

  const totalApplications = jobs.reduce((total, job) => total + (job.applications?.length || 0), 0)
  const activeJobs = jobs.filter((job) => job.status === 'open').length
  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'all' || sortBy !== 'newest'
  const recentJobs = visibleJobs.slice(0, 3)

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
                Run hiring from one structured dashboard.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Post roles, monitor response, and route into candidate review without losing context.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DashboardStatCard icon={BriefcaseBusiness} value={jobs.length} label="Jobs posted" helper="All role states" />
              <DashboardStatCard icon={Users} value={totalApplications} label="Applicants" helper="Across every posting" />
              <DashboardStatCard icon={FileClock} value={activeJobs} label="Open roles" helper="Currently hiring" />
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Primary actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The workflows recruiters typically need right after logging in.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                href="/dashboard/company/post-job"
                icon={BriefcaseBusiness}
                eyebrow="Create"
                title="Post a new role"
                description="Publish a fresh opening with requirements, salary, and deadline."
              />
              <ActionCard
                href={recentJobs[0] ? `/dashboard/company/applications/${recentJobs[0].id}` : '/dashboard/company'}
                icon={SearchCheck}
                eyebrow="Review"
                title="Review candidates"
                description="Open the applicant pipeline and move promising candidates forward."
              />
              <ActionCard
                href="/profile"
                icon={Building2}
                eyebrow="Manage"
                title="Update company profile"
                description="Keep company details polished for candidates before they apply."
              />
            </div>
          </section>

          <Card className="rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Recent job activity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your latest roles and their current demand.
                </p>
              </div>
              <StatusBadge status={activeJobs > 0 ? 'open' : 'closed'} />
            </div>

            <div className="mt-5 space-y-3">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.applications?.length || 0} applicants
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                  No jobs posted yet. Start by creating your first role.
                </div>
              )}
            </div>
          </Card>
        </div>

        <FilterPanel
          title="Manage your hiring pipeline"
          description="Search jobs, filter by status, and sort by recency or candidate volume."
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

        <div className="mt-5 flex flex-wrap gap-3">
          {JOB_STATUS_OPTIONS.map((option) => (
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
            {visibleJobs.length === 1 ? '1 job visible' : `${visibleJobs.length} jobs visible`}
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
                Reset filters or create a new role to keep your pipeline moving.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button asChild>
                  <Link href="/dashboard/company/post-job">Post a role</Link>
                </Button>
                <Button variant="outline" className="rounded-full" onClick={handleResetFilters}>
                  Reset filters
                </Button>
              </div>
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
                    Posting activity
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    Posted on {new Date(job.created_at).toLocaleDateString()} with{' '}
                    {job.applications?.length || 0} submitted applications.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href={`/dashboard/company/applications/${job.id}`}>Review candidates</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href="/dashboard/company/post-job">Create another role</Link>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
