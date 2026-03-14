'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  userRole?: string
  userName?: string
  onLogout?: () => void
}

export function Navbar({ userRole, userName, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            LaunchPad
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {!userRole && (
              <>
                <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse jobs
                </Link>
              </>
            )}
            {userRole === 'student' && (
              <Link href="/dashboard/student" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
            {userRole === 'company' && (
              <Link href="/dashboard/company" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {userName ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {userName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="h-9"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="h-9">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9">
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
