import Link from 'next/link'
import { cn } from '@/lib/utils'

type AppLogoProps = {
  href?: string
  className?: string
  imageClassName?: string
  showWordmark?: boolean
}

export function AppLogo({
  href = '/',
  className,
  imageClassName,
  showWordmark = false,
}: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn('inline-flex items-center gap-3 text-foreground transition-opacity hover:opacity-90', className)}
    >
      <img
        src="/android-chrome-192x192.png"
        alt="LaunchPad logo"
        className={cn('h-9 w-9 rounded-2xl border border-border/80 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-soft)_60%,white),color-mix(in_oklab,var(--highlight)_26%,white))] object-cover shadow-[0_18px_36px_-28px_color-mix(in_oklab,var(--brand-strong)_28%,transparent)]', imageClassName)}
      />
      {showWordmark ? (
        <div className="leading-none">
          <div className="text-sm font-semibold tracking-[-0.02em]">LaunchPad</div>
          <div className="mt-1 text-[11px] text-muted-foreground">career operating system</div>
        </div>
      ) : null}
    </Link>
  )
}
