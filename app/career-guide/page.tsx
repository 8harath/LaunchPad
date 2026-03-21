'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, FileText, Sparkles, Target } from 'lucide-react'
import type { CareerGuidanceResponse } from '@/lib/recruitment'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/back-button'
import { CareerMatchedJobs } from '@/components/career-matched-jobs'
import { CareerRecommendations } from '@/components/career-recommendations'
import { DashboardStatCard } from '@/components/dashboard-stat-card'
import { LearningPath } from '@/components/learning-path'
import { Navbar } from '@/components/navbar'
import { ResumeFeedback } from '@/components/resume-feedback'
import { SkillGapCard } from '@/components/skill-gap-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export default function CareerGuidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState<string | undefined>()
  const [analysis, setAnalysis] = useState<CareerGuidanceResponse | null>(null)
  const [form, setForm] = useState({
    targetRole: '',
    resumeText: '',
  })

  const runAnalysis = async (resumeText = form.resumeText, targetRole = form.targetRole) => {
    setSubmitting(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch('/api/career-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          resumeText,
          targetRole,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setError(payload?.error || 'Unable to generate guidance right now.')
        return
      }

      setAnalysis(payload)
    } catch (analysisError) {
      console.error('Error generating career guidance:', analysisError)
      setError('Unable to generate guidance right now.')
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadCareerGuide = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile || profile.role !== 'student') {
          router.replace('/')
          return
        }

        setUserName(profile.full_name || user.email || undefined)
        await runAnalysis('', '')
      } catch (loadError) {
        console.error('Error loading career guide:', loadError)
        setError('Unable to load your career guide right now.')
        setLoading(false)
      }
    }

    loadCareerGuide()
  }, [router])

  if (loading) {
    return (
      <div className="ambient-page min-h-screen bg-background">
        <Navbar userRole="student" userName={userName} />
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole="student" userName={userName} />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="page-hero rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <BackButton fallbackHref="/dashboard/student" className="rounded-full" />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/profile">Update profile</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/browse">Browse matching jobs</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Career guide
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                Turn your current skills into a clearer job path.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                This guide reads your LaunchPad profile, compares it against live openings, and highlights the next skills worth learning.
              </p>
              {analysis ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {analysis.profileSnapshot.skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                  {analysis.profileSnapshot.skills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Add more skills to your profile for sharper recommendations.
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <DashboardStatCard
                icon={Target}
                value={analysis?.recommendedRoles.length || 0}
                label="Role paths"
                helper="Best-fit directions"
              />
              <DashboardStatCard
                icon={Compass}
                value={analysis?.matchedJobs.length || 0}
                label="Live matches"
                helper="Open LaunchPad roles"
              />
              <DashboardStatCard
                icon={Sparkles}
                value={analysis?.learningPath.filter((step) => step.stage === 'Now').length || 0}
                label="Start now"
                helper="Highest-value skills"
              />
              <DashboardStatCard
                icon={FileText}
                value={analysis?.resumeFeedback.score || 0}
                label="Resume score"
                helper="Basic recruiter-readiness"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[1.75rem] p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customize analysis</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Add extra context before re-running</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Target role</p>
                <Input
                  value={form.targetRole}
                  onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))}
                  placeholder="Example: Frontend Developer or Data Analyst"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Resume text</p>
                <Textarea
                  value={form.resumeText}
                  onChange={(event) => setForm((current) => ({ ...current, resumeText: event.target.value }))}
                  placeholder="Paste the key parts of your resume here for richer feedback and keyword matching."
                  className="min-h-44"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => runAnalysis()}
                  disabled={submitting}
                  className="rounded-full"
                >
                  {submitting ? 'Analyzing...' : 'Analyze profile'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm({ targetRole: '', resumeText: '' })
                    void runAnalysis('', '')
                  }}
                  disabled={submitting}
                  className="rounded-full"
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[1.75rem] p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Analysis inputs</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">What this guide used</h2>
            </div>

            {analysis ? (
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
                  <p className="text-sm font-medium text-foreground">
                    {analysis.profileSnapshot.headline || 'No professional headline added yet'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Signals used: {analysis.profileSnapshot.signalsUsed.join(', ') || 'profile basics only'}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Skills found</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">
                      {analysis.profileSnapshot.skillCount}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Current profile and pasted text combined.
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resume signal</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">
                      {analysis.profileSnapshot.resumeIncluded ? 'Included' : 'Missing'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add pasted resume text for stronger feedback.
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  This version is deterministic and runs entirely from your LaunchPad data plus any resume text you paste, which keeps it fast and stable for the hackathon demo.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Run the analysis to see your profile signals.</p>
            )}
          </Card>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {analysis ? (
          <>
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-foreground">Recommended roles</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paths that best match your current profile without assuming a full reset.
                </p>
              </div>
              <CareerRecommendations roles={analysis.recommendedRoles} />
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-foreground">Live job matches</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Relevant openings already on LaunchPad, with overlap and missing-skill visibility.
                </p>
              </div>
              {analysis.matchedJobs.length > 0 ? (
                <CareerMatchedJobs jobs={analysis.matchedJobs} />
              ) : (
                <Card className="rounded-[1.75rem] p-8 text-center">
                  <p className="text-lg font-semibold text-foreground">No strong live matches yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add more skills, paste resume text, or choose a target role to improve matching.
                  </p>
                </Card>
              )}
            </section>

            <section className="mt-10 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <SkillGapCard gaps={analysis.skillGaps} />
              <ResumeFeedback feedback={analysis.resumeFeedback} />
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-foreground">Personalized learning path</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with the skills that appear most often across your best-fit role paths.
                </p>
              </div>
              <LearningPath steps={analysis.learningPath} />
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}
