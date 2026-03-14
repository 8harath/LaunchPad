'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BriefcaseBusiness, Check, IndianRupee, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/back-button'
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
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser)

        const response = await fetch(`/api/jobs?jobId=${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.jobs?.[0] || null)
        }

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
          <p className="mb-4 text-muted-foreground">Job not found</p>
          <BackButton fallbackHref="/browse" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <BackButton fallbackHref="/browse" className="mb-6 rounded-full" />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h1 className="mb-2 text-4xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-xl text-muted-foreground">{job.companies.name}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="mb-6 flex flex-wrap gap-4">
                {job.location ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                ) : null}
                {job.job_type ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <BriefcaseBusiness className="h-4 w-4" />
                    {job.job_type}
                  </span>
                ) : null}
                {job.salary_min && job.salary_max ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <IndianRupee className="h-4 w-4" />
                    {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>

            <Card className="mb-8 p-8">
              <h2 className="mb-4 text-2xl font-bold text-foreground">About the role</h2>
              <p className="whitespace-pre-wrap text-foreground">{job.description}</p>
            </Card>

            {job.requirements && job.requirements.length > 0 ? (
              <Card className="p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-1 h-4 w-4 text-accent" />
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {job.companies.description ? (
              <Card className="mt-8 p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">About {job.companies.name}</h2>
                <p className="text-foreground">{job.companies.description}</p>
              </Card>
            ) : null}
          </div>

          <div>
            <Card className="sticky top-6 p-8">
              <div className="mb-6">
                {job.companies.logo_url ? (
                  <img
                    src={job.companies.logo_url}
                    alt={job.companies.name}
                    className="mb-4 w-full rounded"
                  />
                ) : null}
                <h3 className="mb-2 text-lg font-bold text-foreground">{job.companies.name}</h3>
                {job.companies.website ? (
                  <a
                    href={job.companies.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit website
                  </a>
                ) : null}
              </div>

              {job.deadline ? (
                <div className="mb-6 rounded-lg bg-accent/10 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Application deadline</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              ) : null}

              <Button onClick={handleApply} disabled={applying || hasApplied} className="w-full" size="lg">
                {hasApplied ? 'Already Applied' : applying ? 'Applying...' : 'Apply Now'}
              </Button>

              {!user ? (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  <Button variant="link" className="h-auto p-0" onClick={() => router.push('/auth/login')}>
                    Sign in to apply
                  </Button>
                </p>
              ) : null}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
