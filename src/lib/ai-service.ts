import { ExtractedData, TripRequirement, TravelDocument, FlightLeg } from '@/types'

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
      console.error('❌ No files provided for extraction')
      throw new Error('No files provided for extraction')
    }

    const passportFile = files[0]
    const ticketFile = files.length > 1 ? files[1] : null
    
    console.log('📄 Starting document extraction...')
    console.log('📸 Passport file:', passportFile.name, passportFile.type, `${(passportFile.size / 1024).toFixed(2)} KB`)
    if (ticketFile) {
      console.log('🎫 Ticket file:', ticketFile.name, ticketFile.type, `${(ticketFile.size / 1024).toFixed(2)} KB`)
    }
    
    console.log('🔄 Converting passport to base64...')
    const passportDataUrl = await convertFileToBase64(passportFile)
    console.log('✅ Passport converted, data length:', passportDataUrl.length)
    
    if (!passportDataUrl.startsWith('data:image/')) {
      console.error('❌ Invalid image format for passport')
      throw new Error('Passport must be an image file')
    }
    
    // @ts-ignore - TypeScript has issues with template literals in certain contexts
    const passportPrompt = window.spark.llmPrompt`You are an expert OCR and document extraction AI specialized in reading passports. You have vision capabilities to analyze images.

ANALYZE THIS PASSPORT IMAGE AND EXTRACT ALL INFORMATION:

Image: ${passportDataUrl}

CRITICAL EXTRACTION RULES:

1. **MRZ (Machine Readable Zone)** - Two lines at bottom of passport:
- Line 1: P<COUNTRY<<SURNAME<<GIVEN_NAMES<<<<<<
- Line 2: PASSPORT_NUM<NATIONALITY<BIRTH_DATE<SEX<EXPIRY_DATE
- Example: P<PHL<DELA<CRUZ<<JUAN<PEDRO<<<<<<<<<<<
         AB1234567<PHL<900515<M<301231<<<<<<<<<

2. **Name Extraction**:
- MRZ uses << to separate surname from given names
- < represents spaces in names
- Extract EXACTLY as shown, preserve case
- Example: "DELA<CRUZ<<JUAN<PEDRO" → lastName: "DELA CRUZ", firstName: "JUAN PEDRO"

3. **Date Conversion**:
- MRZ dates are YYMMDD format
- 00-30 = 2000-2030, 31-99 = 1931-1999
- Convert to YYYY-MM-DD
- Example: "900515" → "1990-05-15", "251225" → "2025-12-25"

4. **Passport Number**:
- Found at top right AND in MRZ second line
- Extract full alphanumeric code
- Example: "P1234567", "AB9876543"

5. **Nationality**:
- MRZ shows 3-letter code (PHL, THA, USA, etc.)
- Convert to full country name in English
- PHL → Philippines, THA → Thailand, USA → United States, SGP → Singapore

6. **Verification**:
- Cross-reference MRZ data with human-readable fields at top
- Use the clearest, most complete data

RETURN FORMAT - Valid JSON only, no markdown:
{
"data": {
"firstName": "EXACT GIVEN NAME(S)",
"lastName": "EXACT SURNAME",
"passportNumber": "FULL NUMBER",
"dateOfBirth": "YYYY-MM-DD",
"nationality": "Full Country Name",
"passportExpiry": "YYYY-MM-DD"
}
}

IMPORTANT: 
- Read the ACTUAL image, don't make up data
- If a field is unreadable, use empty string ""
- Preserve exact spelling and capitalization from document
- Focus on MRZ for accuracy - it's machine-readable and standardized`
    
    console.log('🤖 Sending passport to GPT-4 Vision for analysis...')
    
    const passportResponse = await window.spark.llm(passportPrompt, "gpt-4o", true)
    console.log('✅ GPT-4 Response received (Passport)')
    console.log('📋 Raw response:', passportResponse.substring(0, 200) + '...')
    
    const parsedPassportResponse = JSON.parse(passportResponse)
    const parsedPassport = parsedPassportResponse.data || parsedPassportResponse
    
    console.log('✅ Parsed passport data:', {
      firstName: parsedPassport.firstName || '(empty)',
      lastName: parsedPassport.lastName || '(empty)',
      passportNumber: parsedPassport.passportNumber || '(empty)',
      dateOfBirth: parsedPassport.dateOfBirth || '(empty)',
      nationality: parsedPassport.nationality || '(empty)',
      passportExpiry: parsedPassport.passportExpiry || '(empty)'
    })
    
    let travelData = {
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      flightNumber: ''
    }
    
    if (ticketFile) {
      try {
        console.log('🔄 Converting ticket to base64...')
        const ticketDataUrl = await convertFileToBase64(ticketFile)
        console.log('✅ Ticket converted, data length:', ticketDataUrl.length)
        
        // @ts-ignore - TypeScript has issues with template literals in certain contexts
        const ticketPrompt = window.spark.llmPrompt`You are an expert OCR and travel document AI with vision capabilities. Extract flight information from this booking confirmation or e-ticket.

ANALYZE THIS FLIGHT DOCUMENT:

Image: ${ticketDataUrl}

EXTRACTION RULES:

1. **Airport Codes** (3-letter IATA codes):
   - MNL = Manila, Philippines
   - BKK = Bangkok, Thailand  
   - HKG = Hong Kong, China
   - SIN = Singapore, Singapore
   - TPE = Taipei, Taiwan
   - ICN = Seoul, South Korea
   - NRT/HND = Tokyo, Japan
   - DXB = Dubai, UAE
   - Look for format: "XXX → YYY" or "From: XXX To: YYY"

2. **Flight Number**:
   - Airline code + number: PR732, 5J123, CX902, TG620
   - Common airlines: PR=Philippine Airlines, 5J=Cebu Pacific, CX=Cathay Pacific, TG=Thai Airways

3. **Dates**:
   - Handle all formats: "15 DEC 2024", "Dec 15, 2024", "12/15/24", "2024-12-15"
   - Convert to YYYY-MM-DD
   - Look for "Departure", "Outbound", "Depart" for departure date
   - Look for "Return", "Inbound" for return date

4. **Origin & Destination**:
   - Extract full city name and country
   - Format: "City, Country"
   - Example: "Manila, Philippines" → "Bangkok, Thailand"

RETURN FORMAT - Valid JSON only:
{
  "data": {
    "origin": "City, Country",
    "destination": "City, Country", 
    "departureDate": "YYYY-MM-DD",
    "returnDate": "YYYY-MM-DD or empty string if one-way",
    "flightNumber": "Airline code + number"
  }
}

CRITICAL:
- Analyze the ACTUAL image content
- If field is unclear or missing, use empty string ""
- Don't guess - extract only what you can read clearly`
        
        console.log('🤖 Sending ticket to GPT-4 Vision for analysis...')
        
        const ticketResponse = await window.spark.llm(ticketPrompt, "gpt-4o", true)
        console.log('✅ GPT-4 Response received (Ticket)')
        console.log('📋 Raw response:', ticketResponse.substring(0, 200) + '...')
        
        const parsedTravelResponse = JSON.parse(ticketResponse)
        travelData = parsedTravelResponse.data || parsedTravelResponse
        
        console.log('✅ Parsed travel data:', {
          origin: travelData.origin || '(empty)',
          destination: travelData.destination || '(empty)',
          departureDate: travelData.departureDate || '(empty)',
          returnDate: travelData.returnDate || '(empty)',
          flightNumber: travelData.flightNumber || '(empty)'
        })
      } catch (ticketError) {
        console.error('⚠️ Error extracting ticket data (continuing with passport data only):', ticketError)
      }
    }
    
    const hasRequiredPassportFields = parsedPassport.firstName && parsedPassport.lastName && parsedPassport.passportNumber
    const hasGoodTravelData = travelData.origin && travelData.destination && travelData.departureDate
    const hasAllPassportFields = hasRequiredPassportFields && parsedPassport.dateOfBirth && parsedPassport.nationality && parsedPassport.passportExpiry
    const hasAllTravelFields = hasGoodTravelData && travelData.flightNumber
    
    let confidence = 0
    if (hasAllPassportFields && hasAllTravelFields) {
      confidence = 98
    } else if (hasRequiredPassportFields && hasGoodTravelData) {
      confidence = 92
    } else if (hasRequiredPassportFields && travelData.destination) {
      confidence = 85
    } else if (hasRequiredPassportFields) {
      confidence = 75
    } else if (parsedPassport.firstName && parsedPassport.lastName) {
      confidence = 55
    } else if (parsedPassport.firstName || parsedPassport.lastName) {
      confidence = 35
    } else {
      confidence = 0
    }
    
    console.log('📊 Final confidence score:', confidence + '%')
    
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
    
    console.log('🎉 Final extracted data summary:', {
      hasName: !!(result.firstName && result.lastName),
      hasPassport: !!result.passportNumber,
      hasTravel: !!(result.origin && result.destination),
      confidence: result.confidence + '%'
    })
    
    return result
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in document extraction:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    
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
  nationality: string,
  transitCountries?: string[],
  flightLegs?: FlightLeg[]
): Promise<TripRequirement[]> => {
  console.log('🔍 Analyzing requirements for:')
  console.log('  👤 Nationality:', nationality)
  console.log('  📍 Departing from:', origin)
  console.log('  ✈️ Going to:', destination)
  if (transitCountries && transitCountries.length > 0) {
    console.log('  🔄 Transit countries:', transitCountries.join(', '))
  }
  if (flightLegs && flightLegs.length > 0) {
    console.log('  ✈️ Multi-leg flight with', flightLegs.length, 'legs')
    flightLegs.forEach((leg, i) => {
      console.log(`    Leg ${i + 1}: ${leg.from} → ${leg.to} (${leg.date})`)
      if (leg.transitDuration) {
        console.log(`      Layover: ${leg.transitDuration}`)
      }
    })
  }
  console.log('')
  console.log('⚠️ CRITICAL CHECK: Philippines eTravel Requirements')
  const isDepartingFromPhilippines = origin.toLowerCase().includes('philippines') || origin.toLowerCase().includes('manila')
  const isFilipino = nationality.toLowerCase().includes('philippines') || nationality.toLowerCase().includes('filipino')
  console.log('  - Is departing from Philippines?', isDepartingFromPhilippines ? '✅ YES' : '❌ NO')
  console.log('  - Is Filipino citizen?', isFilipino ? '✅ YES' : '❌ NO')
  console.log('  - Should include PH eTravel?', (isDepartingFromPhilippines || isFilipino) ? '✅ YES - Required' : '❌ NO - Not required')
  console.log('')
  
  // @ts-ignore - TypeScript has issues with template literals in certain contexts
  const prompt = window.spark.llmPrompt`You are a travel document requirements expert with access to current immigration regulations. Analyze the trip details and provide ALL required documents including transit country requirements.

TRIP DETAILS:
- Traveler Nationality: ${nationality}
- Current Location (Departure): ${origin}
- Destination: ${destination}
${transitCountries && transitCountries.length > 0 ? `- Transit Countries: ${transitCountries.join(', ')}` : ''}
${flightLegs && flightLegs.length > 0 ? `
- Multi-Leg Flight:
${flightLegs.map((leg, i) => `  Leg ${i + 1}: ${leg.from} → ${leg.to} on ${leg.date}${leg.transitDuration ? ` (Layover: ${leg.transitDuration})` : ''}`).join('\n')}
` : ''}

CRITICAL INSTRUCTIONS:
1. **Research ACTUAL current requirements** - Don't make assumptions, use real immigration requirements
2. **ANALYZE ALL THREE FACTORS** before determining requirements:
   - What is the traveler's NATIONALITY?
   - Where is the traveler CURRENTLY (departure country)?
   - Where is the traveler GOING (destination country)?

3. **TRANSIT VISA REQUIREMENTS** (if transit countries are present):
   - For each transit country, determine if a transit visa is required
   - Consider layover duration (short layovers <24h may not require visa if staying airside)
   - Check nationality-specific transit visa exemptions
   - Add category "transit" for transit-specific documents
   - Mark isTransitRequirement: true for transit documents
   - Include transitDuration in description if relevant

4. Categorize each document:
   - "exit": Documents required by ORIGIN country to LEAVE (departure forms, exit permits)
   - "entry": Documents required by DESTINATION country to ENTER (arrival cards, visas, entry permits)
   - "transit": Documents required for TRANSIT through connecting countries (transit visas, airside permits)
   - "physical": Physical documents that MUST be carried (passport, vaccination cards, tickets)
   - "optional": Recommended but NOT mandatory (travel insurance, tourist bookings)

5. For each document specify:
   - deliveryType: "online" (can be submitted online/digital) OR "physical" (must physically carry)
   - country: Which country requires it
   - officialUrl: OFFICIAL government website URL (.gov/.gov.sg/.go.th domains)
   - verifiedSource: Official source name
   - tips: When to submit, processing time, exemptions
   - isTransitRequirement: true if it's for a transit country (optional field)

KNOWN REQUIREMENTS (USE THESE AS REFERENCE):

PHILIPPINES eTravel Registration - IMPORTANT EXEMPTION RULES:
⚠️ CRITICAL: Philippines eTravel is ONLY required for travelers who are CURRENTLY IN THE PHILIPPINES and DEPARTING FROM THE PHILIPPINES.
- If traveler's nationality is NOT Filipino/Philippines AND departure country is NOT Philippines → DO NOT INCLUDE eTravel
- If traveler's nationality is Filipino OR departure country is Philippines → INCLUDE eTravel
- Examples:
  ✓ Filipino departing from Manila to Bangkok → REQUIRES eTravel
  ✓ American departing from Manila to Singapore → REQUIRES eTravel (currently in PH)
  ✗ American departing from USA to Bangkok → NO eTravel needed
  ✗ Thai departing from Bangkok to Singapore → NO eTravel needed
  ✗ Any foreigner NOT in Philippines → NO eTravel needed

When eTravel IS required:
- Category: "exit"
- DeliveryType: "online"
- Submit within 72 hours before departure
- URL: https://etravel.gov.ph
- Source: Bureau of Immigration Philippines
- Description: "Required online departure registration for all passengers departing from Philippines airports"

SINGAPORE ENTRY:
- Singapore Arrival Card (SG Arrival Card) - REQUIRED for ALL visitors entering Singapore
  - Category: "entry"
  - DeliveryType: "online"
  - Submit up to 3 days before arrival
  - URL: https://eservices.ica.gov.sg/sgarrivalcard
  - Source: Immigration & Checkpoints Authority (ICA)
  - Applies to ALL nationalities entering Singapore

SINGAPORE TRANSIT:
- Many nationalities can transit Singapore airside without visa if staying <24 hours
- Check Transit Without Visa (TWOV) facility eligibility
- Some nationalities require transit visa even for short layovers

THAILAND ENTRY:
- Thailand Arrival Card (TM.6) - REQUIRED for ALL visitors
  - Category: "entry"
  - DeliveryType: "physical"
  - Given on plane or at airport
  - URL: https://www.immigration.go.th
  - Applies to ALL nationalities entering Thailand

VISA REQUIREMENTS:
- Check if nationality requires visa for destination
- Consider visa-free agreements and duration
- If visa-free, mention duration allowed
- If visa required, specify type and application process

RETURN FORMAT (JSON only, no markdown):
{
  "requirements": [
    {
      "id": "sg-arrival-card",
      "category": "entry",
      "name": "Singapore Arrival Card",
      "description": "Mandatory online arrival declaration for all visitors entering Singapore",
      "deliveryType": "online",
      "country": "Singapore",
      "officialUrl": "https://eservices.ica.gov.sg/sgarrivalcard",
      "verifiedSource": "Immigration & Checkpoints Authority (ICA)",
      "tips": "Submit up to 3 days before arrival. Save the QR code to show at immigration."
    },
    {
      "id": "ai-itinerary",
      "category": "optional",
      "name": "🤖 AI Travel Itinerary & Local Guide",
      "description": "Get personalized restaurant recommendations, must-visit places, local cuisine guide, and must-do activities for your destination",
      "deliveryType": "online",
      "tips": "AI-powered suggestions based on your destination. Includes best restaurants, hidden gems, local foods to try, and cultural experiences.",
      "price": 1,
      "highlight": true
    }
  ]
}

IMPORTANT:
- ALWAYS check nationality AND current location (departure) before including Philippines eTravel
- Foreigners NOT in Philippines do NOT need Philippines eTravel
- ALWAYS include the AI Travel Itinerary as the FIRST optional item with highlight: true and price: 1
- If destination is Singapore, Thailand, etc., MUST include their specific entry requirements
- deliveryType "online" means it can be submitted digitally (NOT just carrying digital copy)
- Physical documents that travelers already have (passport, tickets) should be category "physical"
- Don't confuse "optional tourist services" with "required entry documents"

Return ONLY valid JSON with the "requirements" array.`

  try {
    const response = await window.spark.llm(prompt, "gpt-4o", true)
    const parsed = JSON.parse(response)
    const requirements = parsed.requirements || []
    
    const formattedRequirements: TripRequirement[] = requirements.map((req: any, index: number) => ({
      id: req.id || `req-${index}`,
      category: req.category || 'optional',
      name: req.name || 'Unknown',
      description: req.description || '',
      deliveryType: req.deliveryType,
      country: req.country,
      officialUrl: req.officialUrl,
      verifiedSource: req.verifiedSource,
      tips: req.tips,
      userHas: false
    }))
    
    console.log('✅ Requirements analyzed:', formattedRequirements.length, 'items found')
    return formattedRequirements
    
  } catch (error) {
    console.error('❌ Error analyzing requirements:', error)
    return getFallbackRequirements(origin, destination, nationality)
  }
}

const getFallbackRequirements = (origin: string, destination: string, nationality?: string): TripRequirement[] => {
  const isDepartingFromPhilippines = origin.toLowerCase().includes('philippines') || origin.toLowerCase().includes('manila')
  const isSingapore = destination.toLowerCase().includes('singapore')
  const isThailand = destination.toLowerCase().includes('thailand')
  
  const requirements: TripRequirement[] = []
  
  if (isDepartingFromPhilippines) {
    requirements.push({
      id: 'ph-etravel',
      category: 'exit',
      name: 'eTravel Registration',
      description: 'Required online departure registration for all passengers departing from Philippines airports',
      deliveryType: 'online',
      country: 'Philippines',
      officialUrl: 'https://etravel.gov.ph',
      verifiedSource: 'Philippine Bureau of Immigration',
      tips: 'Submit within 72 hours before departure. Required for all passengers leaving the Philippines, regardless of nationality.',
      userHas: false
    })
  }
  
  if (isSingapore) {
    requirements.push({
      id: 'sg-arrival-card',
      category: 'entry',
      name: 'Singapore Arrival Card (SG Arrival Card)',
      description: 'Mandatory electronic arrival card required for ALL visitors entering Singapore. Must be submitted online.',
      deliveryType: 'online',
      country: 'Singapore',
      officialUrl: 'https://eservices.ica.gov.sg/sgarrivalcard',
      verifiedSource: 'Immigration & Checkpoints Authority (ICA)',
      tips: 'Submit up to 3 days before arrival. Save the QR code confirmation to show at immigration. Required for all nationalities.',
      userHas: false
    })
  }
  
  if (isThailand) {
    requirements.push(
      {
        id: 'th-arrival-card',
        category: 'entry',
        name: 'Thailand Arrival Card (TM.6)',
        description: 'Immigration card required for all visitors entering Thailand',
        deliveryType: 'physical',
        country: 'Thailand',
        officialUrl: 'https://www.immigration.go.th',
        verifiedSource: 'Thailand Immigration Bureau',
        tips: 'Usually provided on the plane or available at airport. Keep the departure portion safe.',
        userHas: false
      }
    )
  }
  
  requirements.push(
    {
      id: 'passport-valid',
      category: 'physical',
      name: 'Valid Passport',
      description: 'Passport must be valid for at least 6 months from date of entry',
      deliveryType: 'physical',
      tips: 'Check expiry date carefully. Most countries require 6 months validity.',
      userHas: false
    },
    {
      id: 'return-ticket',
      category: 'physical',
      name: 'Return/Onward Ticket',
      description: 'Proof of departure from destination country',
      deliveryType: 'physical',
      tips: 'Print or have electronic copy ready. Immigration may ask to see this.',
      userHas: false
    }
  )
  
  requirements.push(
    {
      id: 'ai-itinerary',
      category: 'optional',
      name: '🤖 AI Travel Itinerary & Local Guide',
      description: 'Get personalized restaurant recommendations, must-visit places, local cuisine guide, and must-do activities for your destination',
      deliveryType: 'online',
      tips: 'AI-powered suggestions based on your destination. Includes best restaurants, hidden gems, local foods to try, and cultural experiences.',
      userHas: false,
      price: 1,
      highlight: true
    },
    {
      id: 'vaccination-card',
      category: 'physical',
      name: 'Vaccination Card',
      description: 'Required if destination mandates proof of vaccination',
      deliveryType: 'physical',
      tips: 'Bring if your destination requires COVID-19 or other vaccinations. Check current health requirements.',
      userHas: false
    },
    {
      id: 'esim-service',
      category: 'optional',
      name: 'eSIM / Local Data',
      description: 'Stay connected with local mobile data',
      deliveryType: 'online',
      tips: 'Book eSIM before departure for instant connectivity upon arrival.',
      userHas: false
    },
    {
      id: 'hotel-booking',
      category: 'optional',
      name: 'Hotel Confirmation',
      description: 'Accommodation proof, may be requested by immigration',
      deliveryType: 'online',
      tips: 'Print or save digital copy. Some countries require this for visa-free entry.',
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

export const generateItinerary = async (destination: string): Promise<{
  restaurants: Array<{ name: string; cuisine: string; description: string; mustTry: string }>
  attractions: Array<{ name: string; category: string; description: string; tip: string }>
  foods: Array<{ name: string; description: string; where: string }>
  mustDo: Array<{ activity: string; description: string; bestTime: string }>
}> => {
  console.log('🗺️ Generating AI itinerary for:', destination)
  
  // @ts-ignore - TypeScript has issues with template literals in certain contexts
  const prompt = window.spark.llmPrompt`You are an expert travel guide with deep knowledge of local culture, cuisine, and hidden gems. Create a comprehensive travel itinerary for ${destination}.

DESTINATION: ${destination}

GENERATE:

1. **Top 5 Restaurants** (mix of famous and local favorites):
   - Name, cuisine type, what makes it special
   - Must-try dish at each restaurant

2. **Top 5 Places to Visit** (mix of popular and hidden gems):
   - Name, category (cultural/nature/shopping/etc)
   - Why it's worth visiting
   - Insider tip

3. **Top 5 Local Foods to Try**:
   - Dish name, description
   - Where to find it (street food/restaurants/markets)

4. **Top 5 Must-Do Activities**:
   - Activity name and description
   - Best time to do it

RETURN FORMAT (JSON only):
{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "description": "What makes it special",
      "mustTry": "Signature dish"
    }
  ],
  "attractions": [
    {
      "name": "Place Name",
      "category": "Category",
      "description": "Why visit",
      "tip": "Insider tip"
    }
  ],
  "foods": [
    {
      "name": "Food Name",
      "description": "What it is",
      "where": "Where to find it"
    }
  ],
  "mustDo": [
    {
      "activity": "Activity Name",
      "description": "What to do",
      "bestTime": "When to do it"
    }
  ]
}

Make recommendations authentic, practical, and exciting!`

  try {
    const response = await window.spark.llm(prompt, "gpt-4o", true)
    const parsed = JSON.parse(response)
    console.log('✅ Itinerary generated successfully')
    return parsed
  } catch (error) {
    console.error('❌ Error generating itinerary:', error)
    return {
      restaurants: [],
      attractions: [],
      foods: [],
      mustDo: []
    }
  }
}
