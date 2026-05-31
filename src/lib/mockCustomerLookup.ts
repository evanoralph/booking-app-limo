const KNOWN_CUSTOMERS: Record<
  string,
  { firstName: string; lastName: string; email: string }
> = {
  '+17744153244': {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },
  '+19787066226': {
    firstName: 'Boundless',
    lastName: 'Customer',
    email: 'reservations@boundlesslimousine.com',
  },
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, '')
}

export interface CustomerLookupResult {
  found: boolean
  customer?: { firstName: string; lastName: string; email: string }
}

export async function lookupPhone(phone: string): Promise<CustomerLookupResult> {
  const normalized = normalizePhone(phone)
  console.log('[mockCustomerLookup] Looking up phone:', normalized)

  await new Promise((resolve) => setTimeout(resolve, 300))

  const customer = KNOWN_CUSTOMERS[normalized]
  if (customer) {
    console.log('[mockCustomerLookup] Customer found:', customer.firstName)
    return { found: true, customer }
  }

  console.log('[mockCustomerLookup] Customer not found, extra fields required')
  return { found: false }
}
