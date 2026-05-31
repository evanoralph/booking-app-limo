import { useState } from 'react'
import { AtSign, User } from 'lucide-react'
import PhoneInput from 'react-phone-number-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
            'flex items-center rounded-md border bg-white px-3 phone-input',
            errors.phone ? 'border-red-500' : 'border-border'
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
          />
        </div>
        {lookingUp && (
          <p className="text-xs text-text-muted mt-1">Checking phone number...</p>
        )}
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {showExtraFields && (
        <>
          <p className="text-sm text-text-muted">
            We don&apos;t have that phone number on file. Please provide additional contact
            information.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                icon={<User className="h-4 w-4" />}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                icon={<User className="h-4 w-4" />}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              icon={<AtSign className="h-4 w-4" />}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
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
      <Label className="text-base mb-3 block">
        How many passengers are expected for the trip?
      </Label>
      <Input
        type="number"
        min={1}
        max={20}
        placeholder="# Passengers"
        value={value || ''}
        onChange={(e) => {
          const num = parseInt(e.target.value, 10)
          console.log('[PassengersField] Passengers changed:', num)
          onChange(isNaN(num) ? 0 : num)
        }}
        className={cn('max-w-[200px]', error && 'border-red-500')}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
