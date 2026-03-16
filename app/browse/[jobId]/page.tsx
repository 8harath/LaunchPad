'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BriefcaseBusiness, Check, IndianRupee, MapPin, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/back-button'
import { ApplicationProgress } from '@/components/application-progress'
import { Navbar } from '@/components/navbar'
import { MessageComposer } from '@/components/message-composer'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { formatSalaryRange } from '@/lib/recruitment'

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
    industry?: string | null
    size?: string | null
    location?: string | null
    admin_id?: string | null
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>()
  const [applicationId, setApplicationId] = useState<string>()
  const [applicationStatus, setApplicationStatus] = useState<string>('applied')
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [submissionError, setSubmissionError] = useState('')

  const jobId = params.jobId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          const [{ data: profile }, { data: studentProfile }] = await Promise.all([
            supabase.from('profiles').select('role').eq('id', authUser.id).maybeSingle(),
            supabase.from('student_profiles').select('resume_url').eq('id', authUser.id).maybeSingle(),
          ])

          setUserRole(profile?.role || undefined)
          setResumeUrl(studentProfile?.resume_url || '')
        }

        const response = await fetch(`/api/jobs?jobId=${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.jobs?.[0] || null)
        }

        if (authUser) {
          const { data: existingApp } = await supabase
            .from('applications')
            .select('id, status')
            .eq('job_id', jobId)
            .eq('student_id', authUser.id)
            .maybeSingle()

          if (existingApp) {
            setApplicationId(existingApp.id)
            setApplicationStatus(existingApp.status)
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

    if (userRole !== 'student') {
      setSubmissionError('Only student accounts can apply for jobs.')
      return
    }

    setApplying(true)
    setSubmissionError('')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          jobId,
          resumeUrl: resumeUrl || undefined,
          coverLetter: coverLetter || undefined,
        }),
      })

      if (response.ok) {
        const createdApplication = await response.json()
        setApplicationId(createdApplication.id)
        setApplicationStatus(createdApplication.status)
        setTimeout(() => {
          router.push('/dashboard/student')
        }, 1000)
      } else {
        const payload = await response.json().catch(() => null)
        setSubmissionError(payload?.error || 'Unable to submit your application.')
      }
    } catch (error) {
      console.error('Error applying:', error)
      setSubmissionError('Unable to submit your application.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <p className="mb-4 text-muted-foreground">Job not found</p>
          <BackButton fallbackHref="/browse" />
        </main>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <BackButton fallbackHref="/browse" className="mb-6 rounded-full" />

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Opportunity details
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h1 className="mb-2 text-4xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-xl text-muted-foreground">{job.companies.name}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
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
                    {formatSalaryRange(job.salary_min, job.salary_max)}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="metric-tile rounded-[1.5rem] p-4">
                <p className="text-sm text-muted-foreground">Role type</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{job.job_type || 'Not specified'}</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{job.location || 'Flexible'}</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <p className="text-sm text-muted-foreground">Compensation</p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {job.salary_min && job.salary_max
                    ? formatSalaryRange(job.salary_min, job.salary_max)
                    : 'Discussed later'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
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

            {applicationId ? (
              <div className="mt-8">
                <ApplicationProgress status={applicationStatus} />
              </div>
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
                <div className="space-y-1 text-sm text-muted-foreground">
                  {job.companies.industry ? <p>{job.companies.industry}</p> : null}
                  {job.companies.size ? <p>{job.companies.size} team</p> : null}
                  {job.companies.location ? <p>{job.companies.location}</p> : null}
                </div>
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

              {!applicationId && userRole === 'student' ? (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Resume link</p>
                    <Input
                      value={resumeUrl}
                      onChange={(event) => setResumeUrl(event.target.value)}
                      placeholder="Paste your resume URL"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Cover letter</p>
                    <Textarea
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Briefly explain why you are a fit for this role."
                      className="min-h-32"
                    />
                  </div>
                </div>
              ) : null}

              {submissionError ? (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {submissionError}
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                <Button
                  onClick={handleApply}
                  disabled={applying || !!applicationId || userRole === 'company'}
                  className="w-full"
                  size="lg"
                >
                  {applicationId ? 'Application submitted' : applying ? 'Applying...' : 'Apply now'}
                </Button>

                {applicationId && job.companies.admin_id ? (
                  <MessageComposer
                    applicationId={applicationId}
                    recipientId={job.companies.admin_id}
                    recipientLabel={job.companies.name}
                    defaultSubject={`Regarding ${job.title}`}
                    buttonLabel="Message recruiter"
                  />
                ) : null}

                {applicationId ? (
                  <Button variant="outline" asChild className="w-full rounded-full">
                    <Link href="/dashboard/student">View application status</Link>
                  </Button>
                ) : null}
              </div>

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
