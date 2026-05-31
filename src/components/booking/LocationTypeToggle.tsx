import { cn } from '@/lib/utils'
import type { LocationType } from '@/types/booking'

interface LocationTypeToggleProps {
  value: LocationType
  onChange: (value: LocationType) => void
}

export function LocationTypeToggle({ value, onChange }: LocationTypeToggleProps) {
  const options: { id: LocationType; label: string }[] = [
    { id: 'location', label: 'Location' },
    { id: 'airport', label: 'Airport' },
  ]

  return (
    <div
      role="radiogroup"
      aria-label="Location type"
      className="mb-4 inline-flex"
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
              console.log('[LocationTypeToggle] Selected:', opt.id)
              onChange(opt.id)
            }}
            className={cn(
              'flex h-7 cursor-pointer items-center justify-center border px-4 text-xs font-medium transition-colors',
              isFirst && 'rounded-l-lg',
              isLast && 'rounded-r-lg',
              !isFirst && '-ml-px',
              isSelected
                ? 'relative z-10 border-gold bg-gold-light/40 text-gold'
                : 'border-border bg-white text-text-muted hover:bg-gray-50'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
