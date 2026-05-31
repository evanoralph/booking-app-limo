import { useRef, useEffect } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGoogleMaps } from '@/components/maps/GoogleMapsProvider'
import type { LocationData } from '@/types/booking'

interface PlaceAutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (location: LocationData) => void
  placeholder?: string
  id?: string
  error?: string
  types?: string[]
}

export function PlaceAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search for a location',
  id,
  error,
  types,
}: PlaceAutocompleteInputProps) {
  const { isLoaded } = useGoogleMaps()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoaded) return
    console.log('[PlaceAutocompleteInput] Ready for place search:', id ?? 'unnamed')
  }, [isLoaded, id])

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.geometry?.location) {
      console.log('[PlaceAutocompleteInput] Place selected without geometry')
      return
    }

    const location: LocationData = {
      address: place.formatted_address ?? place.name ?? value,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      placeId: place.place_id,
    }

    console.log('[PlaceAutocompleteInput] Place selected:', location.address)
    onChange(location.address)
    onPlaceSelect(location)
  }

  const inputClasses = cn(
    'flex h-11 w-full rounded-md border bg-white pl-10 pr-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
    error ? 'border-red-500' : 'border-border'
  )

  if (!isLoaded) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <MapPin className="h-4 w-4" />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <p className="text-xs text-amber-600 mt-1">Add VITE_GOOGLE_MAPS_API_KEY to enable autocomplete</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <Autocomplete
        onLoad={(autocomplete) => {
          autocompleteRef.current = autocomplete
          autocomplete.setComponentRestrictions({ country: 'us' })
          if (types) {
            autocomplete.setTypes(types)
          }
        }}
        onPlaceChanged={handlePlaceChanged}
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <MapPin className="h-4 w-4" />
          </span>
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClasses}
          />
        </div>
      </Autocomplete>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
