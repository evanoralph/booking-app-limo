import { useRef, useEffect } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { ChevronDown, MapPin } from 'lucide-react'
import { FloatingLabelField } from '@/components/ui/floating-label-field'
import { useGoogleMaps } from '@/components/maps/GoogleMapsProvider'
import type { LocationData } from '@/types/booking'

interface PlaceAutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (location: LocationData) => void
  placeholder?: string
  label?: string
  id?: string
  error?: string
  types?: string[]
}

export function PlaceAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search for a location',
  label = 'Location',
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

  const inputClasses =
    'h-9 w-full border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted'

  const fieldContent = (
    <FloatingLabelField
      label={label}
      icon={<MapPin className="h-4 w-4" />}
      suffix={<ChevronDown className="h-4 w-4" />}
      error={error}
      activeIcon
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
      />
    </FloatingLabelField>
  )

  if (!isLoaded) {
    return (
      <div>
        {fieldContent}
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <p className="mt-1 text-xs text-amber-600">
            Add VITE_GOOGLE_MAPS_API_KEY to enable autocomplete
          </p>
        )}
      </div>
    )
  }

  return (
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
      <div>{fieldContent}</div>
    </Autocomplete>
  )
}
