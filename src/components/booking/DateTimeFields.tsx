import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-11 pl-10 relative',
                !date && 'text-text-muted',
                dateError && 'border-red-500'
              )}
            >
              <CalendarIcon className="absolute left-3 h-4 w-4 text-text-muted" />
              {date ? formatDateDisplay(date) : 'Pick a date'}
            </Button>
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
        {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
      </div>

      <div>
        <Input
          type="time"
          value={time}
          onChange={(e) => {
            console.log('[DateTimeFields] Time selected:', e.target.value)
            onTimeChange(e.target.value)
          }}
          icon={<Clock className="h-4 w-4" />}
          className={timeError ? 'border-red-500' : ''}
        />
        {timeError && <p className="text-xs text-red-500 mt-1">{timeError}</p>}
      </div>
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-base mb-3 block">{children}</Label>
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
