import { cn } from '@/lib/utils'
import type { TripType } from '@/types/booking'

interface HeaderProps {
  title?: string
}

export function Header({ title = "Let's get you on your way!" }: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-xl md:text-2xl font-normal text-text-primary">{title}</h1>
    </header>
  )
}

interface PageShellProps {
  children: React.ReactNode
  title?: string
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background py-6 px-4 md:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8">
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
  const options: { id: TripType; label: string; icon: string }[] = [
    { id: 'one-way', label: 'One-way', icon: '→' },
    { id: 'hourly', label: 'Hourly', icon: '⏳' },
  ]

  return (
    <div className="flex gap-3 mb-6">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => {
            console.log('[TripTypeToggle] Selected:', opt.id)
            onChange(opt.id)
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 h-11 rounded-md border text-sm font-medium transition-colors cursor-pointer',
            value === opt.id
              ? 'border-gold text-gold bg-gold-light/30'
              : 'border-border text-text-muted hover:border-gray-300'
          )}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
