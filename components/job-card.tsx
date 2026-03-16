import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, Clock, IndianRupee, MapPin, Users } from 'lucide-react'

interface JobCardProps {
  id: string
  title: string
  company: string
  description: string
  location: string
  jobType: string
  postedDate: string
  skills: string[]
  applicants?: number
  link?: string
  salaryLabel?: string
  deadlineLabel?: string
}

export function JobCard({
  id,
  title,
  company,
  description,
  location,
  jobType,
  postedDate,
  skills,
  applicants,
  link,
  salaryLabel,
  deadlineLabel,
}: JobCardProps) {
  const displayLink = link || `/browse/${id}`

  return (
    <Link href={displayLink}>
      <div className="paper interactive-card group cursor-pointer rounded-[1.5rem] border border-border/80 p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 gap-3">
                <span className="icon-chip h-11 w-11 flex-shrink-0">
                  <BriefcaseBusiness className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-[color-mix(in_oklab,var(--brand-strong)_76%,var(--foreground))]">
                  {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{company}</p>
                </div>
              </div>
              <span className="rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground">
                {jobType}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {postedDate}
            </div>
            {typeof applicants === 'number' ? (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {applicants} applicants
              </div>
            ) : null}
            {salaryLabel ? (
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" />
                {salaryLabel}
              </div>
            ) : null}
            {deadlineLabel ? (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Apply by {deadlineLabel}
              </div>
            ) : null}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 2).map((skill) => (
                <span key={skill} className="rounded-full border border-border/70 bg-muted/55 px-2.5 py-1 text-xs text-muted-foreground">
                  {skill}
                </span>
              ))}
              {skills.length > 2 && (
                <span className="rounded-full border border-border/70 bg-muted/55 px-2.5 py-1 text-xs text-muted-foreground">
                  +{skills.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">View details</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              Open role
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
