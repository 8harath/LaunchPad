import { APPLICATION_STATUS_OPTIONS, getApplicationProgressValue, normalizeApplicationStatus } from '@/lib/recruitment'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ApplicationProgressProps {
  status: string
}

export function ApplicationProgress({ status }: ApplicationProgressProps) {
  const normalizedStatus = normalizeApplicationStatus(status)
  const progressValue = getApplicationProgressValue(normalizedStatus)

  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Hiring progress
        </p>
        <p className="text-sm font-medium text-foreground">
          {APPLICATION_STATUS_OPTIONS.find((item) => item.value === normalizedStatus)?.label}
        </p>
      </div>

      <Progress value={progressValue} className="mt-4 h-2" />

      <div className="mt-4 grid gap-3 md:grid-cols-6">
        {APPLICATION_STATUS_OPTIONS.map((step) => {
          const isActive = step.value === normalizedStatus
          const isCompleted =
            step.value !== 'rejected' &&
            APPLICATION_STATUS_OPTIONS.findIndex((item) => item.value === step.value) <=
              APPLICATION_STATUS_OPTIONS.findIndex((item) => item.value === normalizedStatus)

          return (
            <div
              key={step.value}
              className={cn(
                'rounded-[1rem] border px-3 py-3 text-sm',
                isActive
                  ? 'border-foreground/20 bg-card text-foreground'
                  : isCompleted
                    ? 'border-border/80 bg-muted/45 text-foreground'
                    : 'border-border/70 bg-background text-muted-foreground'
              )}
            >
              <p className="font-medium">{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
