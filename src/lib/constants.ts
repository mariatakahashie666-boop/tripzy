import { AffiliatePartner } from '@/types'

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: 'klook',
    name: 'Klook',
    category: 'tours',
    commission: 10,
    url: 'https://www.klook.com',
    logo: '🎫'
  },
  {
    id: 'booking',
    name: 'Booking.com',
    category: 'hotel',
    commission: 5,
    url: 'https://www.booking.com',
    logo: '🏨'
  },
  {
    id: 'agoda',
    name: 'Agoda',
    category: 'hotel',
    commission: 5,
    url: 'https://www.agoda.com',
    logo: '🏨'
  },
  {
    id: 'worldnomads',
    name: 'World Nomads',
    category: 'insurance',
    commission: 8,
    url: 'https://www.worldnomads.com',
    logo: '🛡️'
  },
  {
    id: 'airalo',
    name: 'Airalo',
    category: 'sim',
    commission: 10,
    url: 'https://www.airalo.com',
    logo: '📱'
  },
  {
    id: 'getyourguide',
    name: 'GetYourGuide',
    category: 'tours',
    commission: 7,
    url: 'https://www.getyourguide.com',
    logo: '🗺️'
  },
  {
    id: '12go',
    name: '12Go Asia',
    category: 'transport',
    commission: 6,
    url: 'https://12go.asia',
    logo: '🚌'
  },
  {
    id: 'viator',
    name: 'Viator',
    category: 'tours',
    commission: 7,
    url: 'https://www.viator.com',
    logo: '🎭'
  }
]

export const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️' },
  { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
  { id: 'googlepay', name: 'Google Pay', icon: '🅖' },
  { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
  { id: 'gcash', name: 'GCash', icon: '💰' },
  { id: 'maya', name: 'Maya', icon: '💳' },
]

export const calculatePrice = (
  documentCount: number,
  hasVisa: boolean,
  hoursUntilDeparture: number,
  connectingCountries: number
): number => {
  let price = 8
  
  if (documentCount > 2) {
    price += (documentCount - 2) * 2
  }
  
  if (hasVisa) {
    price += 3
  }
  
  if (hoursUntilDeparture < 48) {
    price += 5
  }
  
  if (connectingCountries > 0) {
    price += connectingCountries * 2
  }
  
  return Math.min(price, 15)
}
