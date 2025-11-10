import { ExtractedData, TripRequirement, TravelDocument } from '@/types'

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const simulateDocumentExtraction = async (files: File[]): Promise<ExtractedData> => {
  try {
    const passportFile = files[0]
    const ticketFile = files[1]
    
    const passportBase64 = await convertFileToBase64(passportFile)
    const ticketBase64 = files.length > 1 ? await convertFileToBase64(ticketFile) : null
    
    const passportPrompt = `You are a document extraction AI. Analyze this passport image and extract the following information in JSON format:
    - firstName (first/given name as shown on passport, all caps)
    - lastName (surname/family name as shown on passport, all caps)
    - passportNumber (passport number)
    - dateOfBirth (format: YYYY-MM-DD)
    - nationality (country of citizenship)
    - passportExpiry (expiry date, format: YYYY-MM-DD)
    
    If you cannot read a field clearly, make your best estimate based on what you can see.
    
    Image data: data:image/jpeg;base64,${passportBase64}
    
    Return ONLY a valid JSON object with these exact field names. No additional text.`
    
    const passportData = await window.spark.llm(passportPrompt, "gpt-4o", true)
    const parsedPassport = JSON.parse(passportData)
    
    let travelData = {
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      flightNumber: ''
    }
    
    if (ticketBase64) {
      const ticketPrompt = `You are a document extraction AI. Analyze this flight ticket/booking confirmation and extract the following information in JSON format:
      - origin (departure city and country)
      - destination (arrival city and country)
      - departureDate (format: YYYY-MM-DD)
      - returnDate (format: YYYY-MM-DD, if shown; otherwise use empty string)
      - flightNumber (e.g., PR732)
      
      If you cannot read a field clearly, make your best estimate.
      
      Image data: data:image/jpeg;base64,${ticketBase64}
      
      Return ONLY a valid JSON object with these exact field names. No additional text.`
      
      const ticketData = await window.spark.llm(ticketPrompt, "gpt-4o", true)
      travelData = JSON.parse(ticketData)
    }
    
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
      confidence: 95
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
