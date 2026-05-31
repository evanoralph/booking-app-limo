import { z } from 'zod'

const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  lat: z.number(),
  lng: z.number(),
  placeId: z.string().optional(),
})

export const bookingFormSchema = z
  .object({
    tripType: z.enum(['one-way', 'hourly']),
    pickupDate: z.date({ message: 'Pickup date is required' }),
    pickupTime: z.string().min(1, 'Pickup time is required'),
    pickupLocationType: z.enum(['location', 'airport']),
    pickupLocation: locationSchema.nullable(),
    stops: z.array(locationSchema),
    dropoffLocationType: z.enum(['location', 'airport']),
    dropoffLocation: locationSchema.nullable(),
    hours: z.number().optional(),
    phone: z.string().min(10, 'Valid phone number is required'),
    isKnownCustomer: z.boolean(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    passengers: z
      .number({ message: 'Passengers is required' })
      .int()
      .min(1, 'At least 1 passenger required')
      .max(20, 'Maximum 20 passengers'),
  })
  .superRefine((data, ctx) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const pickupDay = new Date(data.pickupDate)
    pickupDay.setHours(0, 0, 0, 0)
    if (pickupDay < today) {
      ctx.addIssue({
        code: 'custom',
        message: 'Pickup date cannot be in the past',
        path: ['pickupDate'],
      })
    }

    if (!data.pickupLocation) {
      ctx.addIssue({
        code: 'custom',
        message: 'Pickup location is required',
        path: ['pickupLocation'],
      })
    }

    if (data.tripType === 'one-way' && !data.dropoffLocation) {
      ctx.addIssue({
        code: 'custom',
        message: 'Drop-off location is required',
        path: ['dropoffLocation'],
      })
    }

    if (data.tripType === 'hourly') {
      if (!data.hours || data.hours < 2 || data.hours > 12) {
        ctx.addIssue({
          code: 'custom',
          message: 'Select hours between 2 and 12',
          path: ['hours'],
        })
      }
    }

    for (let i = 0; i < data.stops.length; i++) {
      const stop = data.stops[i]
      if (!stop.address || stop.lat === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Stop location is required',
          path: ['stops', i],
        })
      }
    }

    if (!data.isKnownCustomer) {
      if (!data.firstName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'First name is required',
          path: ['firstName'],
        })
      }
      if (!data.lastName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Last name is required',
          path: ['lastName'],
        })
      }
      if (!data.email?.trim() || !z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Valid email is required',
          path: ['email'],
        })
      }
    }
  })

export type BookingFormValues = z.infer<typeof bookingFormSchema>

export function formatTimeDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}
