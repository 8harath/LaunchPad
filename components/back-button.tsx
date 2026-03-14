'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BackButtonProps = {
  fallbackHref?: string
  label?: string
  className?: string
  preferFallback?: boolean
}

export function BackButton({
  fallbackHref = '/',
  label = 'Back',
  className,
  preferFallback = false,
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (!preferFallback && typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.replace(fallbackHref)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleBack}
      className={className}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
