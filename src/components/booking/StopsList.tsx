import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlaceAutocompleteInput } from '@/components/maps/PlaceAutocompleteInput'
import type { LocationData } from '@/types/booking'

const MAX_STOPS = 3

interface StopsListProps {
  stops: LocationData[]
  onAddStop: () => void
  onRemoveStop: (index: number) => void
  onStopChange: (index: number, address: string) => void
  onStopSelect: (index: number, location: LocationData) => void
  errors?: Record<number, string>
}

export function StopsList({
  stops,
  onAddStop,
  onRemoveStop,
  onStopChange,
  onStopSelect,
  errors = {},
}: StopsListProps) {
  return (
    <div className="space-y-3">
      {stops.map((stop, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1">
            <PlaceAutocompleteInput
              id={`stop-${index}`}
              value={stop.address}
              onChange={(address) => onStopChange(index, address)}
              onPlaceSelect={(location) => onStopSelect(index, location)}
              placeholder={`Stop ${index + 1}`}
              error={errors[index]}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log('[StopsList] Removing stop:', index)
              onRemoveStop(index)
            }}
            aria-label={`Remove stop ${index + 1}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {stops.length < MAX_STOPS && (
        <button
          type="button"
          onClick={() => {
            console.log('[StopsList] Adding stop')
            onAddStop()
          }}
          className="text-sm text-gold font-medium hover:underline cursor-pointer"
        >
          + Add a stop
        </button>
      )}
    </div>
  )
}

export function createEmptyStop(): LocationData {
  return { address: '', lat: 0, lng: 0 }
}
