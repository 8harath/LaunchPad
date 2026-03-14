import Link from 'next/link'
import { BackButton } from '@/components/back-button'
import { AppLogo } from '@/components/app-logo'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <AppLogo />
          <BackButton fallbackHref="/" />
        </div>

        <div className="paper rounded-[2rem] border border-border/80 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Privacy</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            Privacy and data handling
          </h1>

          <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
            <p>
              LaunchPad stores profile, company, job, and application data needed to run
              the recruitment workflow. Student profile details are saved in PostgreSQL
              through Supabase, and authentication is handled by Supabase Auth.
            </p>
            <p>
              Passwords are not stored in plain text inside the application tables. For
              email-based authentication, Supabase stores hashed credentials in the managed
              `auth.users` schema. The public application schema only stores profile and
              business data needed for the product experience.
            </p>
            <p>
              For Google sign-in, LaunchPad relies on Supabase OAuth. The application
              receives a Supabase session after the provider flow completes and then creates
              or updates an application-level profile record in the `profiles` table.
            </p>
            <p>
              Row Level Security policies are enabled so users can only mutate their own
              profile data, and recruiters can only manage companies, jobs, and
              applications that belong to them.
            </p>
            <p>
              Faculty reviewers and contributors can read the full technical explanation on
              the <Link href="/documentation" className="text-foreground underline underline-offset-4">documentation page</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
