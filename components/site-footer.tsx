import Link from 'next/link'
import { AppLogo } from '@/components/app-logo'
import { BookOpenText, FileText, ShieldCheck } from 'lucide-react'

export function SiteFooter() {
  const links = [
    { href: '/privacy', label: 'Privacy policy', icon: ShieldCheck },
    { href: '/terms', label: 'Terms of use', icon: FileText },
    { href: '/documentation', label: 'Documentation', icon: BookOpenText },
  ]

  return (
    <footer className="border-t border-border/70 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="page-hero rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <AppLogo showWordmark />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              LaunchPad is a calm, modern recruitment platform for students and recruiters,
              created as part of IBM training by Bharath K, Karthik S Gowda, and Lakshith S.
            </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="interactive-card inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-4 py-3 text-muted-foreground"
                >
                  <span className="icon-chip h-9 w-9">
                    <link.icon className="h-4 w-4" />
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 soft-divider" />

          <div className="mt-6 text-xs text-muted-foreground">
            <p>
              Built for structured campus and early-career hiring. Authentication is handled
              through Supabase Auth, and application data is stored in PostgreSQL with Row
              Level Security policies.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
