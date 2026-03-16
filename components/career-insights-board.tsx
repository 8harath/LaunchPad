import { Card } from '@/components/ui/card'

type CompanyReview = {
  id: string
  company_name: string
  reviewer_name: string
  reviewer_role: string | null
  rating: number
  title: string
  review: string
  outcome: string | null
}

type Story = {
  id: string
  name: string
  role: string
  company: string
  story: string
  advice: string | null
}

type Insight = {
  id: string
  category: string
  title: string
  summary: string
  takeaway: string | null
}

interface CareerInsightsBoardProps {
  reviews: CompanyReview[]
  stories: Story[]
  insights: Insight[]
}

export function CareerInsightsBoard({
  reviews,
  stories,
  insights,
}: CareerInsightsBoardProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="rounded-[1.75rem] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Company reviews</p>
        <div className="mt-5 space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{review.company_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {review.reviewer_name}
                    {review.reviewer_role ? `, ${review.reviewer_role}` : ''}
                  </p>
                </div>
                <p className="rounded-full border border-border/80 px-3 py-1 text-xs text-foreground">
                  {review.rating}/5
                </p>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{review.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.review}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[1.75rem] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Success stories</p>
        <div className="mt-5 space-y-4">
          {stories.slice(0, 3).map((story) => (
            <div key={story.id} className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">{story.name}</p>
              <p className="text-sm text-muted-foreground">
                {story.role}, {story.company}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{story.story}</p>
              {story.advice ? (
                <div className="mt-3 rounded-[1rem] bg-muted/45 px-3 py-3 text-sm text-foreground">
                  {story.advice}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[1.75rem] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hiring insights</p>
        <div className="mt-5 space-y-4">
          {insights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{insight.category}</p>
              <p className="mt-2 font-medium text-foreground">{insight.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.summary}</p>
              {insight.takeaway ? (
                <p className="mt-3 text-sm font-medium text-foreground">{insight.takeaway}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
