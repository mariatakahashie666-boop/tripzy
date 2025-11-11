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
    if (!files || files.length === 0) {
      throw new Error('No files provided for extraction')
    }

    const passportFile = files[0]
    const ticketFile = files.length > 1 ? files[1] : null
    
    console.log('Starting document extraction...')
    console.log('Passport file:', passportFile.name, passportFile.type, passportFile.size)
    if (ticketFile) {
      console.log('Ticket file:', ticketFile.name, ticketFile.type, ticketFile.size)
    }
    
    const passportDataUrl = await convertFileToBase64(passportFile)
    console.log('Passport converted to base64, length:', passportDataUrl.length)
    
    const passportPromptText = `You are an expert document extraction AI specialized in reading passports and travel documents.

Analyze the provided image carefully. It should contain a passport or travel document.

IMAGE DATA: ${passportDataUrl}

Extract ALL visible information with extreme accuracy and return it as a JSON object with a single property "data".

Required fields to extract:
- firstName: Given name(s) / first name (exactly as shown, preserve all caps if present)
- lastName: Surname / family name / last name (exactly as shown)
- passportNumber: The passport/document number (letters and numbers)
- dateOfBirth: Birth date in YYYY-MM-DD format
- nationality: Country of citizenship (full country name in English)
- passportExpiry: Expiration date in YYYY-MM-DD format

CRITICAL INSTRUCTIONS:
1. Look at the MRZ (Machine Readable Zone) at the bottom of the passport first - it's the most accurate
2. In the MRZ, the first line typically contains: document type, country code, and surname<<given names
3. The second line contains: passport number, nationality, birth date, sex, expiry date
4. Names in MRZ use << as separator between surname and given names, and < for spaces
5. Dates in MRZ are in YYMMDD format - convert to YYYY-MM-DD (be careful with century!)
6. Cross-reference MRZ data with the human-readable section above
7. Extract names EXACTLY - if it says "DELA CRUZ" keep it as "DELA CRUZ", not "dela cruz"
8. For dates like "15 MAY 90", determine if it's 1990 or 2090 based on context
9. If any field is unclear, provide your best extraction

Return ONLY valid JSON in this exact format:
{
  "data": {
    "firstName": "ACTUAL NAME FROM DOCUMENT",
    "lastName": "ACTUAL SURNAME FROM DOCUMENT",
    "passportNumber": "ACTUAL NUMBER",
    "dateOfBirth": "YYYY-MM-DD",
    "nationality": "COUNTRY NAME",
    "passportExpiry": "YYYY-MM-DD"
  }
}

DO NOT include any explanatory text, only the JSON object.`
    
    console.log('Sending passport to AI for analysis...')
    
    const passportResponse = await window.spark.llm(passportPromptText, "gpt-4o", true)
    console.log('AI Response (Passport):', passportResponse)
    
    const parsedPassportResponse = JSON.parse(passportResponse)
    const parsedPassport = parsedPassportResponse.data || parsedPassportResponse
    
    console.log('Parsed passport data:', parsedPassport)
    
    let travelData = {
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      flightNumber: ''
    }
    
    if (ticketFile) {
      try {
        const ticketDataUrl = await convertFileToBase64(ticketFile)
        console.log('Ticket converted to base64, length:', ticketDataUrl.length)
        
        const ticketPromptText = `You are an expert document extraction AI specialized in reading flight tickets, boarding passes, and booking confirmations.

Analyze the provided image carefully. It should contain flight/travel information.

IMAGE DATA: ${ticketDataUrl}

Extract ALL visible travel information and return it as a JSON object with a single property "data".

Required fields to extract:
- origin: Departure city and country (format: "City, Country")
- destination: Arrival city and country (format: "City, Country")
- departureDate: Departure date in YYYY-MM-DD format
- returnDate: Return date in YYYY-MM-DD format (empty string "" if not visible or one-way)
- flightNumber: Flight number with airline code (e.g., "PR732", "CX123")

IMPORTANT:
1. Look for airport codes (MNL, BKK, HKG, etc.) and convert them to city names
2. Common codes: MNL=Manila, BKK=Bangkok, HKG=Hong Kong, SIN=Singapore, TPE=Taipei
3. Extract the COMPLETE flight number including airline prefix
4. Convert all dates to YYYY-MM-DD format
5. Include the country name for both origin and destination
6. If no return date is shown, use empty string ""

Return ONLY valid JSON in this exact format:
{
  "data": {
    "origin": "City, Country",
    "destination": "City, Country",
    "departureDate": "YYYY-MM-DD",
    "returnDate": "YYYY-MM-DD or empty",
    "flightNumber": "XX123"
  }
}

DO NOT include any explanatory text, only the JSON object.`
        
        console.log('Sending ticket to AI for analysis...')
        
        const ticketResponse = await window.spark.llm(ticketPromptText, "gpt-4o", true)
        console.log('AI Response (Ticket):', ticketResponse)
        
        const parsedTravelResponse = JSON.parse(ticketResponse)
        travelData = parsedTravelResponse.data || parsedTravelResponse
        
        console.log('Parsed travel data:', travelData)
      } catch (ticketError) {
        console.error('Error extracting ticket data (will continue with passport data only):', ticketError)
      }
    }
    
    const hasRequiredPassportFields = parsedPassport.firstName && parsedPassport.lastName && parsedPassport.passportNumber
    const hasGoodTravelData = travelData.origin && travelData.destination && travelData.departureDate
    
    let confidence = 0
    if (hasRequiredPassportFields && hasGoodTravelData) {
      confidence = 95
    } else if (hasRequiredPassportFields) {
      confidence = 85
    } else if (parsedPassport.firstName || parsedPassport.lastName) {
      confidence = 60
    } else {
      confidence = 30
    }
    
    console.log('Final confidence:', confidence)
    
    const result = {
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
    
    console.log('Final extracted data:', result)
    return result
    
  } catch (error) {
    console.error('CRITICAL ERROR in document extraction:', error)
    
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
