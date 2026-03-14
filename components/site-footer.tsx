import Link from 'next/link'
import { AppLogo } from '@/components/app-logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/25">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <AppLogo />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              LaunchPad is a calm, modern recruitment platform for students and recruiters,
              created as part of IBM training by Bharath K, Karthik S Gowda, and Lakshith S.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-6">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of use
            </Link>
            <Link href="/documentation" className="transition-colors hover:text-foreground">
              Documentation
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-border/50 pt-4 text-xs text-muted-foreground">
          <p>
            Built for structured campus and early-career hiring. Authentication is handled
            through Supabase Auth, and application data is stored in PostgreSQL with Row
            Level Security policies.
          </p>
        </div>
      </div>
    </footer>
  )
}
