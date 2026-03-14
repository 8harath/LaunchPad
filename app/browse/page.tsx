'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

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

export default function BrowseJobsPage() {
  const ALL_JOB_TYPES = '__all_job_types__'
  const ALL_LOCATIONS = '__all_locations__'
  const [searchQuery, setSearchQuery] = useState('')
  const [jobType, setJobType] = useState<string>(ALL_JOB_TYPES)
  const [location, setLocation] = useState<string>(ALL_LOCATIONS)
  const [hasFilters, setHasFilters] = useState(false)
  const [jobs, setJobs] = useState<BrowseJob[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()
  const [userRole, setUserRole] = useState<string | undefined>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user for navbar (if logged in)
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

        // Fetch jobs from API
        const params = new URLSearchParams()
        if (searchQuery) params.set('title', searchQuery)
        if (location !== ALL_LOCATIONS) params.set('location', location)

        const response = await fetch(`/api/jobs?${params.toString()}`)
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
  }, [searchQuery, location])

  const filteredJobs = jobs.filter((job) => {
    const jobCompany = job.companies?.name || ''
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())

    const normalizedJobType = job.job_type || ''
    const matchesJobType = jobType === ALL_JOB_TYPES || normalizedJobType === jobType

    const jobLocation = job.location || ''
    const matchesLocation = location === ALL_LOCATIONS || jobLocation.includes(location)

    return matchesSearch && matchesJobType && matchesLocation
  })

  const handleResetFilters = () => {
    setSearchQuery('')
    setJobType(ALL_JOB_TYPES)
    setLocation(ALL_LOCATIONS)
    setHasFilters(false)
    // Jobs will refetch due to effect dependencies
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userRole={userRole} userName={userName} />

      {/* Header */}
      <section className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-semibold mb-3 text-foreground">Browse opportunities</h1>
          <p className="text-muted-foreground">
            Discover {jobs.length} job opportunities waiting for you
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="space-y-4 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">Filters</h3>
                {hasFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="border border-border/50 rounded-md p-4 space-y-4 bg-muted/20">
                {/* Job Type Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Job Type</Label>
                  <Select value={jobType} onValueChange={(value) => {
                    setJobType(value)
                    setHasFilters(true)
                  }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_JOB_TYPES}>All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Location</Label>
                  <Select value={location} onValueChange={(value) => {
                    setLocation(value)
                    setHasFilters(true)
                  }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_LOCATIONS}>All Locations</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  size="sm"
                  className="w-full h-9"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setHasFilters(true)
                }}
                className="pl-10 h-10 bg-muted/20 border-border/50 placeholder:text-muted-foreground"
              />
            </div>

            {/* Results */}
            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading jobs...</p>
              </Card>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {filteredJobs.length === 1
                    ? '1 job found'
                    : `${filteredJobs.length} jobs found`}
                </p>
                <div className="grid gap-3">
                  {filteredJobs.map((job) => (
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
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-border/50 rounded-md p-12 text-center space-y-4 bg-muted/20">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">No jobs found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
