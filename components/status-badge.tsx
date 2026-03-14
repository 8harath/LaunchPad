import { Badge } from '@/components/ui/badge'
import { Check, Clock, X, AlertCircle, CheckCircle2 } from 'lucide-react'

type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'

const statusConfig: Record<ApplicationStatus, {
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
}

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={`gap-1 ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
