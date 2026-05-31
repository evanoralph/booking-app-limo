import { ArrowRight, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TripType } from '@/types/booking'

interface HeaderProps {
  title?: string
}

export function Header({ title = "Let's get you on your way!" }: HeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="mb-5 flex items-center justify-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
        </div>
        <span className="text-xl font-semibold text-indigo-700">ExampleIQ</span>
      </div>
      <h1 className="text-left text-2xl font-normal text-text-primary md:text-3xl">{title}</h1>
    </header>
  )
}

interface PageShellProps {
  children: React.ReactNode
  title?: string
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm md:p-8">
          <Header title={title} />
          {children}
        </div>
      </div>
    </div>
  )
}

interface TripTypeToggleProps {
  value: TripType
  onChange: (value: TripType) => void
}

export function TripTypeToggle({ value, onChange }: TripTypeToggleProps) {
  const options: { id: TripType; label: string }[] = [
    { id: 'one-way', label: 'One-way' },
    { id: 'hourly', label: 'Hourly' },
  ]

  return (
    <div
      role="radiogroup"
      aria-label="Trip type"
      className="mb-6 flex w-full"
    >
      {options.map((opt, index) => {
        const isSelected = value === opt.id
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              console.log('[TripTypeToggle] Selected:', opt.id)
              onChange(opt.id)
            }}
            className={cn(
              'flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 border text-sm font-medium transition-colors',
              isFirst && 'rounded-l-lg',
              isLast && 'rounded-r-lg',
              !isFirst && '-ml-px',
              isSelected
                ? 'relative z-10 border-gold bg-gold-light/40 text-gold'
                : 'border-border bg-white text-text-muted hover:bg-gray-50'
            )}
          >
            {opt.id === 'one-way' ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current">
                <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
            ) : (
              <Hourglass className="h-3.5 w-3.5" />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
