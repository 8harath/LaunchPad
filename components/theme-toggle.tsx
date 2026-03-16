'use client'

import { useEffect, useState } from 'react'
import { MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarth = mounted && theme === 'darth'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 rounded-full px-3"
      onClick={() => setTheme(isDarth ? 'light' : 'darth')}
      aria-label={isDarth ? 'Switch to light theme' : 'Switch to darth theme'}
    >
      {isDarth ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDarth ? 'Light' : 'Darth'}</span>
    </Button>
  )
}
