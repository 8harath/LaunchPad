'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

type Job = {
  id: string
  title: string
  description: string
  location: string
  job_type: string
  salary_min: number | null
  salary_max: number | null
  requirements: string[]
  deadline: string | null
  status: string
  companies: {
    id: string
    name: string
    logo_url: string | null
    description: string | null
    website: string | null
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasApplied, setHasApplied] = useState(false)

  const jobId = params.jobId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)

        // Fetch job
        const response = await fetch(`/api/jobs?jobId=${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.jobs?.[0] || null)
        }

        // Check if user has already applied
        if (authUser) {
          const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('student_id', authUser.id)
            .single()

          if (existingApp) {
            setHasApplied(true)
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId])

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setApplying(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          studentId: user.id,
        }),
      })

      if (response.ok) {
        setHasApplied(true)
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard/student')
        }, 1000)
      }
    } catch (error) {
      console.error('Error applying:', error)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {job.title}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {job.companies.name}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      📍 {job.location}
                    </span>
                  </div>
                )}
                {job.job_type && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      💼 {job.job_type}
                    </span>
                  </div>
                )}
                {job.salary_min && job.salary_max && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About the Role</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </Card>

            {job.requirements && job.requirements.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">✓</span>
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {job.companies.description && (
              <Card className="p-8 mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">About {job.companies.name}</h2>
                <p className="text-foreground">{job.companies.description}</p>
              </Card>
            )}
          </div>

          <div>
            <Card className="p-8 sticky top-4">
              <div className="mb-6">
                {job.companies.logo_url && (
                  <img
                    src={job.companies.logo_url}
                    alt={job.companies.name}
                    className="w-full mb-4 rounded"
                  />
                )}
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {job.companies.name}
                </h3>
                {job.companies.website && (
                  <a
                    href={job.companies.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Visit Website
                  </a>
                )}
              </div>

              {job.deadline && (
                <div className="mb-6 p-4 bg-accent/10 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Application Deadline</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              <Button
                onClick={handleApply}
                disabled={applying || hasApplied}
                className="w-full"
                size="lg"
              >
                {hasApplied
                  ? 'Already Applied'
                  : applying
                  ? 'Applying...'
                  : 'Apply Now'}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  <Button variant="link" className="h-auto p-0" onClick={() => router.push('/auth/login')}>
                    Sign in to apply
                  </Button>
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
