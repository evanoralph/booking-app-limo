export type TripType = 'one-way' | 'hourly'
export type LocationType = 'location' | 'airport'

export interface LocationData {
  address: string
  lat: number
  lng: number
  placeId?: string
}

export interface BookingFormData {
  tripType: TripType
  pickupDate: Date
  pickupTime: string
  pickupLocationType: LocationType
  pickupLocation: LocationData | null
  stops: LocationData[]
  dropoffLocationType: LocationType
  dropoffLocation: LocationData | null
  hours?: number
  phone: string
  isKnownCustomer: boolean
  firstName?: string
  lastName?: string
  email?: string
  passengers: number
}

export interface BookingConfirmation {
  confirmationNumber: string
  bookedAt: string
}

export const emptyLocation = (): LocationData | null => null

export const defaultBookingFormData: BookingFormData = {
  tripType: 'one-way',
  pickupDate: new Date(),
  pickupTime: '15:00',
  pickupLocationType: 'location',
  pickupLocation: null,
  stops: [],
  dropoffLocationType: 'location',
  dropoffLocation: null,
  hours: undefined,
  phone: '',
  isKnownCustomer: false,
  firstName: '',
  lastName: '',
  email: '',
  passengers: 1,
}
