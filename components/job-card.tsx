import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'

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
}: JobCardProps) {
  const displayLink = link || `/browse/${id}`

  return (
    <Link href={displayLink}>
      <div className="p-5 border border-border/50 rounded-md hover:border-border hover:bg-muted/20 transition-all cursor-pointer group">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{company}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                {jobType}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>

          {/* Details Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {postedDate}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 2).map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded bg-muted/50 text-muted-foreground">
                  {skill}
                </span>
              ))}
              {skills.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted/50 text-muted-foreground">
                  +{skills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
