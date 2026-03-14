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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AVATAR_PRESETS } from '@/lib/avatar-presets'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userRole, setUserRole] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PRESETS[0].url)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!userRole) {
      setError('Please select your role')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role: userRole,
          avatarUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError || !signInData.session || !signInData.user) {
        setSuccess('Account created successfully. Please sign in.')
        setTimeout(() => router.push('/auth/login'), 1800)
        return
      }

      router.replace('/profile?welcome=1')
    } catch {
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
      setError('Failed to sign up with Google. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Join</p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              Create a calm, recruiter-ready profile from day one.
            </h1>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Pick an avatar, choose your role, and get into a cleaner hiring flow. You can fill in the rest on your profile page right after signup.
            </p>

            <div className="paper rounded-[2rem] border border-border/80 p-6">
              <p className="mb-4 text-sm font-medium text-foreground">Avatar selection</p>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`rounded-2xl border p-1 transition-all ${avatarUrl === preset.url ? 'border-foreground bg-accent' : 'border-border bg-card hover:border-foreground/30'}`}
                  >
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={preset.url} alt={preset.label} />
                      <AvatarFallback>{preset.label.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="paper rounded-[2rem] border border-border/80 p-6 sm:p-8">
            <form onSubmit={handleSignup} className="space-y-5">
              {error ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                  {success}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 h-11"
                    required
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>

                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={userRole} onValueChange={setUserRole} disabled={isLoading || isGoogleLoading}>
                    <SelectTrigger id="role" className="mt-2 h-11">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="company">Company / Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 h-11"
                    required
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="my-6 h-px bg-border" />

            <Button variant="outline" className="h-11 w-full rounded-full" disabled={isLoading || isGoogleLoading} onClick={handleGoogleSignup}>
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
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-foreground transition-colors hover:text-primary">
                  Sign in
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
