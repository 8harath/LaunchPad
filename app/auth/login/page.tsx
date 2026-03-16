'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BriefcaseBusiness, ShieldCheck, Sparkles } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'company' || profile?.role === 'admin') {
        router.replace('/dashboard/company')
      } else {
        router.replace('/dashboard/student')
      }
    }

    checkExistingSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.session && data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'company' || profile?.role === 'admin') {
          router.replace('/dashboard/company')
        } else {
          router.replace('/dashboard/student')
        }
      }
    } catch {
      setError('Failed to log in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError('')

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        setIsGoogleLoading(false)
      }
    } catch {
      setError('Failed to sign in with Google. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="ambient-page min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="page-hero rounded-[2rem] border border-border/80 p-6 sm:p-8">
            <div className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Sign in
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              Return to a hiring workspace that stays simple.
            </h1>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Students and recruiters come back to the same calm system: fewer distractions, clearer next steps, and profile details that stay in sync.
            </p>
            <div className="grid gap-3 pt-4">
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <p className="mt-4 font-semibold text-foreground">Shared student and recruiter workflows</p>
                <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off without re-learning the interface.</p>
              </div>
              <div className="metric-tile rounded-[1.5rem] p-4">
                <div className="icon-chip h-10 w-10">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="mt-4 font-semibold text-foreground">Protected account access</p>
                <p className="mt-1 text-sm text-muted-foreground">Supabase authentication keeps sessions and profile data secured.</p>
              </div>
            </div>
          </div>

          <div className="paper rounded-[2rem] border border-border/80 p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-11"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-11"
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>

              <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="my-6 h-px bg-border" />

            <Button variant="outline" className="h-11 w-full rounded-full" disabled={isLoading || isGoogleLoading} onClick={handleGoogleLogin}>
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Google...
                </>
              ) : (
                'Continue with Google'
              )}
            </Button>

            <div className="mt-6 space-y-3 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-foreground transition-colors hover:text-primary">
                  Sign up
                </Link>
              </p>
              <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
