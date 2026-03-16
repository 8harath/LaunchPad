import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type FilterPanelProps = {
  title: string
  description?: string
  searchValue: string
  searchPlaceholder: string
  onSearchChange: (value: string) => void
  onReset: () => void
  hasActiveFilters: boolean
  children?: ReactNode
}

export function FilterPanel({
  title,
  description,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onReset,
  hasActiveFilters,
  children,
}: FilterPanelProps) {
  return (
    <div className="paper rounded-[1.75rem] border border-border/80 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          Reset filters
        </Button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 rounded-full border-border/70 bg-background/80 pl-10"
          />
        </div>
        {children ? <div className="grid gap-3 sm:grid-cols-2">{children}</div> : null}
      </div>
    </div>
  )
}
