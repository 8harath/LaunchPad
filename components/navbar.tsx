'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppLogo } from '@/components/app-logo'
import { NotificationCenter } from '@/components/notification-center'
import { ThemeToggle } from '@/components/theme-toggle'
import { BriefcaseBusiness, Compass, LayoutDashboard, MessageSquareMore, Users } from 'lucide-react'

interface NavbarProps {
  userRole?: string
  userName?: string
  avatarUrl?: string
  onLogout?: () => void
}

export function Navbar({ userRole, userName, avatarUrl, onLogout }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [resolvedRole, setResolvedRole] = useState<string | undefined>(userRole)
  const [resolvedName, setResolvedName] = useState<string | undefined>(userName)
  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(avatarUrl || undefined)
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(resolvedUserId)

  useEffect(() => {
    const hydrateNavbar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setResolvedUserId(user.id)

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
  const navItems = !displayRole
    ? [
        { href: '/', label: 'Home', icon: LayoutDashboard },
        { href: '/browse', label: 'Jobs', icon: Compass },
      ]
    : displayRole === 'student'
      ? [
          { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/messages', label: 'Messages', icon: MessageSquareMore },
          { href: '/browse', label: 'Jobs', icon: Compass },
          { href: '/community', label: 'Community', icon: Users },
        ]
      : [
          { href: '/dashboard/company', label: 'Workspace', icon: LayoutDashboard },
          { href: '/dashboard/company/post-job', label: 'Roles', icon: BriefcaseBusiness },
          { href: '/messages', label: 'Inbox', icon: MessageSquareMore },
        ]

  const handleInternalLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }

    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/78 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <AppLogo href={logoHref} showWordmark className="shrink-0" />

          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/70 p-1.5 text-sm shadow-[0_18px_36px_-28px_color-mix(in_oklab,var(--foreground)_30%,transparent)] lg:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                    isActive
                      ? 'bg-[color-mix(in_oklab,var(--brand-soft)_72%,white)] text-foreground shadow-[0_16px_32px_-26px_color-mix(in_oklab,var(--brand-strong)_34%,transparent)]'
                      : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {displayName ? (
              <>
                <ThemeToggle />
                <NotificationCenter
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
                <Button asChild variant="outline" size="icon" className="rounded-full text-foreground lg:hidden">
                  <Link href="/messages">
                    <MessageSquareMore className="h-4 w-4" />
                  </Link>
                </Button>
                <Link href="/profile" className="hidden items-center gap-3 rounded-full border border-border/80 bg-card/85 px-2 py-1 pr-3 shadow-[0_20px_42px_-30px_color-mix(in_oklab,var(--foreground)_25%,transparent)] sm:flex">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback>{initials || 'LP'}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm leading-tight">
                    <div className="font-medium text-foreground">{displayName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {displayRole === 'admin'
                          ? 'Admin'
                          : displayRole === 'company'
                            ? 'Recruiter'
                            : 'Student'}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/70" />
                      <span>Workspace</span>
                    </div>
                  </div>
                </Link>
                <Button variant="outline" size="sm" onClick={handleInternalLogout} className="h-9 rounded-full">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
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
