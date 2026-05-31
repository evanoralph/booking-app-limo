import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { FloatingLabelField } from '@/components/ui/floating-label-field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDateDisplay } from '@/lib/validation'

interface DateTimeFieldsProps {
  date: Date
  time: string
  onDateChange: (date: Date) => void
  onTimeChange: (time: string) => void
  dateError?: string
  timeError?: string
}

export function DateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: DateTimeFieldsProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full text-left">
              <FloatingLabelField
                label="Date"
                icon={<CalendarIcon className="h-4 w-4" />}
                error={dateError}
              >
                <span className={cn('text-sm', !date && 'text-text-muted')}>
                  {date ? formatDateDisplay(date) : 'Select date'}
                </span>
              </FloatingLabelField>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  console.log('[DateTimeFields] Date selected:', d)
                  onDateChange(d)
                }
              }}
              disabled={(d) => d < today}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full text-left">
              <FloatingLabelField
                label="Time"
                icon={<Clock className="h-4 w-4" />}
                error={timeError}
              >
                <span className={cn('text-sm', !time && 'text-text-muted')}>
                  {time ? formatTimeForDisplay(time) : 'Select time'}
                </span>
              </FloatingLabelField>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <input
              type="time"
              value={time}
              onChange={(e) => {
                console.log('[DateTimeFields] Time selected:', e.target.value)
                onTimeChange(e.target.value)
              }}
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-base font-semibold text-text-primary">{children}</h2>
  )
}

export function formatTimeForDisplay(time24: string): string {
  try {
    const [h, m] = time24.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m)
    return format(d, 'h:mm a')
  } catch {
    return time24
  }
}
