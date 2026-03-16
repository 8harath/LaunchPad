import type { LucideIcon } from 'lucide-react'

type DashboardStatCardProps = {
  icon: LucideIcon
  value: string | number
  label: string
  helper?: string
}

export function DashboardStatCard({
  icon: Icon,
  value,
  label,
  helper,
}: DashboardStatCardProps) {
  return (
    <div className="metric-tile rounded-[1.5rem] p-4">
      <div className="icon-chip h-10 w-10">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}
