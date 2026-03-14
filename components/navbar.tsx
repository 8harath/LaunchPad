'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppLogo } from '@/components/app-logo'

interface NavbarProps {
  userRole?: string
  userName?: string
  avatarUrl?: string
  onLogout?: () => void
}

export function Navbar({ userRole, userName, avatarUrl, onLogout }: NavbarProps) {
  const router = useRouter()
  const [resolvedRole, setResolvedRole] = useState<string | undefined>(userRole)
  const [resolvedName, setResolvedName] = useState<string | undefined>(userName)
  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(avatarUrl || undefined)

  useEffect(() => {
    const hydrateNavbar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      setResolvedName((current) => current || profile?.full_name || user.email || undefined)
      setResolvedRole((current) => current || profile?.role || undefined)
      setResolvedAvatar((current) => current || profile?.avatar_url || undefined)
    }

    hydrateNavbar()
  }, [avatarUrl, userName, userRole])

  const displayName = userName || resolvedName
  const displayRole = userRole || resolvedRole
  const displayAvatar = avatarUrl || resolvedAvatar
  const logoHref =
    displayRole === 'student'
      ? '/dashboard/student'
      : displayRole === 'company' || displayRole === 'admin'
        ? '/dashboard/company'
        : '/'
  const initials = (displayName || 'LP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const handleInternalLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }

    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <AppLogo href={logoHref} />

          <div className="hidden items-center gap-6 text-sm md:flex">
            {!displayRole ? (
              <Link href="/browse" className="text-muted-foreground transition-colors hover:text-foreground">
                Browse jobs
              </Link>
            ) : null}
            {displayRole === 'student' ? (
              <>
                <Link href="/dashboard/student" className="text-muted-foreground transition-colors hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/browse" className="text-muted-foreground transition-colors hover:text-foreground">
                  Browse jobs
                </Link>
              </>
            ) : null}
            {displayRole === 'company' || displayRole === 'admin' ? (
              <Link href="/dashboard/company" className="text-muted-foreground transition-colors hover:text-foreground">
                Company dashboard
              </Link>
            ) : null}
            {displayRole ? (
              <Link href="/profile" className="text-muted-foreground transition-colors hover:text-foreground">
                Profile
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {displayName ? (
              <>
                <Link href="/profile" className="hidden items-center gap-3 rounded-full border border-border bg-card px-2 py-1 pr-3 sm:flex">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback>{initials || 'LP'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{displayName}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleInternalLogout} className="h-9 rounded-full">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="h-9 rounded-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="h-9 rounded-full">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
