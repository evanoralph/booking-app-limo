import type { LocationData } from '@/types/booking'

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'

interface LatLngWaypoint {
  location: {
    latLng: {
      latitude: number
      longitude: number
    }
  }
}

interface ComputeRoutesResponse {
  routes?: Array<{
    polyline?: {
      encodedPolyline?: string
    }
  }>
}

function isValidLocation(loc: LocationData | null | undefined): loc is LocationData {
  return !!loc && loc.lat !== 0 && loc.lng !== 0
}

/** Build ordered waypoints: pickup → stops → dropoff */
export function buildRouteWaypoints(
  pickup: LocationData | null,
  stops: LocationData[],
  dropoff: LocationData | null
): LocationData[] {
  const points: LocationData[] = []
  if (isValidLocation(pickup)) points.push(pickup)
  points.push(...stops.filter(isValidLocation))
  if (isValidLocation(dropoff)) points.push(dropoff)
  return points
}

function toWaypoint(loc: LocationData): LatLngWaypoint {
  return {
    location: {
      latLng: {
        latitude: loc.lat,
        longitude: loc.lng,
      },
    },
  }
}

/** Decode Google's encoded polyline into lat/lng points */
export function decodeEncodedPolyline(encoded: string): google.maps.LatLngLiteral[] {
  const points: google.maps.LatLngLiteral[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    lat += result & 1 ? ~(result >> 1) : result >> 1

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    lng += result & 1 ? ~(result >> 1) : result >> 1

    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }

  return points
}

export async function computeRoutePath(
  pickup: LocationData | null,
  stops: LocationData[],
  dropoff: LocationData | null,
  signal?: AbortSignal
): Promise<google.maps.LatLngLiteral[]> {
  const waypoints = buildRouteWaypoints(pickup, stops, dropoff)

  if (waypoints.length < 2) {
    console.log('[computeRoute] Need at least 2 locations to compute route, got', waypoints.length)
    return []
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
  if (!apiKey) {
    console.warn('[computeRoute] VITE_GOOGLE_MAPS_API_KEY is not set')
    return []
  }

  const origin = toWaypoint(waypoints[0])
  const destination = toWaypoint(waypoints[waypoints.length - 1])
  const intermediates = waypoints.slice(1, -1).map(toWaypoint)

  const body: Record<string, unknown> = {
    origin,
    destination,
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    computeAlternativeRoutes: false,
    languageCode: 'en-US',
    units: 'IMPERIAL',
  }

  if (intermediates.length > 0) {
    body.intermediates = intermediates
  }

  console.log('[computeRoute] Fetching route with', waypoints.length, 'waypoints')

  const response = await fetch(ROUTES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[computeRoute] Routes API error:', response.status, errorText)
    return []
  }

  const data = (await response.json()) as ComputeRoutesResponse
  const encoded = data.routes?.[0]?.polyline?.encodedPolyline

  if (!encoded) {
    console.warn('[computeRoute] No route polyline returned from Routes API')
    return []
  }

  const path = decodeEncodedPolyline(encoded)
  console.log('[computeRoute] Route computed with', path.length, 'points')
  return path
}
