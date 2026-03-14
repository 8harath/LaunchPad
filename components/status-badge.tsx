import { Badge } from '@/components/ui/badge'
import { Check, Clock, X, AlertCircle, CheckCircle2 } from 'lucide-react'

type Status =
  | 'pending'
  | 'reviewing'
  | 'reviewed'
  | 'shortlisted'
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
}> = {
  pending: {
    label: 'Pending Review',
    variant: 'secondary',
    icon: <Clock className="w-3 h-3" />,
  },
  reviewed: {
    label: 'Under Review',
    variant: 'outline',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  reviewing: {
    label: 'Reviewing',
    variant: 'outline',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  shortlisted: {
    label: 'Shortlisted',
    variant: 'default',
    icon: <Check className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: <X className="w-3 h-3" />,
  },
  accepted: {
    label: 'Accepted',
    variant: 'default',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  offer_extended: {
    label: 'Offer Extended',
    variant: 'default',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  open: {
    label: 'Open',
    variant: 'default',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  closed: {
    label: 'Closed',
    variant: 'secondary',
    icon: <Clock className="w-3 h-3" />,
  },
  filled: {
    label: 'Filled',
    variant: 'outline',
    icon: <Check className="w-3 h-3" />,
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
  }

  return (
    <Badge variant={config.variant} className={`gap-1 ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
