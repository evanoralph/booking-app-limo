import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PageShell } from '@/components/layout/Header'
import { RouteMap } from '@/components/maps/RouteMap'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/context/BookingContext'
import { submitBooking } from '@/lib/mockBookingSubmit'
import {
  formatDateDisplay,
  formatTimeDisplay,
} from '@/lib/validation'

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary text-right">{value}</span>
    </div>
  )
}

export function ConfirmationPage() {
  const navigate = useNavigate()
  const { formData, setConfirmation } = useBooking()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!formData.pickupLocation?.address) {
      console.log('[ConfirmationPage] No booking data, redirecting to home')
      navigate('/')
    }
  }, [formData.pickupLocation, navigate])

  const handleConfirm = async () => {
    setSubmitting(true)
    console.log('[ConfirmationPage] Confirming booking')
    try {
      const result = await submitBooking(formData)
      setConfirmation(result)
      navigate('/success')
    } catch (err) {
      console.error('[ConfirmationPage] Booking failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = () => {
    console.log('[ConfirmationPage] Editing booking')
    navigate('/')
  }

  return (
    <PageShell title="Review your booking">
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-50 p-4 space-y-1">
          <SummaryRow
            label="Trip type"
            value={formData.tripType === 'one-way' ? 'One-way' : 'Hourly'}
          />
          <SummaryRow
            label="Pickup date"
            value={formatDateDisplay(formData.pickupDate)}
          />
          <SummaryRow
            label="Pickup time"
            value={formatTimeDisplay(formData.pickupTime)}
          />
          <SummaryRow
            label="Pickup"
            value={formData.pickupLocation?.address ?? '—'}
          />
          {formData.stops.map((stop, i) => (
            <SummaryRow key={i} label={`Stop ${i + 1}`} value={stop.address} />
          ))}
          {formData.tripType === 'one-way' ? (
            <SummaryRow
              label="Drop-off"
              value={formData.dropoffLocation?.address ?? '—'}
            />
          ) : (
            <SummaryRow label="Duration" value={`${formData.hours} hours`} />
          )}
          <SummaryRow label="Phone" value={formData.phone} />
          <SummaryRow
            label="Contact"
            value={`${formData.firstName} ${formData.lastName}`}
          />
          <SummaryRow label="Email" value={formData.email ?? '—'} />
          <SummaryRow
            label="Passengers"
            value={String(formData.passengers)}
          />
        </div>

        <RouteMap
          pickup={formData.pickupLocation}
          dropoff={formData.tripType === 'one-way' ? formData.dropoffLocation : null}
          stops={formData.stops}
          height="200px"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleEdit}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
