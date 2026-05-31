import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/context/BookingContext'
import {
  formatDateDisplay,
  formatTimeDisplay,
} from '@/lib/validation'

export function SuccessPage() {
  const navigate = useNavigate()
  const { formData, confirmation, resetBooking } = useBooking()

  const handleBookAnother = () => {
    console.log('[SuccessPage] Book another ride')
    resetBooking()
    navigate('/')
  }

  if (!confirmation) {
    navigate('/')
    return null
  }

  return (
    <PageShell title="You're booked!">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" strokeWidth={1.5} />
        </div>

        <div>
          <p className="text-sm text-text-muted mb-1">Confirmation number</p>
          <p className="text-2xl font-bold text-gold tracking-wide">
            {confirmation.confirmationNumber}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-left space-y-2 text-sm">
          <p>
            <span className="text-text-muted">Pickup: </span>
            <span className="font-medium">
              {formatDateDisplay(formData.pickupDate)} at{' '}
              {formatTimeDisplay(formData.pickupTime)}
            </span>
          </p>
          <p>
            <span className="text-text-muted">From: </span>
            <span className="font-medium">{formData.pickupLocation?.address}</span>
          </p>
          {formData.tripType === 'one-way' && formData.dropoffLocation && (
            <p>
              <span className="text-text-muted">To: </span>
              <span className="font-medium">{formData.dropoffLocation.address}</span>
            </p>
          )}
          {formData.tripType === 'hourly' && (
            <p>
              <span className="text-text-muted">Duration: </span>
              <span className="font-medium">{formData.hours} hours</span>
            </p>
          )}
          <p>
            <span className="text-text-muted">Passengers: </span>
            <span className="font-medium">{formData.passengers}</span>
          </p>
        </div>

        <p className="text-sm text-text-muted">
          A confirmation has been sent to {formData.email || formData.phone}. Our chauffeur
          will be in touch before your trip.
        </p>

        <Button type="button" className="w-full" size="lg" onClick={handleBookAnother}>
          Book another ride
        </Button>
      </div>
    </PageShell>
  )
}
