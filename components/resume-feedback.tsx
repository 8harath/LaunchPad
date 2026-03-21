import type { ResumeFeedback as ResumeFeedbackData } from '@/lib/recruitment'
import { Card } from '@/components/ui/card'

interface ResumeFeedbackProps {
  feedback: ResumeFeedbackData
}

export function ResumeFeedback({ feedback }: ResumeFeedbackProps) {
  return (
    <Card className="rounded-[1.75rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resume feedback</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">Basic recruiter-readiness check</h3>
        </div>
        <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-foreground">
          {feedback.score}/100
        </span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Strengths</p>
          <div className="mt-3 space-y-3">
            {feedback.strengths.map((strength) => (
              <div
                key={strength}
                className="rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground"
              >
                {strength}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Improve next</p>
          <div className="mt-3 space-y-3">
            {feedback.improvements.map((improvement) => (
              <div
                key={improvement}
                className="rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground"
              >
                {improvement}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Missing sections</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {feedback.missingSections.length > 0 ? (
              feedback.missingSections.map((section) => (
                <span
                  key={section}
                  className="rounded-full border border-border/70 bg-muted/55 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {section}
                </span>
              ))
            ) : (
              <span className="text-sm text-foreground">No major section gaps found.</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rewrite examples</p>
          <div className="mt-3 space-y-3">
            {feedback.rewriteExamples.map((example) => (
              <div
                key={example}
                className="rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3 text-sm leading-6 text-foreground"
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
