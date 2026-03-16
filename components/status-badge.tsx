import { Badge } from '@/components/ui/badge'
import { Check, Clock, X, AlertCircle, CheckCircle2 } from 'lucide-react'

type Status =
  | 'applied'
  | 'under_review'
  | 'pending'
  | 'reviewing'
  | 'reviewed'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'rejected'
  | 'accepted'
  | 'offer_extended'
  | 'open'
  | 'closed'
  | 'filled'

const statusConfig: Record<Status, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: React.ReactNode
  className: string
}> = {
  pending: {
    label: 'Applied',
    variant: 'secondary',
    icon: <Clock className="w-3 h-3" />,
    className: 'border-transparent bg-[color-mix(in_oklab,var(--highlight)_26%,white)] text-foreground',
  },
  applied: {
    label: 'Applied',
    variant: 'secondary',
    icon: <Clock className="w-3 h-3" />,
    className: 'border-transparent bg-[color-mix(in_oklab,var(--highlight)_26%,white)] text-foreground',
  },
  reviewed: {
    label: 'Under Review',
    variant: 'outline',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'border-[color-mix(in_oklab,var(--brand)_24%,var(--border))] bg-[color-mix(in_oklab,var(--brand-soft)_52%,white)] text-foreground',
  },
  reviewing: {
    label: 'Under Review',
    variant: 'outline',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'border-[color-mix(in_oklab,var(--brand)_24%,var(--border))] bg-[color-mix(in_oklab,var(--brand-soft)_52%,white)] text-foreground',
  },
  under_review: {
    label: 'Under Review',
    variant: 'outline',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'border-[color-mix(in_oklab,var(--brand)_24%,var(--border))] bg-[color-mix(in_oklab,var(--brand-soft)_52%,white)] text-foreground',
  },
  shortlisted: {
    label: 'Shortlisted',
    variant: 'default',
    icon: <Check className="w-3 h-3" />,
    className: 'border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-strong)_84%,black),color-mix(in_oklab,var(--brand)_84%,var(--highlight)))] text-white',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: <X className="w-3 h-3" />,
    className: '',
  },
  accepted: {
    label: 'Accepted',
    variant: 'default',
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-strong)_84%,black),color-mix(in_oklab,var(--brand)_84%,var(--highlight)))] text-white',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    variant: 'default',
    icon: <Check className="w-3 h-3" />,
    className: 'border-transparent bg-[color-mix(in_oklab,var(--highlight)_72%,white)] text-foreground',
  },
  offer_extended: {
    label: 'Offer Extended',
    variant: 'default',
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-strong)_84%,black),color-mix(in_oklab,var(--brand)_84%,var(--highlight)))] text-white',
  },
  open: {
    label: 'Open',
    variant: 'default',
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-strong)_84%,black),color-mix(in_oklab,var(--brand)_84%,var(--highlight)))] text-white',
  },
  closed: {
    label: 'Closed',
    variant: 'secondary',
    icon: <Clock className="w-3 h-3" />,
    className: 'border-transparent bg-muted text-muted-foreground',
  },
  filled: {
    label: 'Filled',
    variant: 'outline',
    icon: <Check className="w-3 h-3" />,
    className: 'border-[color-mix(in_oklab,var(--brand)_24%,var(--border))] bg-[color-mix(in_oklab,var(--brand-soft)_52%,white)] text-foreground',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as Status] ?? {
    label: status.replace(/_/g, ' '),
    variant: 'outline' as const,
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'border-[color-mix(in_oklab,var(--brand)_18%,var(--border))] bg-card/80 text-foreground',
  }

  return (
    <Badge variant={config.variant} className={`gap-1 rounded-full px-3 py-1 ${config.className} ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
