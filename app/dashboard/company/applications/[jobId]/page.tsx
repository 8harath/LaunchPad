'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
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
    profiles: {
      full_name: string
      email: string
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
        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
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

        // Fetch job
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*, companies(*)')
          .eq('id', jobId)
          .single()

        if (jobData) {
          setJob(jobData)
          // Verify user is the company admin
          if (jobData.companies.admin_id !== user.id) {
            router.push('/dashboard/company')
            return
          }
        }

        // Fetch applications
        const response = await fetch(`/api/applications?jobId=${jobId}`)
        if (response.ok) {
          const { applications } = await response.json()
          setApplications(applications || [])
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
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
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
          <Button variant="outline" className="mb-4" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {app.student_profiles.profiles.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {app.student_profiles.profiles.email}
                    </p>
                    {app.student_profiles.university && (
                      <p className="text-sm text-muted-foreground">
                        {app.student_profiles.university}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Applied: {new Date(app.created_at).toLocaleDateString()}
                </p>

                {app.cover_letter && (
                  <div className="mb-4 p-4 bg-muted rounded">
                    <p className="text-sm font-semibold text-foreground mb-2">Cover Letter:</p>
                    <p className="text-sm text-foreground">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {app.resume_url && (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      📄 View Resume
                    </a>
                  )}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-border rounded bg-background text-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="offer_extended">Offer Extended</option>
                  </select>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
