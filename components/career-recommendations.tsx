import { BriefcaseBusiness, Sparkles } from 'lucide-react'
import type { CareerRecommendation } from '@/lib/recruitment'
import { Card } from '@/components/ui/card'

interface CareerRecommendationsProps {
  roles: CareerRecommendation[]
}

export function CareerRecommendations({ roles }: CareerRecommendationsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {roles.map((role) => (
        <Card key={role.title} className="rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="section-kicker">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Recommended role
              </div>
              <h3 className="mt-3 text-xl font-semibold text-foreground">{role.title}</h3>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground">
              {role.fitScore}% fit
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">{role.summary}</p>

          <div className="mt-4 space-y-2">
            {role.reasons.map((reason) => (
              <div
                key={reason}
                className="rounded-[1rem] border border-border/70 bg-background/70 px-3 py-3 text-sm text-muted-foreground"
              >
                {reason}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                You already have
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.matchedSkills.length > 0 ? (
                  role.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs text-foreground"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Still building this profile signal.</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Learn next
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.missingSkills.length > 0 ? (
                  role.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border/70 bg-muted/55 px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-foreground">
                    <Sparkles className="h-4 w-4" />
                    Strong core alignment already.
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            {role.matchedJobCount} relevant live role{role.matchedJobCount === 1 ? '' : 's'} on LaunchPad.
          </p>
        </Card>
      ))}
    </div>
  )
}
