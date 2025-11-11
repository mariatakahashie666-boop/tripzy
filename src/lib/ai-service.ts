import { ExtractedData, TripRequirement, TravelDocument } from '@/types'

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const simulateDocumentExtraction = async (files: File[]): Promise<ExtractedData> => {
  try {
    const passportFile = files[0]
    const ticketFile = files[1]
    
    const passportDataUrl = await convertFileToBase64(passportFile)
    const ticketDataUrl = files.length > 1 ? await convertFileToBase64(ticketFile) : null
    
    const passportPromptText = `You are an expert document extraction AI specialized in reading passports and travel documents. 

Carefully analyze the passport image provided below and extract ALL visible information with extreme accuracy.

Extract the following information and return it in a JSON object with a single property called "data" that contains:
- firstName: The given name(s) / first name as shown on passport (exactly as written)
- lastName: The surname / family name / last name as shown on passport (exactly as written)
- passportNumber: The passport/document number
- dateOfBirth: Date of birth in YYYY-MM-DD format
- nationality: Country of citizenship (full country name)
- passportExpiry: Passport expiration date in YYYY-MM-DD format

IMPORTANT INSTRUCTIONS:
1. Extract names EXACTLY as they appear on the passport - preserve capitalization, spacing, and formatting
2. Look carefully at the MRZ (machine readable zone) at the bottom if present - it contains accurate data
3. For dates, convert to YYYY-MM-DD format (e.g., "15 MAY 1990" becomes "1990-05-15")
4. If you cannot read a field with 100% confidence, extract your best reading but note lower confidence
5. Return ONLY the JSON object, no additional text

Passport image: ${passportDataUrl}

Return format:
{
  "data": {
    "firstName": "...",
    "lastName": "...",
    "passportNumber": "...",
    "dateOfBirth": "YYYY-MM-DD",
    "nationality": "...",
    "passportExpiry": "YYYY-MM-DD"
  }
}`
    
    const passportPrompt = window.spark.llmPrompt([passportPromptText], passportDataUrl)
    const passportData = await window.spark.llm(passportPrompt, "gpt-4o", true)
    const parsedPassportResponse = JSON.parse(passportData)
    const parsedPassport = parsedPassportResponse.data || parsedPassportResponse
    
    let travelData = {
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      flightNumber: ''
    }
    
    if (ticketDataUrl) {
      const ticketPromptText = `You are an expert document extraction AI specialized in reading flight tickets, boarding passes, and booking confirmations.

Carefully analyze the flight ticket/booking confirmation image provided below and extract ALL visible flight information.

Extract the following information and return it in a JSON object with a single property called "data" that contains:
- origin: Departure city and country (e.g., "Manila, Philippines")
- destination: Arrival city and country (e.g., "Bangkok, Thailand")
- departureDate: Departure date in YYYY-MM-DD format
- returnDate: Return date in YYYY-MM-DD format (if shown; otherwise use empty string "")
- flightNumber: Flight number with airline code (e.g., "PR732", "TG123")

IMPORTANT INSTRUCTIONS:
1. Look for departure/origin city and arrival/destination city
2. Extract the FULL flight number including airline code
3. Convert all dates to YYYY-MM-DD format
4. If this is a one-way ticket with no return date, set returnDate to ""
5. Include country names for origin and destination
6. Return ONLY the JSON object, no additional text

Flight ticket image: ${ticketDataUrl}

Return format:
{
  "data": {
    "origin": "City, Country",
    "destination": "City, Country",
    "departureDate": "YYYY-MM-DD",
    "returnDate": "YYYY-MM-DD or empty string",
    "flightNumber": "XX123"
  }
}`
      
      const ticketPrompt = window.spark.llmPrompt([ticketPromptText], ticketDataUrl)
      const ticketData = await window.spark.llm(ticketPrompt, "gpt-4o", true)
      const parsedTravelResponse = JSON.parse(ticketData)
      travelData = parsedTravelResponse.data || parsedTravelResponse
    }
    
    const confidence = (parsedPassport.firstName && parsedPassport.lastName && parsedPassport.passportNumber) ? 95 : 70
    
    return {
      firstName: parsedPassport.firstName || '',
      lastName: parsedPassport.lastName || '',
      passportNumber: parsedPassport.passportNumber || '',
      dateOfBirth: parsedPassport.dateOfBirth || '',
      nationality: parsedPassport.nationality || '',
      passportExpiry: parsedPassport.passportExpiry || '',
      origin: travelData.origin || '',
      destination: travelData.destination || '',
      departureDate: travelData.departureDate || '',
      returnDate: travelData.returnDate || '',
      flightNumber: travelData.flightNumber || '',
      confidence
    }
  } catch (error) {
    console.error('Error extracting document data:', error)
    return {
      firstName: '',
      lastName: '',
      passportNumber: '',
      dateOfBirth: '',
      nationality: '',
      passportExpiry: '',
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      flightNumber: '',
      confidence: 0
    }
  }
}

export const analyzeRequirements = async (
  origin: string,
  destination: string,
  nationality: string
): Promise<TripRequirement[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const isThailand = destination.toLowerCase().includes('thailand')
  const isPhilippines = origin.toLowerCase().includes('philippines')
  
  const requirements: TripRequirement[] = []
  
  if (isPhilippines) {
    requirements.push(
      {
        id: 'ph-etravel',
        category: 'exit',
        name: 'eTravel Registration',
        description: 'Required for all Philippine departures',
        userHas: false
      },
      {
        id: 'ph-customs',
        category: 'exit',
        name: 'Customs Declaration',
        description: 'Philippine customs clearance form',
        userHas: false
      }
    )
  }
  
  if (isThailand) {
    requirements.push(
      {
        id: 'th-arrival',
        category: 'entry',
        name: 'Thailand Arrival Card',
        description: 'TM.6 Immigration form',
        userHas: false
      },
      {
        id: 'th-declaration',
        category: 'entry',
        name: 'Thailand Arrival Declaration',
        description: 'Health and customs declaration',
        userHas: false
      }
    )
  }
  
  requirements.push(
    {
      id: 'passport-valid',
      category: 'physical',
      name: 'Valid Passport',
      description: 'Must be valid for 6+ months',
      userHas: false
    },
    {
      id: 'return-ticket',
      category: 'physical',
      name: 'Return Ticket',
      description: 'Proof of onward travel',
      userHas: false
    },
    {
      id: 'hotel-confirm',
      category: 'optional',
      name: 'Hotel Confirmation',
      description: 'Accommodation proof',
      userHas: false
    },
    {
      id: 'travel-insurance',
      category: 'optional',
      name: 'Travel Insurance',
      description: 'Recommended coverage',
      userHas: false
    }
  )
  
  return requirements
}

export const generateDocuments = async (
  data: ExtractedData,
  requirements: TripRequirement[]
): Promise<TravelDocument[]> => {
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const documents: TravelDocument[] = []
  
  requirements.forEach(req => {
    if (req.category === 'exit' || req.category === 'entry') {
      const missingFields: string[] = []
      
      if (!data.hotelAddress) {
        missingFields.push('Hotel address in destination')
      }
      
      if (req.id === 'th-arrival' && Math.random() > 0.5) {
        missingFields.push('Thailand phone number')
      }
      
      documents.push({
        id: req.id,
        name: req.name,
        type: req.category,
        completed: missingFields.length === 0,
        confidence: 85 + Math.random() * 14,
        missingFields,
        officialUrl: getOfficialUrl(req.id),
        lastVerified: new Date().toISOString()
      })
    }
  })
  
  return documents
}

const getOfficialUrl = (docId: string): string => {
  const urls: Record<string, string> = {
    'ph-etravel': 'https://etravel.gov.ph',
    'ph-customs': 'https://customs.gov.ph',
    'th-arrival': 'https://immigration.go.th',
    'th-declaration': 'https://immigration.go.th'
  }
  return urls[docId] || 'https://gov.example'
}
