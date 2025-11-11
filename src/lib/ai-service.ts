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
    
    const passportPrompt = window.spark.llmPrompt`You are an expert document extraction AI specialized in reading passports and travel documents.

Analyze the provided passport image carefully and extract ALL visible information with extreme accuracy.

The passport image is provided as base64 data URL. IMPORTANT: You must analyze the actual image content.

Base64 Image Data: ${passportDataUrl}

CRITICAL INSTRUCTIONS:
1. Look at the MRZ (Machine Readable Zone) at the bottom of the passport - it's two lines of text with <<< symbols
2. MRZ first line format: P<COUNTRY_CODE<SURNAME<<GIVEN_NAMES<<<<<<<<<<<<<<
3. MRZ second line format: PASSPORT_NUMBER<NATIONALITY<BIRTH_DATE<SEX<EXPIRY_DATE
4. Names in MRZ use << to separate surname from given names, and < for spaces within names
5. Dates in MRZ are YYMMDD format - convert to YYYY-MM-DD (dates 00-30 are 2000s, 31-99 are 1900s)
6. Also read the human-readable text at the top of the passport for verification
7. Extract names EXACTLY as shown - preserve capitalization (e.g., "DELA CRUZ" not "dela cruz")
8. Passport number is usually at top right and in MRZ
9. Nationality should be the full country name in English (e.g., "Philippines" not "PHL")

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "data": {
    "firstName": "string (given name exactly as shown)",
    "lastName": "string (surname exactly as shown)",
    "passportNumber": "string (full passport number)",
    "dateOfBirth": "YYYY-MM-DD",
    "nationality": "string (full country name)",
    "passportExpiry": "YYYY-MM-DD"
  }
}

If you cannot read any field clearly, use an empty string "" for that field. Do not make up or guess information.`
    
    console.log('Sending passport to AI for analysis...')
    
    const passportResponse = await window.spark.llm(passportPrompt, "gpt-4o", true)
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
        
        const ticketPrompt = window.spark.llmPrompt`You are an expert document extraction AI specialized in reading flight tickets, boarding passes, and booking confirmations.

Analyze the provided flight/travel document carefully.

The flight ticket/booking confirmation image is provided as base64 data URL: ${ticketDataUrl}

CRITICAL INSTRUCTIONS:
1. Look for airport codes (3-letter IATA codes like MNL, BKK, HKG, SIN, etc.)
2. Common codes: MNL=Manila,Philippines / BKK=Bangkok,Thailand / HKG=Hong Kong / SIN=Singapore,Singapore / TPE=Taipei,Taiwan / ICN=Seoul,South Korea / NRT=Tokyo,Japan
3. Extract the FULL flight number including airline code (e.g., "PR732", "5J123", "CX902")
4. Look for departure and return dates carefully
5. Convert all dates to YYYY-MM-DD format (handle formats like "15 DEC 2024", "Dec 15", "12/15/24")
6. Include both city AND country for origin/destination

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "data": {
    "origin": "City, Country",
    "destination": "City, Country",
    "departureDate": "YYYY-MM-DD",
    "returnDate": "YYYY-MM-DD (or empty string if one-way)",
    "flightNumber": "string (full flight number with airline code)"
  }
}

If you cannot read any field clearly, use an empty string "" for that field. Do not make up or guess information.`
        
        console.log('Sending ticket to AI for analysis...')
        
        const ticketResponse = await window.spark.llm(ticketPrompt, "gpt-4o", true)
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
