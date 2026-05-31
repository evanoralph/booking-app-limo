import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import { useGoogleMaps } from '@/components/maps/GoogleMapsProvider'
import { computeRoutePath } from '@/lib/computeRoute'
import type { LocationData } from '@/types/booking'

interface RouteMapProps {
  pickup: LocationData | null
  dropoff: LocationData | null
  stops?: LocationData[]
  className?: string
  height?: string
}

const defaultCenter = { lat: 42.3601, lng: -71.0589 }

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

const routePolylineOptions: google.maps.PolylineOptions = {
  strokeColor: '#d4af37',
  strokeOpacity: 0.9,
  strokeWeight: 4,
}

export function RouteMap({
  pickup,
  dropoff,
  stops = [],
  className = '',
  height = '280px',
}: RouteMapProps) {
  const { isLoaded } = useGoogleMaps()
  const mapRef = useRef<google.maps.Map | null>(null)
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([])

  const markers = useMemo(() => {
    const list: { position: google.maps.LatLngLiteral; label: string; color: string }[] = []
    if (pickup && pickup.lat !== 0) {
      list.push({ position: { lat: pickup.lat, lng: pickup.lng }, label: 'P', color: '#22c55e' })
    }
    stops.forEach((stop, i) => {
      if (stop.lat === 0) return
      list.push({
        position: { lat: stop.lat, lng: stop.lng },
        label: String.fromCharCode(65 + i),
        color: '#d4af37',
      })
    })
    if (dropoff && dropoff.lat !== 0) {
      list.push({ position: { lat: dropoff.lat, lng: dropoff.lng }, label: 'D', color: '#ef4444' })
    }
    return list
  }, [pickup, dropoff, stops])

  const center = useMemo(() => {
    if (markers.length === 0) return defaultCenter
    const avgLat = markers.reduce((sum, m) => sum + m.position.lat, 0) / markers.length
    const avgLng = markers.reduce((sum, m) => sum + m.position.lng, 0) / markers.length
    return { lat: avgLat, lng: avgLng }
  }, [markers])

  const fitMapBounds = useCallback(
    (map: google.maps.Map) => {
      if (markers.length === 0 && routePath.length === 0) {
        map.setCenter(defaultCenter)
        map.setZoom(12)
        return
      }

      const bounds = new google.maps.LatLngBounds()
      markers.forEach((m) => bounds.extend(m.position))
      routePath.forEach((p) => bounds.extend(p))

      if (markers.length < 2 && routePath.length === 0) {
        map.setCenter(markers[0]?.position ?? defaultCenter)
        map.setZoom(14)
        return
      }

      map.fitBounds(bounds, 48)
      console.log('[RouteMap] Map bounds updated with', markers.length, 'markers and', routePath.length, 'route points')
    },
    [markers, routePath]
  )

  useEffect(() => {
    const controller = new AbortController()

    computeRoutePath(pickup, stops, dropoff, controller.signal)
      .then((path) => {
        if (!controller.signal.aborted) {
          setRoutePath(path)
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[RouteMap] Failed to compute route:', err)
        if (!controller.signal.aborted) {
          setRoutePath([])
        }
      })

    return () => controller.abort()
  }, [pickup, dropoff, stops])

  useEffect(() => {
    const map = mapRef.current
    if (map) {
      fitMapBounds(map)
    }
  }, [fitMapBounds])

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      fitMapBounds(map)
    },
    [fitMapBounds]
  )

  if (!isLoaded) {
    return (
      <div
        className={`rounded-lg border border-border bg-gray-100 flex items-center justify-center text-text-muted text-sm ${className}`}
        style={{ height }}
      >
        Loading map...
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={12}
        options={mapOptions}
        onLoad={onLoad}
      >
        {routePath.length > 0 && (
          <Polyline path={routePath} options={routePolylineOptions} />
        )}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.position.lat}-${marker.position.lng}-${index}`}
            position={marker.position}
            label={{
              text: marker.label,
              color: 'white',
              fontWeight: 'bold',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: marker.color,
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  )
}
