'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  FileStack,
  Layers3,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle2,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { AppLogo } from '@/components/app-logo'
import { JobCard } from '@/components/job-card'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { DashboardStatCard } from '@/components/dashboard-stat-card'
import { ActionCard } from '@/components/action-card'
import { StatusBadge } from '@/components/status-badge'

type HomeJob = {
  id: string
  title: string
  description: string
  location: string | null
  job_type: string | null
  created_at: string
  requirements: string[] | null
  applications?: { id: string; status: string }[]
  companies: {
    id: string
    name: string
    logo_url: string | null
    location: string | null
    industry: string | null
  }
}

type HomeApplication = {
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

const testimonials = [
  {
    name: 'Asha R',
    role: 'Frontend Engineer',
    company: 'Freshworks',
    quote:
      'I stopped sending generic resumes, rebuilt my portfolio around shipped projects, and tailored each application to the job description.',
    result: 'Secured a full-time frontend role in 5 weeks.',
  },
  {
    name: 'Karthik M',
    role: 'Backend Developer',
    company: 'Chargebee',
    quote:
      'The biggest difference was documenting impact. I turned course projects into case studies with metrics, architecture notes, and tradeoffs.',
    result: 'Moved from shortlist to offer after 3 targeted applications.',
  },
  {
    name: 'Niveditha P',
    role: 'Product Analyst Intern',
    company: 'Razorpay',
    quote:
      'I focused on one domain, published small product breakdowns every week, and used each interview to improve my narrative.',
    result: 'Converted an internship into a pre-placement opportunity.',
  },
]

const skillGuides = [
  {
    category: 'Portfolio',
    title: 'How to build a recruiter-ready project portfolio',
    summary:
      'Show 2-3 strong projects, explain the problem, your decisions, the tech stack, and what measurable result or learning came out of it.',
    takeaway: 'Best next step: rewrite one project as a case study instead of a code dump.',
  },
  {
    category: 'Technical Depth',
    title: 'How to improve your skill set without random tutorial hopping',
    summary:
      'Pick one track for 30 days, such as React, backend APIs, or SQL, and ship one small deliverable every week with increasing complexity.',
    takeaway: 'Best next step: choose one skill lane and set a weekly shipping target.',
  },
  {
    category: 'Interview Prep',
    title: 'How to turn practice into interview confidence',
    summary:
      'Pair coding practice with explanation practice. Learn to talk through tradeoffs, debugging, and architecture, not just the final answer.',
    takeaway: 'Best next step: record yourself explaining one solved problem out loud.',
  },
]

function PublicHomepage({ featuredJobs }: { featuredJobs: HomeJob[] }) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="surface-grid overflow-hidden px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="reveal-up inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Built for students, recruiters, and focused hiring loops
            </div>

            <div className="space-y-5">
              <div className="reveal-up flex justify-center lg:justify-start">
                <AppLogo imageClassName="h-16 w-16 rounded-[1.5rem]" />
              </div>
              <h1 className="reveal-up reveal-up-delay-1 text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                Quietly powerful hiring for early-career talent.
              </h1>
              <p className="reveal-up reveal-up-delay-2 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                LaunchPad gives students a clear path from projects to interviews, and gives recruiters a calm, structured place to discover promising builders.
              </p>
            </div>

            <div className="reveal-up reveal-up-delay-3 flex flex-wrap gap-3 pt-2">
              <Link href="/auth/signup">
                <Button size="lg" className="h-11 rounded-full px-6">
                  Create account <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="h-11 rounded-full border-border bg-card px-6">
                  Explore roles
                </Button>
              </Link>
            </div>

            <div className="grid max-w-2xl gap-3 pt-4 sm:grid-cols-3">
              {[
                { value: '120+', label: 'active roles' },
                { value: '35+', label: 'startup teams' },
                { value: '8 min', label: 'avg. recruiter triage' },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className={`paper reveal-up rounded-3xl border border-border/80 p-4 ${idx === 1 ? 'reveal-up-delay-1' : idx === 2 ? 'reveal-up-delay-2' : ''}`}
                >
                  <div className="text-2xl font-semibold tracking-[-0.03em]">{item.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="float-gentle">
            <div className="paper relative overflow-hidden rounded-[2rem] border border-border/80 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Hiring board</p>
                  <p className="text-xs text-muted-foreground">Minimal, readable, current</p>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                  March 2026
                </div>
              </div>

              <div className="space-y-3">
                {featuredJobs.slice(0, 3).map((job, idx) => (
                  <div key={job.id} className="rounded-2xl border border-border/70 bg-background/90 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{job.companies.name}</p>
                        <p className="text-xs text-muted-foreground">{job.title}</p>
                      </div>
                      <div className="rounded-full bg-accent px-2.5 py-1 text-xs text-foreground">
                        {idx === 1 ? 'Internship' : job.job_type || 'Full-time'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.location || 'Flexible'}</span>
                      <span className="inline-flex items-center gap-1">
                        Open role <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Stories</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Students who got hired focused on clarity, proof, and consistency.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-[1.75rem] p-6">
                <p className="text-sm leading-7 text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-5">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{testimonial.result}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/35 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Skill Guides</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Practical ways to improve your skill set and stand out faster.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {skillGuides.map((guide) => (
              <Card key={guide.title} className="rounded-[1.75rem] p-6">
                <div className="icon-chip h-11 w-11">
                  <BookOpenText className="h-4.5 w-4.5" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {guide.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{guide.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.summary}</p>
                <p className="mt-4 text-sm font-medium text-foreground">{guide.takeaway}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function StudentHomepage({
  userName,
  featuredJobs,
  applications,
}: {
  userName?: string
  featuredJobs: HomeJob[]
  applications: HomeApplication[]
}) {
  const activeApplications = applications.filter((application) =>
    ['reviewing', 'reviewed', 'shortlisted', 'accepted', 'offer_extended'].includes(application.status)
  ).length

  return (
    <main className="ambient-page min-h-screen bg-background">
      <Navbar userRole="student" userName={userName} />

      <section className="px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="page-hero rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" />
                  Welcome back
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  {userName ? `${userName}, here is your student home base.` : 'Here is your student home base.'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Explore current roles, learn from successful candidates, and improve the skills that move you closer to interviews.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href="/browse">
                      Explore jobs
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href="/dashboard/student">Track applications</Link>
                  </Button>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/profile">Update profile</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <DashboardStatCard icon={Compass} value={featuredJobs.length} label="Featured roles" helper="Fresh opportunities to review" />
                <DashboardStatCard icon={FileStack} value={applications.length} label="Applications" helper="Your tracked pipeline" />
                <DashboardStatCard icon={TrendingUp} value={activeApplications} label="In progress" helper="Roles moving forward" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Explore Jobs</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                Relevant roles students can act on right now.
              </h2>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/browse">View all jobs</Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {featuredJobs.length > 0 ? (
              featuredJobs.slice(0, 4).map((job) => (
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
                  applicants={job.applications?.length || 0}
                />
              ))
            ) : (
              <Card className="rounded-[1.75rem] p-8 text-center">
                <p className="text-muted-foreground">No featured jobs are available right now.</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Success Stories</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
              How students actually secured their offers.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-[1.75rem] p-6">
                <div className="icon-chip h-11 w-11">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <p className="mt-5 text-sm leading-7 text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-5">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{testimonial.result}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/35 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Skill Blog</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
              How do I improve my skill set?
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {skillGuides.map((guide) => (
              <Card key={guide.title} className="rounded-[1.75rem] p-6">
                <div className="icon-chip h-11 w-11">
                  <BookOpenText className="h-4.5 w-4.5" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {guide.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{guide.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.summary}</p>
                <div className="mt-4 rounded-[1.25rem] border border-border/70 bg-background/75 p-4 text-sm text-foreground">
                  {guide.takeaway}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Your Activity</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                Recent application movement.
              </h2>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/dashboard/student">Open dashboard</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {applications.slice(0, 3).map((application) => (
              <Card key={application.id} className="rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{application.jobs.title}</p>
                    <p className="text-sm text-muted-foreground">{application.jobs.companies.name}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Applied on {new Date(application.created_at).toLocaleDateString()}.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function RecruiterHomepage({
  userName,
  companyJobs,
}: {
  userName?: string
  companyJobs: HomeJob[]
}) {
  const totalApplications = companyJobs.reduce(
    (sum, job) => sum + (job.applications?.length || 0),
    0
  )

  return (
    <main className="ambient-page min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} />

      <section className="px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="page-hero rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" />
                  Recruiter home
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  {userName ? `${userName}, manage hiring from one place.` : 'Manage hiring from one place.'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Post roles, review candidates, and keep your company profile polished for every applicant.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href="/dashboard/company">
                      Open workspace
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href="/dashboard/company/post-job">Post new role</Link>
                  </Button>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/profile">Update profile</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <DashboardStatCard icon={BriefcaseBusiness} value={companyJobs.length} label="Roles posted" helper="Current company jobs" />
                <DashboardStatCard icon={Users} value={totalApplications} label="Applicants" helper="Across your openings" />
                <DashboardStatCard icon={Target} value={companyJobs.filter((job) => job.status === 'open').length} label="Open roles" helper="Active hiring right now" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Primary Actions</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
              Start with the workflows that matter most.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ActionCard
              href="/dashboard/company/post-job"
              icon={BriefcaseBusiness}
              eyebrow="Create"
              title="Post a job"
              description="Open a new role with details, requirements, and deadline."
            />
            <ActionCard
              href="/dashboard/company"
              icon={Layers3}
              eyebrow="Manage"
              title="Review job pipeline"
              description="Track live roles and move into applicant review quickly."
            />
            <ActionCard
              href="/profile"
              icon={UserCircle2}
              eyebrow="Polish"
              title="Strengthen company profile"
              description="Improve candidate trust with better company context and branding."
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recent Roles</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                Your latest hiring activity.
              </h2>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/dashboard/company">View dashboard</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {companyJobs.slice(0, 3).map((job) => (
              <Card key={job.id} className="rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.applications?.length || 0} applicants
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="mt-5">
                  <Button variant="outline" asChild className="rounded-full">
                    <Link href={`/dashboard/company/applications/${job.id}`}>Review candidates</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | undefined>()
  const [userName, setUserName] = useState<string | undefined>()
  const [featuredJobs, setFeaturedJobs] = useState<HomeJob[]>([])
  const [studentApplications, setStudentApplications] = useState<HomeApplication[]>([])
  const [companyJobs, setCompanyJobs] = useState<HomeJob[]>([])

  useEffect(() => {
    const loadHome = async () => {
      try {
        const jobsResponse = await fetch('/api/jobs')
        if (jobsResponse.ok) {
          const { jobs } = await jobsResponse.json()
          setFeaturedJobs((jobs || []).slice(0, 6))
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()

        const resolvedRole = profile?.role || undefined
        setUserRole(resolvedRole)
        setUserName(profile?.full_name || user.email || undefined)

        if (resolvedRole === 'student') {
          const response = await fetch(`/api/applications?studentId=${user.id}`)
          if (response.ok) {
            const { applications } = await response.json()
            setStudentApplications(applications || [])
          }
        }

        if (resolvedRole === 'company' || resolvedRole === 'admin') {
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('admin_id', user.id)
            .single()

          if (company?.id) {
            const response = await fetch(`/api/jobs?companyId=${company.id}`)
            if (response.ok) {
              const { jobs } = await response.json()
              setCompanyJobs(jobs || [])
            }
          }
        }
      } catch (error) {
        console.error('Error loading home page:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHome()
  }, [])

  if (isLoading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      </div>
    )
  }

  if (userRole === 'student') {
    return (
      <StudentHomepage
        userName={userName}
        featuredJobs={featuredJobs}
        applications={studentApplications}
      />
    )
  }

  if (userRole === 'company' || userRole === 'admin') {
    return <RecruiterHomepage userName={userName} companyJobs={companyJobs} />
  }

  return <PublicHomepage featuredJobs={featuredJobs} />
}
