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
import { BriefcaseBusiness, Clock3, FileStack, Sparkles } from 'lucide-react'

type Application = {
  id: string
  status: string
  created_at: string
  jobs: {
    id: string
    title: string
    companies: {
      id: string
      name: string
      logo_url: string | null
    }
  }
}

export default function StudentDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
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

        // Fetch applications
        const response = await fetch(`/api/applications?studentId=${authUser.id}`)
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
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="student" userName={userName} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="student" userName={userName} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-12">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <BackButton fallbackHref="/" className="mb-4 rounded-full" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Student dashboard
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground mb-2">
                My Applications
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Track where you applied, what is moving forward, and where to focus next.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <FileStack className="h-4 w-4" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">{applications.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">applications</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  {applications.filter((app) => ['shortlisted', 'accepted', 'offer_extended'].includes(app.status)).length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">active progress</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <Clock3 className="h-4 w-4" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  {applications.filter((app) => ['pending', 'reviewing', 'reviewed'].includes(app.status)).length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">awaiting review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.length === 0 ? (
            <Card className="col-span-full rounded-[1.75rem] p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't applied to any jobs yet
              </p>
              <Button asChild>
                <Link href="/browse">Browse Jobs</Link>
              </Button>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="interactive-card rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {app.jobs.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {app.jobs.companies.name}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="text-xs text-muted-foreground">
                  Applied: {new Date(app.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
