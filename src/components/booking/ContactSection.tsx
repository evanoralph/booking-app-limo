import { useState } from 'react'
import { AtSign, Hash, User } from 'lucide-react'
import PhoneInput from 'react-phone-number-input'
import { FloatingLabelInput } from '@/components/ui/floating-label-field'
import { lookupPhone } from '@/lib/mockCustomerLookup'
import { cn } from '@/lib/utils'

interface ContactSectionProps {
  phone: string
  isKnownCustomer: boolean
  firstName?: string
  lastName?: string
  email?: string
  onPhoneChange: (phone: string) => void
  onKnownCustomerChange: (known: boolean, customer?: { firstName: string; lastName: string; email: string }) => void
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  errors?: {
    phone?: string
    firstName?: string
    lastName?: string
    email?: string
  }
}

export function ContactSection({
  phone,
  isKnownCustomer,
  firstName = '',
  lastName = '',
  email = '',
  onPhoneChange,
  onKnownCustomerChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  errors = {},
}: ContactSectionProps) {
  const [lookupDone, setLookupDone] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  const handlePhoneBlur = async () => {
    if (!phone || phone.length < 10) {
      setLookupDone(false)
      return
    }

    setLookingUp(true)
    console.log('[ContactSection] Phone blur, looking up:', phone)

    try {
      const result = await lookupPhone(phone)
      setLookupDone(true)
      onKnownCustomerChange(result.found, result.customer)

      if (result.found && result.customer) {
        onFirstNameChange(result.customer.firstName)
        onLastNameChange(result.customer.lastName)
        onEmailChange(result.customer.email)
      }
    } finally {
      setLookingUp(false)
    }
  }

  const showExtraFields = lookupDone && !isKnownCustomer

  return (
    <div className="space-y-4">
      <div>
        <div
          className={cn(
            'relative flex min-h-11 items-center rounded-md border bg-white px-3',
            errors.phone ? 'border-red-500' : 'border-border',
            'focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30'
          )}
        >
          <PhoneInput
            international
            defaultCountry="US"
            value={phone}
            onChange={(value) => {
              onPhoneChange(value ?? '')
              setLookupDone(false)
            }}
            onBlur={handlePhoneBlur}
            placeholder="Enter phone number"
            className="phone-input w-full"
          />
        </div>
        {lookingUp && (
          <p className="mt-1 text-xs text-text-muted">Checking phone number...</p>
        )}
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
      </div>

      {showExtraFields && (
        <>
          <p className="text-sm text-text-muted">
            We don&apos;t have that phone number on file. Please provide additional contact
            information.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FloatingLabelInput
              label="First name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              icon={<User className="h-4 w-4" />}
              activeIcon
              error={errors.firstName}
            />
            <FloatingLabelInput
              label="Last name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              icon={<User className="h-4 w-4" />}
              activeIcon
              error={errors.lastName}
            />
          </div>

          <FloatingLabelInput
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            icon={<AtSign className="h-4 w-4" />}
            activeIcon
            error={errors.email}
          />
        </>
      )}

      {lookupDone && isKnownCustomer && (
        <p className="text-sm text-green-700">
          Welcome back, {firstName}! Your contact info is on file.
        </p>
      )}
    </div>
  )
}

export function PassengersField({
  value,
  onChange,
  error,
}: {
  value: number
  onChange: (value: number) => void
  error?: string
}) {
  return (
    <div>
      <p className="mb-3 text-base font-semibold text-text-primary">
        How many passengers are expected for the trip?
      </p>
      <div className="max-w-[160px]">
        <FloatingLabelInput
          label="# Passengers"
          type="number"
          min={1}
          max={20}
          placeholder=""
          value={value || ''}
          onChange={(e) => {
            const num = parseInt(e.target.value, 10)
            console.log('[PassengersField] Passengers changed:', num)
            onChange(isNaN(num) ? 0 : num)
          }}
          icon={<Hash className="h-4 w-4" />}
          error={error}
        />
      </div>
    </div>
  )
}
