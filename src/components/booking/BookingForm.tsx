import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { TripTypeToggle } from '@/components/layout/Header'
import { LocationTypeToggle } from '@/components/booking/LocationTypeToggle'
import { DateTimeFields, SectionLabel } from '@/components/booking/DateTimeFields'
import { StopsList, createEmptyStop } from '@/components/booking/StopsList'
import { ContactSection, PassengersField } from '@/components/booking/ContactSection'
import { PlaceAutocompleteInput } from '@/components/maps/PlaceAutocompleteInput'
import { RouteMap } from '@/components/maps/RouteMap'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBooking } from '@/context/BookingContext'
import { bookingFormSchema, type BookingFormValues } from '@/lib/validation'
import type { BookingFormData, LocationData } from '@/types/booking'

function toFormValues(data: BookingFormData): BookingFormValues {
  return {
    tripType: data.tripType,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime,
    pickupLocationType: data.pickupLocationType,
    pickupLocation: data.pickupLocation,
    stops: data.stops,
    dropoffLocationType: data.dropoffLocationType,
    dropoffLocation: data.dropoffLocation,
    hours: data.hours,
    phone: data.phone,
    isKnownCustomer: data.isKnownCustomer,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passengers: data.passengers,
  }
}

export function BookingForm() {
  const navigate = useNavigate()
  const { formData, setFormData } = useBooking()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: toFormValues(formData),
  })

  const tripType = watch('tripType')
  const pickupLocation = watch('pickupLocation')
  const dropoffLocation = watch('dropoffLocation')
  const stops = watch('stops')
  const pickupLocationType = watch('pickupLocationType')
  const dropoffLocationType = watch('dropoffLocationType')

  const airportTypes = ['airport']

  const onSubmit = (values: BookingFormValues) => {
    console.log('[BookingForm] Validation passed, navigating to confirmation')
    const data: BookingFormData = {
      ...values,
      pickupLocation: values.pickupLocation,
      dropoffLocation: values.dropoffLocation,
    }
    setFormData(data)
    navigate('/confirmation')
  }

  const onError = () => {
    console.log('[BookingForm] Validation failed:', errors)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      <Controller
        name="tripType"
        control={control}
        render={({ field }) => (
          <TripTypeToggle
            value={field.value}
            onChange={(v) => {
              field.onChange(v)
              if (v === 'hourly') {
                setValue('dropoffLocation', null)
              }
            }}
          />
        )}
      />

      <section>
        <SectionLabel>Pickup</SectionLabel>
        <Controller
          name="pickupDate"
          control={control}
          render={({ field: dateField }) => (
            <Controller
              name="pickupTime"
              control={control}
              render={({ field: timeField }) => (
                <DateTimeFields
                  date={dateField.value}
                  time={timeField.value}
                  onDateChange={dateField.onChange}
                  onTimeChange={timeField.onChange}
                  dateError={errors.pickupDate?.message}
                  timeError={errors.pickupTime?.message}
                />
              )}
            />
          )}
        />

        <Controller
          name="pickupLocationType"
          control={control}
          render={({ field }) => (
            <LocationTypeToggle value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          name="pickupLocation"
          control={control}
          render={({ field }) => (
            <PlaceAutocompleteInput
              id="pickup"
              value={field.value?.address ?? ''}
              onChange={(address) =>
                field.onChange({ ...(field.value ?? { lat: 0, lng: 0 }), address })
              }
              onPlaceSelect={(location: LocationData) => field.onChange(location)}
              placeholder="Enter pickup location"
              types={pickupLocationType === 'airport' ? airportTypes : undefined}
              error={errors.pickupLocation?.message}
            />
          )}
        />

        <div className="mt-3">
          <Controller
            name="stops"
            control={control}
            render={({ field }) => (
              <StopsList
                stops={field.value}
                onAddStop={() => {
                  console.log('[BookingForm] Stop added — clearing direct route until stop location is set')
                  field.onChange([...field.value, createEmptyStop()])
                }}
                onRemoveStop={(index) => {
                  console.log('[BookingForm] Stop removed at index', index, '— route will refresh')
                  field.onChange(field.value.filter((_, i) => i !== index))
                }}
                onStopChange={(index, address) => {
                  const updated = [...field.value]
                  updated[index] = { ...updated[index], address }
                  field.onChange(updated)
                }}
                onStopSelect={(index, location) => {
                  console.log('[BookingForm] Stop selected at index', index, ':', location.address)
                  const updated = [...field.value]
                  updated[index] = location
                  field.onChange(updated)
                }}
                errors={{}}
              />
            )}
          />
        </div>
      </section>

      {tripType === 'one-way' ? (
        <section>
          <SectionLabel>Drop off</SectionLabel>
          <Controller
            name="dropoffLocationType"
            control={control}
            render={({ field }) => (
              <LocationTypeToggle value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            name="dropoffLocation"
            control={control}
            render={({ field }) => (
              <PlaceAutocompleteInput
                id="dropoff"
                value={field.value?.address ?? ''}
                onChange={(address) =>
                  field.onChange({ ...(field.value ?? { lat: 0, lng: 0 }), address })
                }
                onPlaceSelect={(location: LocationData) => field.onChange(location)}
                placeholder="Enter drop-off location"
                types={dropoffLocationType === 'airport' ? airportTypes : undefined}
                error={errors.dropoffLocation?.message}
              />
            )}
          />
        </section>
      ) : (
        <section>
          <SectionLabel>Duration</SectionLabel>
          <Controller
            name="hours"
            control={control}
            render={({ field }) => (
              <div>
                <Select
                  value={field.value?.toString() ?? ''}
                  onValueChange={(v) => {
                    console.log('[BookingForm] Hours selected:', v)
                    field.onChange(parseInt(v, 10))
                  }}
                >
                  <SelectTrigger className="max-w-[200px]">
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => i + 2).map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hours && (
                  <p className="text-xs text-red-500 mt-1">{errors.hours.message}</p>
                )}
              </div>
            )}
          />
        </section>
      )}

      <RouteMap
        pickup={pickupLocation}
        dropoff={tripType === 'one-way' ? dropoffLocation : null}
        stops={stops}
        className="w-full"
        height="240px"
      />

      <section>
        <SectionLabel>Contact Information</SectionLabel>
        <Controller
          name="phone"
          control={control}
          render={({ field: phoneField }) => (
            <Controller
              name="isKnownCustomer"
              control={control}
              render={({ field: knownField }) => (
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field: fnField }) => (
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field: lnField }) => (
                        <Controller
                          name="email"
                          control={control}
                          render={({ field: emailField }) => (
                            <ContactSection
                              phone={phoneField.value}
                              isKnownCustomer={knownField.value}
                              firstName={fnField.value}
                              lastName={lnField.value}
                              email={emailField.value}
                              onPhoneChange={phoneField.onChange}
                              onKnownCustomerChange={(known, customer) => {
                                knownField.onChange(known)
                                if (customer) {
                                  fnField.onChange(customer.firstName)
                                  lnField.onChange(customer.lastName)
                                  emailField.onChange(customer.email)
                                }
                              }}
                              onFirstNameChange={fnField.onChange}
                              onLastNameChange={lnField.onChange}
                              onEmailChange={emailField.onChange}
                              errors={{
                                phone: errors.phone?.message,
                                firstName: errors.firstName?.message,
                                lastName: errors.lastName?.message,
                                email: errors.email?.message,
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          )}
        />
      </section>

      <Controller
        name="passengers"
        control={control}
        render={({ field }) => (
          <PassengersField
            value={field.value}
            onChange={field.onChange}
            error={errors.passengers?.message}
          />
        )}
      />

      <Button type="submit" className="w-full" size="lg">
        Continue
      </Button>
    </form>
  )
}
