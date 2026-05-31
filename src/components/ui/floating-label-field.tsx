import * as React from 'react'
import { cn } from '@/lib/utils'

interface FloatingLabelFieldProps {
  label: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
  error?: string
  className?: string
  children: React.ReactNode
  activeIcon?: boolean
}

export function FloatingLabelField({
  label,
  icon,
  suffix,
  error,
  className,
  children,
  activeIcon = false,
}: FloatingLabelFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex min-h-11 items-center rounded-md border bg-white px-3',
          error ? 'border-red-500' : 'border-border',
          'focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30'
        )}
      >
        <span
          className={cn(
            'absolute -top-2.5 left-2.5 bg-white px-1 text-xs leading-none',
            error ? 'text-red-500' : 'text-text-muted'
          )}
        >
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              'mr-2 shrink-0',
              activeIcon ? 'text-gold' : 'text-text-muted'
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 items-center">{children}</div>
        {suffix && <span className="ml-2 shrink-0 text-text-muted">{suffix}</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
  error?: string
  activeIcon?: boolean
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, icon, error, activeIcon, className, ...props }, ref) => {
    return (
      <FloatingLabelField
        label={label}
        icon={icon}
        error={error}
        activeIcon={activeIcon}
      >
        <input
          ref={ref}
          className={cn(
            'h-9 w-full border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted',
            className
          )}
          {...props}
        />
      </FloatingLabelField>
    )
  }
)
FloatingLabelInput.displayName = 'FloatingLabelInput'
