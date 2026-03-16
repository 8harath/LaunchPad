'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BriefcaseBusiness,
  Building2,
  MapPinned,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { DashboardStatCard } from '@/components/dashboard-stat-card'
import { FilterPanel } from '@/components/filter-panel'

type BrowseJob = {
  id: string
  title: string
  description: string
  location: string | null
  job_type: string | null
  created_at: string
  requirements: string[] | null
  companies: {
    id: string
    name: string
    logo_url: string | null
    location: string | null
    industry: string | null
  }
  applications?: { id: string; status: string }[]
}

const ALL_JOB_TYPES = '__all_job_types__'
const ALL_LOCATIONS = '__all_locations__'
const ALL_INDUSTRIES = '__all_industries__'
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'company', label: 'Company A-Z' },
  { value: 'title', label: 'Role A-Z' },
]

export default function BrowseJobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobType, setJobType] = useState<string>(ALL_JOB_TYPES)
  const [location, setLocation] = useState<string>(ALL_LOCATIONS)
  const [industry, setIndustry] = useState<string>(ALL_INDUSTRIES)
  const [sortBy, setSortBy] = useState('newest')
  const [jobs, setJobs] = useState<BrowseJob[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()
  const [userRole, setUserRole] = useState<string | undefined>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single()

          setUserName(profile?.full_name || user.email || undefined)
          setUserRole(profile?.role || undefined)
        }

        const response = await fetch('/api/jobs')
        if (response.ok) {
          const { jobs: apiJobs } = await response.json()
          setJobs(apiJobs || [])
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleResetFilters = () => {
    setSearchQuery('')
    setJobType(ALL_JOB_TYPES)
    setLocation(ALL_LOCATIONS)
    setIndustry(ALL_INDUSTRIES)
    setSortBy('newest')
  }

  const availableLocations = Array.from(
    new Set(jobs.map((job) => job.location).filter(Boolean) as string[])
  ).sort((left, right) => left.localeCompare(right))

  const availableIndustries = Array.from(
    new Set(jobs.map((job) => job.companies?.industry).filter(Boolean) as string[])
  ).sort((left, right) => left.localeCompare(right))

  const visibleJobs = [...jobs]
    .filter((job) => {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const normalizedRequirements = (job.requirements || []).join(' ').toLowerCase()
      const matchesSearch =
        !normalizedQuery ||
        job.title.toLowerCase().includes(normalizedQuery) ||
        job.companies.name.toLowerCase().includes(normalizedQuery) ||
        job.description.toLowerCase().includes(normalizedQuery) ||
        normalizedRequirements.includes(normalizedQuery)

      const matchesJobType = jobType === ALL_JOB_TYPES || (job.job_type || '') === jobType
      const matchesLocation = location === ALL_LOCATIONS || (job.location || '') === location
      const matchesIndustry =
        industry === ALL_INDUSTRIES || (job.companies?.industry || '') === industry

      return matchesSearch && matchesJobType && matchesLocation && matchesIndustry
    })
    .sort((left, right) => {
      if (sortBy === 'oldest') {
        return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
      }
      if (sortBy === 'company') {
        return left.companies.name.localeCompare(right.companies.name)
      }
      if (sortBy === 'title') {
        return left.title.localeCompare(right.title)
      }
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    jobType !== ALL_JOB_TYPES ||
    location !== ALL_LOCATIONS ||
    industry !== ALL_INDUSTRIES ||
    sortBy !== 'newest'

  const filterBadges = [
    jobType !== ALL_JOB_TYPES ? `Type: ${jobType}` : null,
    location !== ALL_LOCATIONS ? `Location: ${location}` : null,
    industry !== ALL_INDUSTRIES ? `Industry: ${industry}` : null,
    sortBy !== 'newest'
      ? `Sorted: ${SORT_OPTIONS.find((option) => option.value === sortBy)?.label || sortBy}`
      : null,
  ].filter(Boolean) as string[]

  return (
    <main className="ambient-page min-h-screen bg-background">
      <Navbar userRole={userRole} userName={userName} />

      <section className="px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="page-hero reveal-up rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" />
                  Explore roles
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  Browse opportunities with <span className="text-gradient">real filtering and quick scanning</span>.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Search, sort, and narrow the list dynamically so the browse experience feels like a production hiring product.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <DashboardStatCard icon={BriefcaseBusiness} value={jobs.length} label="Open roles" helper="Pulled from live job data" />
                <DashboardStatCard icon={MapPinned} value={availableLocations.length || 0} label="Locations" helper="Office and remote options" />
                <DashboardStatCard icon={Building2} value={availableIndustries.length || 0} label="Industries" helper="Filter by company domain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <FilterPanel
          title="Refine the opportunity list"
          description="Every filter updates instantly and can be cleared in one click."
          searchValue={searchQuery}
          searchPlaceholder="Search by role, company, or skills..."
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        >
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Job type
            </p>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-background/80">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_JOB_TYPES}>All types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Location
            </p>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-background/80">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS}>All locations</SelectItem>
                {availableLocations.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Category
            </p>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-background/80">
                <SelectValue placeholder="Any industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_INDUSTRIES}>All industries</SelectItem>
                {availableIndustries.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filterBadges.length > 0 ? (
              filterBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {badge}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-xs text-muted-foreground">
                No extra filters applied
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {visibleJobs.length === 1 ? '1 role visible' : `${visibleJobs.length} roles visible`}
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <Card className="rounded-[1.75rem] p-8 text-center">
              <p className="text-muted-foreground">Loading jobs...</p>
            </Card>
          ) : visibleJobs.length > 0 ? (
            <div className="grid gap-4">
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.companies?.name || 'Unknown company'}
                  description={job.description}
                  location={job.location || 'Location not specified'}
                  jobType={job.job_type || 'Not specified'}
                  postedDate={new Date(job.created_at).toLocaleDateString()}
                  skills={job.requirements || []}
                  applicants={job.applications?.length || 0}
                />
              ))}
            </div>
          ) : (
            <div className="paper rounded-[1.75rem] border border-border/80 p-12 text-center">
              <div className="mx-auto icon-chip h-14 w-14">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">No roles match the current filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try broadening the search or clear filters to return to the full opportunity list.
              </p>
              <Button variant="outline" className="mt-5 rounded-full" onClick={handleResetFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
