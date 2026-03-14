'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AppLogo } from '@/components/app-logo'
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  Layers3,
  Sparkles,
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppLogo />
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="rounded-full px-4">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

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
                  Start hiring <ArrowRight className="ml-1 h-4 w-4" />
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
                {[
                  ['Razorpay', 'Software Development Engineer I', 'Bengaluru'],
                  ['Freshworks', 'Frontend Engineering Intern', 'Chennai'],
                  ['Chargebee', 'Backend Engineer', 'Remote'],
                ].map(([company, role, place], idx) => (
                  <div key={role} className="rounded-2xl border border-border/70 bg-background/90 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{company}</p>
                        <p className="text-xs text-muted-foreground">{role}</p>
                      </div>
                      <div className="rounded-full bg-accent px-2.5 py-1 text-xs text-foreground">
                        {idx === 1 ? 'Internship' : 'Full-time'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{place}</span>
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
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">System</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Everything stays legible, fast, and structured.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BriefcaseBusiness,
                title: 'Find opportunities',
                description: 'Students browse a clean job pipeline with just enough context to decide quickly.',
              },
              {
                icon: Layers3,
                title: 'Track applications',
                description: 'Recruiters and students see the same timeline clearly, without dashboard clutter.',
              },
              {
                icon: Sparkles,
                title: 'Land your role',
                description: 'From project proof to final offer, every step is organized around momentum.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="paper rounded-[1.75rem] border border-border/80 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent text-foreground">
                  <feature.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/45 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Flow</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              A focused path from sign-up to shortlist.
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                title: 'Create your profile',
                description: 'Students add skills, project proof, and the basics recruiters actually need.',
              },
              {
                title: 'Browse opportunities',
                description: 'Roles stay searchable and readable, with lightweight filters for fast scanning.',
              },
              {
                title: 'Submit applications',
                description: 'Applications move into a single shared pipeline with transparent status updates.',
              },
              {
                title: 'Get hired',
                description: 'Recruiters review, shortlist, and close the loop without losing candidate context.',
              },
            ].map((step, idx) => (
              <div key={step.title} className="paper flex gap-5 rounded-[1.75rem] border border-border/80 p-5">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
                    0{idx + 1}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="mb-1 font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { stat: '500+', label: 'student applications tracked' },
              { stat: '40+', label: 'recruiter workflows simplified' },
              { stat: '2026', label: 'current platform seed and content year' },
            ].map((item) => (
              <div key={item.label} className="paper rounded-[1.75rem] border border-border/80 p-6 text-center">
                <div className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">{item.stat}</div>
                <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 px-4 py-20 sm:px-6 lg:px-8">
        <div className="paper mx-auto max-w-4xl rounded-[2rem] border border-border/80 px-6 py-12 text-center sm:px-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Start</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Join students and recruiters who want a hiring experience that feels calm, crisp, and modern.
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="h-11 rounded-full px-6">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="paper grid gap-6 rounded-[2rem] border border-border/80 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Credits</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                Built during IBM training by a three-member team.
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                LaunchPad was created by Bharath K, Karthik S Gowda, and Lakshith S as part of IBM training focused on building practical web applications.
              </p>
              <p>
                The platform is designed as a recruitment system for students and recruiters, and it is intentionally structured so it can be extended further with better matching, resume storage, interview workflows, and analytics in future iterations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/documentation">
                  <Button variant="outline" className="rounded-full">
                    Read documentation
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="ghost" className="rounded-full">
                    Privacy and policies
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
