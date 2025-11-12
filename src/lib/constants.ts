import { AffiliatePartner } from '@/types'

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: 'klook',
    name: 'Klook',
    category: 'tours',
    commission: 10,
    url: 'https://www.klook.com',
    logo: 'klook'
  },
  {
    id: 'booking',
    name: 'Booking.com',
    category: 'hotel',
    commission: 5,
    url: 'https://www.booking.com',
    logo: 'booking'
  },
  {
    id: 'agoda',
    name: 'Agoda',
    category: 'hotel',
    commission: 5,
    url: 'https://www.agoda.com',
    logo: 'agoda'
  },
  {
    id: 'worldnomads',
    name: 'World Nomads',
    category: 'insurance',
    commission: 8,
    url: 'https://www.worldnomads.com',
    logo: 'worldnomads'
  },
  {
    id: 'airalo',
    name: 'Airalo',
    category: 'sim',
    commission: 10,
    url: 'https://www.airalo.com',
    logo: 'airalo'
  },
  {
    id: 'getyourguide',
    name: 'GetYourGuide',
    category: 'tours',
    commission: 7,
    url: 'https://www.getyourguide.com',
    logo: 'getyourguide'
  },
  {
    id: '12go',
    name: '12Go Asia',
    category: 'transport',
    commission: 6,
    url: 'https://12go.asia',
    logo: '12go'
  },
  {
    id: 'viator',
    name: 'Viator',
    category: 'tours',
    commission: 7,
    url: 'https://www.viator.com',
    logo: 'viator'
  }
]

export const calculatePrice = (
  documentCount: number,
  hasVisa: boolean,
  hoursUntilDeparture: number,
  connectingCountries: number
): number => {
  let price = 5
  
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

export const detectPriceWithAI = async (requirements: any[], extractedData: any): Promise<number> => {
  const documentCount = requirements.filter(r => r.category === 'exit' || r.category === 'entry').length
  const hasVisa = requirements.some(r => r.name.toLowerCase().includes('visa'))
  const hasReturn = extractedData?.returnDate && extractedData.returnDate !== ''
  
  let basePrice = 5
  
  if (documentCount > 2 || hasVisa) {
    basePrice = 8
  }
  
  if (hasReturn) {
    return 15
  }
  
  return basePrice
}
