'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { BackButton } from '@/components/back-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BriefcaseBusiness, FileClock, Sparkles, Users } from 'lucide-react'

type Job = {
  id: string
  title: string
  status: string
  created_at: string
  applications?: { id: string }[]
}

export default function CompanyDashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string | undefined>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login')
          return
        }
        setUser(authUser)

        // Fetch profile for navbar display
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single()

        setUserName(profile?.full_name || authUser.email || undefined)

        // Fetch company
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('admin_id', authUser.id)
          .single()

        if (companyData) {
          setCompany(companyData)

          // Fetch jobs
          const response = await fetch(`/api/jobs?companyId=${companyData.id}`)
          if (response.ok) {
            const { jobs } = await response.json()
            setJobs(jobs || [])
          }
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

  if (loading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Company profile not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-12">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-end">
            <Button asChild>
              <Link href="/dashboard/company/post-job">Post New Job</Link>
            </Button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
            <BackButton fallbackHref="/" className="mb-4 rounded-full" />
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Recruiter workspace
              </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {company.name}
            </h1>
              <p className="max-w-2xl text-muted-foreground">Manage your job postings, review demand, and keep hiring activity moving.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">{jobs.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">openings listed</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <Users className="h-4 w-4" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  {jobs.reduce((total, job) => total + (job.applications?.length || 0), 0)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">applications</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <FileClock className="h-4 w-4" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  {jobs.filter((job) => job.status === 'open').length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">active jobs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.length === 0 ? (
            <Card className="col-span-full rounded-[1.75rem] p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't posted any jobs yet
              </p>
              <Button asChild>
                <Link href="/dashboard/company/post-job">Post Your First Job</Link>
              </Button>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="interactive-card rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.applications?.length || 0} applications
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="text-xs text-muted-foreground">
                  Posted: {new Date(job.created_at).toLocaleDateString()}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/company/applications/${job.id}`}>
                      View Applications
                    </Link>
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
