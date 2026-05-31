import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { BookingConfirmation, BookingFormData } from '@/types/booking'
import { defaultBookingFormData } from '@/types/booking'

interface BookingContextValue {
  formData: BookingFormData
  setFormData: (data: BookingFormData) => void
  updateFormData: (partial: Partial<BookingFormData>) => void
  confirmation: BookingConfirmation | null
  setConfirmation: (confirmation: BookingConfirmation | null) => void
  resetBooking: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<BookingFormData>(defaultBookingFormData)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)

  const updateFormData = useCallback((partial: Partial<BookingFormData>) => {
    console.log('[BookingContext] Updating form data:', Object.keys(partial))
    setFormData((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetBooking = useCallback(() => {
    console.log('[BookingContext] Resetting booking state')
    setFormData(defaultBookingFormData)
    setConfirmation(null)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        formData,
        setFormData,
        updateFormData,
        confirmation,
        setConfirmation,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) {
    throw new Error('useBooking must be used within BookingProvider')
  }
  return ctx
}
