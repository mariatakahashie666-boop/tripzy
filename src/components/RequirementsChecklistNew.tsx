import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ExtractedData, TripRequirement } from '@/types'
import { ArrowSquareOut, ShieldCheck, Wallet, SimCard, Buildings, FirstAid, CarProfile } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface RequirementsChecklistProps {
  extractedData: ExtractedData
  travelType: 'tourist' | 'business'
  onProceed: (requirements: TripRequirement[]) => void
}

const AFFILIATE_RECOMMENDATIONS = [
  { 
    id: 'esim', 
    name: 'eSIM Card', 
    icon: SimCard, 
    description: 'Stay connected without physical SIM',
    provider: 'Airalo',
    url: 'https://airalo.com'
  },
  { 
    id: 'hotel', 
    name: 'Hotel Booking', 
    icon: Buildings, 
    description: 'Find great accommodation deals',
    provider: 'Booking.com',
    url: 'https://booking.com'
  },
  { 
    id: 'insurance', 
    name: 'Travel Insurance', 
    icon: FirstAid, 
    description: 'Protect yourself during travel',
    provider: 'World Nomads',
    url: 'https://worldnomads.com'
  },
  { 
    id: 'transport', 
    name: 'Transport', 
    icon: CarProfile, 
    description: 'Book transfers and local transport',
    provider: '12Go Asia',
    url: 'https://12go.asia'
  },
]

export default function RequirementsChecklist({ extractedData, travelType, onProceed }: RequirementsChecklistProps) {
  const [requirements, setRequirements] = useState<TripRequirement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRecommendations, setShowRecommendations] = useState(true)

  useEffect(() => {
    const loadRequirements = async () => {
      setIsLoading(true)
      
      console.log(`🔍 Searching requirements for ${travelType} travel...`)
      console.log(`📍 Route: ${extractedData.origin} → ${extractedData.destination}`)
      console.log(`🛂 Nationality: ${extractedData.nationality}`)
      
      const travelTypeStr = travelType
      const nationalityStr = extractedData.nationality
      const originStr = extractedData.origin
      const destinationStr = extractedData.destination
      const departureDateStr = extractedData.departureDate
      const returnDateStr = extractedData.returnDate || 'One-way'
      
      const promptText = `You are an expert travel document consultant. Analyze the travel requirements for this trip.

TRIP DETAILS:
Travel Type: ${travelTypeStr}
Nationality: ${nationalityStr}
From: ${originStr}
To: ${destinationStr}
Departure: ${departureDateStr}
Return: ${returnDateStr}

TASK: Generate a comprehensive list of ALL required travel documents for this specific route.

IMPORTANT RULES:
1. Search for REAL, CURRENT requirements (as of 2025)
2. Include BOTH departure country requirements AND destination country requirements
3. Specify if each document is online submission or physical document, required or optional
4. Include official government website URLs (real ones only)
5. For the specified travel type travelers specifically
6. Include visa information if applicable

Return as JSON with this EXACT structure:
{
  "requirements": [
    {
      "category": "exit" | "entry" | "physical" | "optional",
      "name": "Document name",
      "description": "Clear description with submission timing/requirements",
      "deliveryType": "online" | "physical",
      "country": "Country name",
      "officialUrl": "https://real-official-site.gov",
      "verifiedSource": "Source description",
      "tips": "Pro tips for submission"
    }
  ]
}`

      try {
        const response = await window.spark.llm(promptText, 'gpt-4o', true)
        const data = JSON.parse(response)
        
        console.log(`✅ Found ${data.requirements.length} requirements`)
        
        const mappedReqs: TripRequirement[] = data.requirements.map((req: any, idx: number) => ({
          id: `req-${idx}`,
          category: req.category,
          name: req.name,
          description: req.description,
          userHas: false,
          deliveryType: req.deliveryType,
          country: req.country,
          officialUrl: req.officialUrl,
          verifiedSource: req.verifiedSource,
          tips: req.tips
        }))
        
        setRequirements(mappedReqs)
      } catch (error) {
        console.error('❌ Error loading requirements:', error)
        setRequirements(getFallbackRequirements(extractedData, travelType))
      }
      
      setIsLoading(false)
    }
    
    loadRequirements()
  }, [extractedData, travelType])

  const toggleRequirement = (id: string) => {
    setRequirements(prev =>
      prev.map(req =>
        req.id === id ? { ...req, userHas: !req.userHas } : req
      )
    )
  }

  const handleProceed = () => {
    onProceed(requirements)
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Searching Requirements...</h2>
          <p className="text-muted-foreground">
            AI is analyzing {travelType} travel requirements for {extractedData.destination}
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">While You Wait - Check These Out! 🎁</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                {showRecommendations ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showRecommendations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid md:grid-cols-2 gap-3"
                >
                  {AFFILIATE_RECOMMENDATIONS.map((rec, idx) => {
                    const Icon = rec.icon
                    return (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <a href={rec.url} target="_blank" rel="noopener noreferrer">
                          <Card className="p-3 hover:border-accent transition-all cursor-pointer group h-full">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                                <Icon size={20} className="text-accent" weight="duotone" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">{rec.name}</p>
                                  <ArrowSquareOut size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                                <p className="text-xs text-accent mt-1">{rec.provider}</p>
                              </div>
                            </div>
                          </Card>
                        </a>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Analyzing immigration requirements...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const onlineDocs = requirements.filter(r => r.deliveryType === 'online' && r.category !== 'optional')
  const physicalDocs = requirements.filter(r => (r.deliveryType === 'physical' || !r.deliveryType) && r.category !== 'optional')
  const optionalDocs = requirements.filter(r => r.category === 'optional')

  const exitDocs = onlineDocs.filter(r => r.category === 'exit')
  const entryDocs = onlineDocs.filter(r => r.category === 'entry')

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Requirements for {travelType === 'tourist' ? 'Tourist' : 'Business'} Travel</h2>
        <p className="text-lg text-muted-foreground">
          {extractedData.origin} → {extractedData.destination}
        </p>
        <p className="text-sm text-muted-foreground">
          Check the boxes for documents you already have
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-3xl font-bold text-primary">{onlineDocs.length}</div>
          <div className="text-sm text-muted-foreground">Online Documents</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-accent/5 to-accent/10">
          <div className="text-3xl font-bold text-accent">{physicalDocs.length}</div>
          <div className="text-sm text-muted-foreground">Physical Documents</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-success/5 to-success/10">
          <div className="text-3xl font-bold text-success">{optionalDocs.length}</div>
          <div className="text-sm text-muted-foreground">Optional Items</div>
        </Card>
      </div>

      {exitDocs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            🛫 {extractedData.origin} Immigration (Exit Documents)
          </h3>
          <div className="space-y-3">
            {exitDocs.map(req => (
              <RequirementItem key={req.id} requirement={req} onToggle={toggleRequirement} />
            ))}
          </div>
        </Card>
      )}

      {entryDocs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            🛬 {extractedData.destination} Immigration (Entry Documents)
          </h3>
          <div className="space-y-3">
            {entryDocs.map(req => (
              <RequirementItem key={req.id} requirement={req} onToggle={toggleRequirement} />
            ))}
          </div>
        </Card>
      )}

      {physicalDocs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            📋 Must Carry Physically
          </h3>
          <div className="space-y-3">
            {physicalDocs.map(req => (
              <RequirementItem key={req.id} requirement={req} onToggle={toggleRequirement} />
            ))}
          </div>
        </Card>
      )}

      {optionalDocs.length > 0 && (
        <Card className="p-6 border-dashed">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            ⭐ Optional (Recommended)
          </h3>
          <div className="space-y-3">
            {optionalDocs.map(req => (
              <RequirementItem key={req.id} requirement={req} onToggle={toggleRequirement} />
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          size="lg"
          onClick={handleProceed}
          className="min-w-40"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}

function RequirementItem({ requirement, onToggle }: { requirement: TripRequirement; onToggle: (id: string) => void }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
      <Checkbox
        id={requirement.id}
        checked={requirement.userHas}
        onCheckedChange={() => onToggle(requirement.id)}
        className="mt-1"
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <label htmlFor={requirement.id} className="font-medium cursor-pointer flex items-center gap-2">
            {requirement.name}
            <Badge variant="outline" className="text-xs">
              {requirement.category === 'exit' ? 'Exit' : requirement.category === 'entry' ? 'Entry' : requirement.category === 'physical' ? 'Physical' : 'Optional'}
            </Badge>
            {requirement.deliveryType && (
              <Badge variant="secondary" className="text-xs">
                {requirement.deliveryType === 'online' ? '🌐 Online' : '📄 Physical'}
              </Badge>
            )}
          </label>
        </div>
        <p className="text-sm text-muted-foreground">{requirement.description}</p>
        {requirement.officialUrl && (
          <div className="flex items-center gap-2">
            <a 
              href={requirement.officialUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ShieldCheck size={14} weight="fill" />
              {requirement.officialUrl}
              <ArrowSquareOut size={12} />
            </a>
            {requirement.verifiedSource && (
              <span className="text-xs text-muted-foreground">({requirement.verifiedSource})</span>
            )}
          </div>
        )}
        {requirement.tips && (
          <p className="text-xs text-accent bg-accent/5 p-2 rounded">
            💡 {requirement.tips}
          </p>
        )}
      </div>
    </div>
  )
}

function getFallbackRequirements(data: ExtractedData, type: 'tourist' | 'business'): TripRequirement[] {
  return [
    {
      id: 'req-1',
      category: 'physical',
      name: 'Valid Passport',
      description: 'Passport must be valid for at least 6 months from date of entry',
      userHas: false,
      deliveryType: 'physical'
    },
    {
      id: 'req-2',
      category: 'physical',
      name: 'Return/Onward Ticket',
      description: 'Proof of return or onward travel',
      userHas: false,
      deliveryType: 'physical'
    }
  ]
}
