export interface TravelDocument {
  id: string
  name: string
  type: 'exit' | 'entry' | 'physical' | 'optional'
  completed: boolean
  confidence: number
  missingFields: string[]
  pdfUrl?: string
  officialUrl: string
  lastVerified: string
}

export interface ExtractedData {
  firstName: string
  lastName: string
  passportNumber: string
  dateOfBirth: string
  nationality: string
  passportExpiry: string
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  flightNumber: string
  hotelName?: string
  hotelAddress?: string
  confidence: number
}

export interface TripRequirement {
  id: string
  category: 'exit' | 'entry' | 'physical' | 'optional'
  name: string
  description: string
  userHas: boolean
}

export interface Trip {
  id: string
  userId?: string
  extractedData: ExtractedData
  requirements: TripRequirement[]
  documents: TravelDocument[]
  plan: 'standard' | 'premium'
  price: number
  status: 'uploading' | 'extracting' | 'verifying' | 'requirements' | 'payment' | 'processing' | 'completed'
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isAdmin: boolean
}

export interface AffiliatePartner {
  id: string
  name: string
  category: 'sim' | 'hotel' | 'insurance' | 'tours' | 'transport'
  commission: number
  url: string
  logo: string
}

export interface AffiliateClick {
  id: string
  partnerId: string
  userId?: string
  tripId: string
  clickedAt: string
  converted: boolean
  revenue: number
}
