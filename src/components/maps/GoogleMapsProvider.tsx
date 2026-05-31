import { createContext, useContext, type ReactNode } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

const libraries: ('places')[] = ['places']

interface GoogleMapsContextValue {
  isLoaded: boolean
  loadError: Error | undefined
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: undefined,
})

export function useGoogleMaps() {
  return useContext(GoogleMapsContext)
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  })

  if (!apiKey) {
    console.warn('[GoogleMapsProvider] VITE_GOOGLE_MAPS_API_KEY is not set')
  }

  if (loadError) {
    console.error('[GoogleMapsProvider] Failed to load Google Maps:', loadError)
  }

  if (isLoaded) {
    console.log('[GoogleMapsProvider] Google Maps API loaded successfully')
  }

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}
