'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FileStack,
  ListFilter,
  SearchCheck,
  Sparkles,
  UserCircle2,
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

type Application = {
  id: string
  status: string
  created_at: string
  jobs: {
    id: string
    title: string
    companies: {
      id: string
      name: string
      logo_url: string | null
    }
  }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All activity' },
  { value: 'active', label: 'In progress' },
  { value: 'waiting', label: 'Awaiting review' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'company', label: 'Company A-Z' },
  { value: 'role', label: 'Role A-Z' },
]

function matchesStatusGroup(status: string, filter: string) {
  if (filter === 'all') return true
  if (filter === 'active') {
    return ['reviewing', 'reviewed', 'shortlisted', 'accepted', 'offer_extended'].includes(status)
  }
  if (filter === 'waiting') {
    return ['pending', 'reviewing', 'reviewed'].includes(status)
  }
  if (filter === 'completed') {
    return ['rejected', 'accepted', 'offer_extended'].includes(status)
  }
  return true
}

export default function StudentDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
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

        const response = await fetch(`/api/applications?studentId=${authUser.id}`)
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

  const visibleApplications = [...applications]
    .filter((application) => {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !normalizedQuery ||
        application.jobs.title.toLowerCase().includes(normalizedQuery) ||
        application.jobs.companies.name.toLowerCase().includes(normalizedQuery)

      return matchesSearch && matchesStatusGroup(application.status, statusFilter)
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

  const recentApplications = visibleApplications.slice(0, 3)
  const activeApplications = applications.filter((application) =>
    ['reviewing', 'reviewed', 'shortlisted', 'accepted', 'offer_extended'].includes(application.status)
  ).length
  const waitingApplications = applications.filter((application) =>
    ['pending', 'reviewing', 'reviewed'].includes(application.status)
  ).length
  const completedApplications = applications.filter((application) =>
    ['accepted', 'offer_extended', 'rejected'].includes(application.status)
  ).length
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
                Manage your applications like a real job search pipeline.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Jump into the next action, keep your profile current, and track which roles are moving.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DashboardStatCard icon={FileStack} value={applications.length} label="Applications" helper="Tracked end to end" />
              <DashboardStatCard icon={BriefcaseBusiness} value={activeApplications} label="Active progress" helper="Reviewing and shortlisted" />
              <DashboardStatCard icon={Clock3} value={waitingApplications} label="Awaiting review" helper="Pending recruiter action" />
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Primary actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The main workflows you are likely to use next.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                href="/browse"
                icon={SearchCheck}
                eyebrow="Discover"
                title="Find opportunities"
                description="Explore current openings with filters and role details."
              />
              <ActionCard
                href="/profile"
                icon={UserCircle2}
                eyebrow="Profile"
                title="Update your profile"
                description="Keep your resume links, skills, and bio recruiter-ready."
              />
              <ActionCard
                href="/dashboard/student"
                icon={ListFilter}
                eyebrow="Track"
                title="Review application statuses"
                description="Check what needs attention and where you are advancing."
              />
            </div>
          </section>

          <Card className="rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Recent activity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A quick summary of your latest application movement.
                </p>
              </div>
              <StatusBadge status={completedApplications > 0 ? 'accepted' : 'pending'} />
            </div>

            <div className="mt-5 space-y-3">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{application.jobs.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.jobs.companies.name}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Applied {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                  No applications yet. Start with the browse page to build your pipeline.
                </div>
              )}
            </div>
          </Card>
        </div>

        <FilterPanel
          title="Filter your pipeline"
          description="Search by role or company, narrow by progress stage, and sort the list instantly."
          searchValue={searchQuery}
          searchPlaceholder="Search by role or company..."
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
                <SelectValue placeholder="All activity" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
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
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

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
                Reset filters or browse more roles to build out your application pipeline.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button asChild>
                  <Link href="/browse">Browse roles</Link>
                </Button>
                <Button variant="outline" className="rounded-full" onClick={handleResetFilters}>
                  Reset filters
                </Button>
              </div>
            </Card>
          ) : (
            visibleApplications.map((application) => (
              <Card key={application.id} className="interactive-card rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {application.jobs.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {application.jobs.companies.name}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Activity
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    Applied on {new Date(application.created_at).toLocaleDateString()}.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href={`/browse/${application.jobs.id}`}>View role</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href="/profile">Update profile</Link>
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
