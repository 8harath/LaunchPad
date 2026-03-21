import type { CareerLearningStep } from '@/lib/recruitment'
import { Card } from '@/components/ui/card'

interface LearningPathProps {
  steps: CareerLearningStep[]
}

const STAGE_STYLES: Record<CareerLearningStep['stage'], string> = {
  Now: 'bg-[color-mix(in_oklab,var(--brand-soft)_72%,white)] text-foreground',
  Next: 'bg-accent text-foreground',
  Later: 'bg-muted text-muted-foreground',
}

export function LearningPath({ steps }: LearningPathProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {steps.map((step) => (
        <Card key={`${step.stage}-${step.skill}`} className="rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">{step.skill}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STAGE_STYLES[step.stage]}`}>
              {step.stage}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.reason}</p>

          <div className="mt-5 space-y-3">
            {step.resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{resource.title}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {resource.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{resource.note}</p>
              </a>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
