import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

type ActionCardProps = {
  href: string
  icon: LucideIcon
  title: string
  description: string
  eyebrow?: string
}

export function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  eyebrow,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className="paper interactive-card group flex h-full flex-col rounded-[1.75rem] border border-border/80 p-5"
    >
      <div className="icon-chip h-11 w-11">
        <Icon className="h-4.5 w-4.5" />
      </div>
      {eyebrow ? (
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
        Open
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
