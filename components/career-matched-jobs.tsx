import Link from 'next/link'
import { ArrowUpRight, Clock3, MapPin } from 'lucide-react'
import type { CareerMatchedJob } from '@/lib/recruitment'
import { formatSalaryRange } from '@/lib/recruitment'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CareerMatchedJobsProps {
  jobs: CareerMatchedJob[]
}

export function CareerMatchedJobs({ jobs }: CareerMatchedJobsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {jobs.map((job) => (
        <Card key={job.id} className="rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
              <p className="text-sm text-muted-foreground">
                {job.company}
                {job.industry ? `, ${job.industry}` : ''}
              </p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground">
              {job.matchScore}% match
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {job.location || 'Flexible location'}
            </span>
            <span>{job.jobType || 'Role type not specified'}</span>
            <span>{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
            {job.deadline ? (
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Apply by {new Date(job.deadline).toLocaleDateString()}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Matched skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.matchedSkills.length > 0 ? (
                job.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs text-foreground"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No strong overlap yet.</span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Missing for this role</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.missingSkills.length > 0 ? (
                job.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/70 bg-muted/55 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-foreground">You already cover the main requirement signals.</span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <Button asChild className="rounded-full">
              <Link href={`/browse/${job.id}`}>
                View role
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
