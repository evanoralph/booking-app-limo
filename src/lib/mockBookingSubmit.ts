import type { BookingFormData, BookingConfirmation } from '@/types/booking'

function generateConfirmationNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BL-${dateStr}-${random}`
}

export async function submitBooking(data: BookingFormData): Promise<BookingConfirmation> {
  console.log('[mockBookingSubmit] Submitting booking:', {
    tripType: data.tripType,
    pickup: data.pickupLocation?.address,
    dropoff: data.dropoffLocation?.address,
    phone: data.phone,
    passengers: data.passengers,
  })

  await new Promise((resolve) => setTimeout(resolve, 500))

  const result: BookingConfirmation = {
    confirmationNumber: generateConfirmationNumber(),
    bookedAt: new Date().toISOString(),
  }

  console.log('[mockBookingSubmit] Booking confirmed:', result.confirmationNumber)
  return result
}
