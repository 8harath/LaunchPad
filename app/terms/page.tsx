import { BackButton } from '@/components/back-button'
import { AppLogo } from '@/components/app-logo'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <AppLogo />
          <BackButton fallbackHref="/" />
        </div>

        <div className="paper rounded-[2rem] border border-border/80 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Terms</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            Terms of use
          </h1>

          <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
            <p>
              LaunchPad is intended for educational, demo, and recruitment workflow use.
              Users should provide accurate profile, company, and application information.
            </p>
            <p>
              Recruiters are expected to use candidate data only for hiring-related review.
              Students are expected to provide authentic academic, social, and professional
              information.
            </p>
            <p>
              The current platform is an IBM training project output and should continue to
              evolve with stronger validation, resume storage, moderation, and operational
              controls before high-scale production use.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
