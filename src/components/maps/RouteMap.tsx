import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMaps } from '@/components/maps/GoogleMapsProvider'
import {
  buildRouteWaypoints,
  computeRoutePath,
  getRouteSignature,
  hasPendingStops,
} from '@/lib/computeRoute'
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
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  const routeRequestIdRef = useRef(0)
  const [mapReady, setMapReady] = useState(false)
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([])
  const [loadedRouteSignature, setLoadedRouteSignature] = useState('')

  const routeSignature = useMemo(
    () => getRouteSignature(pickup, stops, dropoff),
    [pickup, stops, dropoff]
  )

  const pendingStops = useMemo(() => hasPendingStops(stops), [stops])

  // One route only: pickup → valid stops → dropoff (hidden while a stop is incomplete)
  const visibleRoutePath = useMemo(() => {
    if (pendingStops) return []
    if (!routeSignature || loadedRouteSignature !== routeSignature) return []
    return routePath
  }, [pendingStops, routeSignature, loadedRouteSignature, routePath])

  const markers = useMemo(() => {
    const list: { position: google.maps.LatLngLiteral; label: string; color: string }[] = []
    if (pickup && pickup.lat !== 0) {
      list.push({ position: { lat: pickup.lat, lng: pickup.lng }, label: 'P', color: '#22c55e' })
    }
    let stopLabelIndex = 0
    stops.forEach((stop) => {
      if (stop.lat === 0) return
      list.push({
        position: { lat: stop.lat, lng: stop.lng },
        label: String.fromCharCode(65 + stopLabelIndex),
        color: '#d4af37',
      })
      stopLabelIndex++
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

  const clearRoutePolyline = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
      console.log('[RouteMap] Removed previous polyline from map')
    }
  }, [])

  // Single imperative polyline — avoids duplicate lines from React Polyline not unmounting
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    clearRoutePolyline()

    if (visibleRoutePath.length < 2) return

    polylineRef.current = new google.maps.Polyline({
      path: visibleRoutePath,
      map,
      ...routePolylineOptions,
    })
    console.log('[RouteMap] Drew one-way polyline with', visibleRoutePath.length, 'points')

    return clearRoutePolyline
  }, [visibleRoutePath, mapReady, clearRoutePolyline])

  useEffect(() => () => clearRoutePolyline(), [clearRoutePolyline])

  const fitMapBounds = useCallback(
    (map: google.maps.Map) => {
      if (markers.length === 0 && visibleRoutePath.length === 0) {
        map.setCenter(defaultCenter)
        map.setZoom(12)
        return
      }

      const bounds = new google.maps.LatLngBounds()
      markers.forEach((m) => bounds.extend(m.position))
      visibleRoutePath.forEach((p) => bounds.extend(p))

      if (markers.length < 2 && visibleRoutePath.length === 0) {
        map.setCenter(markers[0]?.position ?? defaultCenter)
        map.setZoom(14)
        return
      }

      map.fitBounds(bounds, 48)
      console.log(
        '[RouteMap] Map bounds updated —',
        markers.length,
        'markers,',
        visibleRoutePath.length,
        'route points'
      )
    },
    [markers, visibleRoutePath]
  )

  useEffect(() => {
    if (pendingStops) {
      console.log('[RouteMap] Incomplete stop — hiding route until all stops are set')
      return
    }

    const currentWaypoints = buildRouteWaypoints(pickup, stops, dropoff)

    if (currentWaypoints.length < 2) {
      console.log('[RouteMap] Need pickup + destination (or stop) to show route')
      setRoutePath([])
      setLoadedRouteSignature('')
      return
    }

    if (loadedRouteSignature === routeSignature && routePath.length > 0) {
      console.log('[RouteMap] Route already matches current locations')
      return
    }

    if (loadedRouteSignature !== routeSignature) {
      console.log('[RouteMap] Locations changed — clearing previous route')
      setRoutePath([])
      setLoadedRouteSignature('')
      clearRoutePolyline()
    }

    const controller = new AbortController()
    const requestId = ++routeRequestIdRef.current
    const signatureForRequest = routeSignature

    console.log('[RouteMap] Fetching one-way route (pickup → stops → destination):', signatureForRequest)

    computeRoutePath(pickup, stops, dropoff, controller.signal)
      .then((path) => {
        if (controller.signal.aborted || requestId !== routeRequestIdRef.current) return

        if (path.length > 0) {
          console.log('[RouteMap] One-way route displayed with', path.length, 'points')
          setRoutePath(path)
          setLoadedRouteSignature(signatureForRequest)
        } else {
          console.warn('[RouteMap] Routes API returned no path')
          setRoutePath([])
          setLoadedRouteSignature('')
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (requestId !== routeRequestIdRef.current) return
        console.error('[RouteMap] Failed to fetch one-way route:', err)
        setRoutePath([])
        setLoadedRouteSignature('')
      })

    return () => controller.abort()
  }, [routeSignature, pendingStops, clearRoutePolyline])

  useEffect(() => {
    const map = mapRef.current
    if (map) {
      fitMapBounds(map)
    }
  }, [fitMapBounds])

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      setMapReady(true)
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
