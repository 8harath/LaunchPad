import type { CareerSkillGap } from '@/lib/recruitment'
import { Card } from '@/components/ui/card'

interface SkillGapCardProps {
  gaps: CareerSkillGap[]
}

const PRIORITY_STYLES: Record<CareerSkillGap['priority'], string> = {
  High: 'bg-[color-mix(in_oklab,var(--destructive)_12%,white)] text-foreground',
  Medium: 'bg-accent text-foreground',
  Explore: 'bg-muted text-muted-foreground',
}

export function SkillGapCard({ gaps }: SkillGapCardProps) {
  return (
    <Card className="rounded-[1.75rem] p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Skill gaps</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">What to learn next for the best upside</h3>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <div key={gap.role} className="rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">{gap.role}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${PRIORITY_STYLES[gap.priority]}`}>
                {gap.priority} priority
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">{gap.rationale}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {gap.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border/70 bg-muted/55 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
