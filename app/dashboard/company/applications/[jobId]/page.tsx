'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

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
      full_name: string
      email: string
      bio: string | null
      avatar_url: string | null
    }
  }
}

export default function ApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()

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

        if (jobData) {
          setJob(jobData)
          if (jobData.companies.admin_id !== user.id) {
            router.push('/dashboard/company')
            return
          }
        }

        const response = await fetch(`/api/applications?jobId=${jobId}`)
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
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
        )
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <BackButton fallbackHref="/dashboard/company" className="mb-4 rounded-full" />
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Applications for {job?.title}
          </h1>
          <p className="text-muted-foreground">
            Total: {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No applications yet</p>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {app.student_profiles.profiles.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {app.student_profiles.profiles.email}
                    </p>
                    {app.student_profiles.headline ? (
                      <p className="mt-2 text-sm text-foreground">{app.student_profiles.headline}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {app.student_profiles.university ? (
                        <span className="rounded-full border border-border px-2.5 py-1">
                          {app.student_profiles.university}
                          {app.student_profiles.major ? `, ${app.student_profiles.major}` : ''}
                        </span>
                      ) : null}
                      {app.student_profiles.location ? (
                        <span className="rounded-full border border-border px-2.5 py-1">
                          {app.student_profiles.location}
                        </span>
                      ) : null}
                      {app.student_profiles.current_title ? (
                        <span className="rounded-full border border-border px-2.5 py-1">
                          {app.student_profiles.current_title}
                        </span>
                      ) : null}
                      {app.student_profiles.years_of_experience !== null ? (
                        <span className="rounded-full border border-border px-2.5 py-1">
                          {app.student_profiles.years_of_experience} years experience
                        </span>
                      ) : null}
                      {app.student_profiles.availability_notice_period ? (
                        <span className="rounded-full border border-border px-2.5 py-1">
                          {app.student_profiles.availability_notice_period}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <p className="mb-4 text-xs text-muted-foreground">
                  Applied: {new Date(app.created_at).toLocaleDateString()}
                </p>

                {app.student_profiles.profiles.bio ? (
                  <div className="mb-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Profile summary</p>
                    <p className="text-sm text-muted-foreground">{app.student_profiles.profiles.bio}</p>
                  </div>
                ) : null}

                {app.student_profiles.experience_summary ? (
                  <div className="mb-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Experience</p>
                    <p className="text-sm text-muted-foreground">{app.student_profiles.experience_summary}</p>
                  </div>
                ) : null}

                {app.student_profiles.project_highlights ? (
                  <div className="mb-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Projects</p>
                    <p className="text-sm text-muted-foreground">{app.student_profiles.project_highlights}</p>
                  </div>
                ) : null}

                {app.cover_letter ? (
                  <div className="mb-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Cover letter</p>
                    <p className="text-sm text-foreground">{app.cover_letter}</p>
                  </div>
                ) : null}

                <div className="mb-4 flex flex-wrap gap-2">
                  {(app.resume_url || app.student_profiles.resume_url) ? (
                    <a
                      href={app.resume_url || app.student_profiles.resume_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      View resume
                    </a>
                  ) : null}
                  {app.student_profiles.github_url ? <a href={app.student_profiles.github_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">GitHub</a> : null}
                  {app.student_profiles.linkedin_url ? <a href={app.student_profiles.linkedin_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">LinkedIn</a> : null}
                  {app.student_profiles.portfolio_url ? <a href={app.student_profiles.portfolio_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">Portfolio</a> : null}
                  {app.student_profiles.leetcode_url ? <a href={app.student_profiles.leetcode_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">LeetCode</a> : null}
                  {app.student_profiles.twitter_url ? <a href={app.student_profiles.twitter_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">Twitter</a> : null}
                  {app.student_profiles.instagram_url ? <a href={app.student_profiles.instagram_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">Instagram</a> : null}
                  {app.student_profiles.devfolio_url ? <a href={app.student_profiles.devfolio_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent">Devfolio</a> : null}
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  {app.student_profiles.skills?.length ? (
                    <div className="rounded-2xl border border-border/70 p-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {app.student_profiles.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-accent px-2.5 py-1 text-xs text-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {app.student_profiles.certifications?.length ? (
                    <div className="rounded-2xl border border-border/70 p-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">Certifications</p>
                      <p className="text-sm text-muted-foreground">{app.student_profiles.certifications.join(', ')}</p>
                    </div>
                  ) : null}

                  {app.student_profiles.languages?.length ? (
                    <div className="rounded-2xl border border-border/70 p-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">Languages</p>
                      <p className="text-sm text-muted-foreground">{app.student_profiles.languages.join(', ')}</p>
                    </div>
                  ) : null}

                  {(app.student_profiles.expected_salary_min || app.student_profiles.expected_salary_max) ? (
                    <div className="rounded-2xl border border-border/70 p-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">Compensation preference</p>
                      <p className="text-sm text-muted-foreground">
                        {app.student_profiles.expected_salary_min ? `INR ${app.student_profiles.expected_salary_min.toLocaleString()}` : 'Flexible'}
                        {app.student_profiles.expected_salary_max ? ` - INR ${app.student_profiles.expected_salary_max.toLocaleString()}` : ''}
                      </p>
                    </div>
                  ) : null}
                </div>

                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="rounded-full border border-border bg-background px-3 py-2 text-xs text-foreground"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer_extended">Offer Extended</option>
                </select>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
