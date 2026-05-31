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
    <div className="flex gap-2 mb-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => {
            console.log('[LocationTypeToggle] Selected:', opt.id)
            onChange(opt.id)
          }}
          className={cn(
            'px-4 h-9 rounded-md border text-xs font-medium transition-colors cursor-pointer',
            value === opt.id
              ? 'border-gold text-gold bg-gold-light/30'
              : 'border-border text-text-muted hover:border-gray-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
