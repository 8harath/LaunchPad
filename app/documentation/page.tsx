import { BackButton } from '@/components/back-button'
import { AppLogo } from '@/components/app-logo'

const sections = [
  {
    title: 'Platform',
    body:
      'LaunchPad is a recruitment platform where students create detailed profiles, recruiters publish jobs, and both sides interact through a shared application workflow.',
  },
  {
    title: 'Architecture',
    body:
      'The product uses Next.js App Router for UI and server routes, Supabase for authentication and PostgreSQL, and Tailwind plus shadcn/ui for a clean component system.',
  },
  {
    title: 'Security',
    body:
      'Authentication is delegated to Supabase Auth. Passwords are hashed in the managed auth schema, while application tables keep only business data. Protected API routes verify Supabase access tokens before performing privileged mutations.',
  },
  {
    title: 'Database',
    body:
      'The core tables are profiles, student_profiles, companies, jobs, applications, notifications, and admin_settings. They are connected with UUID foreign keys so a recruiter can own a company, a company can own jobs, and a student can apply to jobs through the applications table.',
  },
  {
    title: 'OAuth',
    body:
      'Google sign-in is configured through Supabase OAuth. After the provider callback, the app exchanges the auth code for a session, creates any missing profile records, and then redirects the user into the normal product flow.',
  },
]

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <AppLogo />
          <BackButton fallbackHref="/" />
        </div>

        <div className="paper rounded-[2rem] border border-border/80 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Documentation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            Repository and platform documentation
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            This page is a reader-friendly summary of the full repository documentation. For
            the complete technical breakdown of tables, flows, architecture, security, and
            setup, read the repository <code>README.md</code>.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-border/70 bg-muted/35 p-5 text-sm leading-7 text-muted-foreground">
            <p>
              Team: Bharath K, Karthik S Gowda, Lakshith S.
            </p>
            <p className="mt-2">
              Context: created during IBM training as a practical web application output,
              with room for future improvements in matching, file storage, interviews,
              analytics, and platform governance.
            </p>
            <p className="mt-4">
              Full repository documentation lives in the repository root
              <code> README.md </code>
              file.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
