'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/back-button'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS, splitLineSeparated } from '@/lib/recruitment'
import { BriefcaseBusiness, Sparkles } from 'lucide-react'

function PostJobPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editingJobId = searchParams.get('jobId')
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userName, setUserName] = useState<string | undefined>()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    requirements: '',
    deadline: '',
    status: 'open',
  })

  useEffect(() => {
    const checkAuth = async () => {
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
          .select('full_name, role')
          .eq('id', authUser.id)
          .single()

        setUserName(profile?.full_name || authUser.email || undefined)

        if (profile?.role !== 'company' && profile?.role !== 'admin') {
          router.push('/dashboard/student')
          return
        }

        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('admin_id', authUser.id)
          .single()

        setCompany(companyData)

        if (editingJobId) {
          const response = await fetch(`/api/jobs?jobId=${editingJobId}`)
          if (response.ok) {
            const payload = await response.json()
            const job = payload.jobs?.[0]

            if (job) {
              setFormData({
                title: job.title || '',
                description: job.description || '',
                location: job.location || '',
                jobType: job.job_type || 'Full-time',
                salaryMin: job.salary_min ? String(job.salary_min) : '',
                salaryMax: job.salary_max ? String(job.salary_max) : '',
                requirements: (job.requirements || []).join('\n'),
                deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
                status: job.status || 'open',
              })
            }
          }
        }
      } catch (loadError) {
        console.error('Error loading recruiter form:', loadError)
        setError('Unable to load the job form right now.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [editingJobId, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!company) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const payload = {
        jobId: editingJobId || undefined,
        companyId: company.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        requirements: splitLineSeparated(formData.requirements),
        deadline: formData.deadline || null,
        status: formData.status,
      }

      const response = await fetch('/api/jobs', {
        method: editingJobId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Unable to save this job.')
      }

      router.push('/dashboard/company')
    } catch (submitError: any) {
      setError(submitError?.message || 'Unable to save this job.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="company" userName={userName} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <BackButton fallbackHref="/dashboard/company" className="mb-4 rounded-full" />
          <div className="section-kicker">
            <Sparkles className="h-3.5 w-3.5" />
            Recruiter action
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            {editingJobId ? 'Edit this hiring role' : 'Post a new role'}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Publish clear expectations, manage salary and deadline, and control whether the role is open, closed, or filled.
          </p>
        </div>

        <Card className="rounded-[2rem] p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Job title</label>
                <Input
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Full-Stack Engineer"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe responsibilities, team context, and what success looks like."
                  className="min-h-40"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Location</label>
                <Input
                  value={formData.location}
                  onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Bengaluru, India"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Job type</label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) => setFormData((current) => ({ ...current, jobType: value }))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Salary min</label>
                <Input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(event) => setFormData((current) => ({ ...current, salaryMin: event.target.value }))}
                  placeholder="800000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Salary max</label>
                <Input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(event) => setFormData((current) => ({ ...current, salaryMax: event.target.value }))}
                  placeholder="1400000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Application deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(event) => setFormData((current) => ({ ...current, deadline: event.target.value }))}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Role status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value }))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select status" />
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

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Requirements</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(event) => setFormData((current) => ({ ...current, requirements: event.target.value }))}
                  placeholder={'Type one requirement per line\nReact\nTypeScript\nAPI design'}
                  className="min-h-36"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => router.push('/dashboard/company')}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={submitting}>
                <BriefcaseBusiness className="h-4 w-4" />
                {submitting ? 'Saving...' : editingJobId ? 'Save changes' : 'Publish role'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div className="ambient-page min-h-screen bg-background">
          <Navbar userRole="company" />
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        </div>
      }
    >
      <PostJobPageContent />
    </Suspense>
  )
}
