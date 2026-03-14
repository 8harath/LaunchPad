'use client'

import { useState } from 'react'
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
import { Search, Filter, X } from 'lucide-react'

// Mock data - replace with actual API calls
const MOCK_JOBS = [
  {
    id: '1',
    title: 'Frontend Engineer',
    company: 'TechCorp',
    description: 'Build amazing user interfaces with React and TypeScript',
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    postedDate: '2 days ago',
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
    applicants: 24,
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'DataFlow',
    description: 'Design and implement scalable backend systems',
    location: 'Remote',
    jobType: 'Full-time',
    postedDate: '1 week ago',
    skills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    applicants: 18,
  },
  {
    id: '3',
    title: 'Product Manager',
    company: 'StartupXYZ',
    description: 'Lead product strategy and roadmap for our flagship product',
    location: 'New York, NY',
    jobType: 'Full-time',
    postedDate: '3 days ago',
    skills: ['Product Strategy', 'Analytics', 'User Research'],
    applicants: 12,
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'WebStudio',
    description: 'Work on full stack applications from database to UI',
    location: 'Los Angeles, CA',
    jobType: 'Contract',
    postedDate: '5 days ago',
    skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    applicants: 31,
  },
  {
    id: '5',
    title: 'UX/UI Designer',
    company: 'DesignHub',
    description: 'Create beautiful and intuitive user experiences',
    location: 'Remote',
    jobType: 'Full-time',
    postedDate: '1 day ago',
    skills: ['Figma', 'User Research', 'Prototyping', 'CSS'],
    applicants: 22,
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'CloudSystems',
    description: 'Manage cloud infrastructure and deployment pipelines',
    location: 'Remote',
    jobType: 'Full-time',
    postedDate: '4 days ago',
    skills: ['Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    applicants: 15,
  },
]

export default function BrowseJobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobType, setJobType] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [hasFilters, setHasFilters] = useState(false)

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesJobType = !jobType || job.jobType === jobType
    const matchesLocation = !location || job.location.includes(location)

    return matchesSearch && matchesJobType && matchesLocation
  })

  const handleResetFilters = () => {
    setSearchQuery('')
    setJobType('')
    setLocation('')
    setHasFilters(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-semibold mb-3 text-foreground">Browse opportunities</h1>
          <p className="text-muted-foreground">
            Discover {MOCK_JOBS.length} job opportunities waiting for you
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
                      <SelectItem value="">All Types</SelectItem>
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
                      <SelectItem value="">All Locations</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="San Francisco">San Francisco</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Los Angeles">Los Angeles</SelectItem>
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
            {filteredJobs.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {filteredJobs.length === 1
                    ? '1 job found'
                    : `${filteredJobs.length} jobs found`}
                </p>
                <div className="grid gap-3">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} {...job} />
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
