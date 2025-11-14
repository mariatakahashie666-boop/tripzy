import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ExtractedData, TripRequirement } from '@/types'
import { Sparkle, ShieldCheck, Ticket, Compass, Info, ArrowSquareOut } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import OfferCard from '@/components/OfferCard'

interface NoOnlineDocumentsProps {
  extractedData: ExtractedData
  requirements: TripRequirement[]
  onProceed: (wantsOptionalService: boolean) => void
}

interface CountryLaw {
  category: string
  description: string
  officialUrl: string
  severity: 'info' | 'warning' | 'critical'
}

const MOCK_COUNTRY_LAWS: Record<string, CountryLaw[]> = {
  default: [
    {
      category: 'Drug Laws',
      description: 'Strict penalties for drug possession, including mandatory minimum sentences',
      officialUrl: 'https://travel.state.gov',
      severity: 'critical'
    },
    {
      category: 'Public Behavior',
      description: 'Public displays of affection may be restricted in certain areas',
      officialUrl: 'https://travel.state.gov',
      severity: 'warning'
    },
    {
      category: 'Photography',
      description: 'Photographing government buildings and military installations is prohibited',
      officialUrl: 'https://travel.state.gov',
      severity: 'info'
    }
  ]
}

interface AffiliateOffer {
  id: string
  type: 'transport' | 'attraction' | 'activity'
  title: string
  provider: string
  discount: string
  originalPrice: number
  discountedPrice: number
  savings: number
  url: string
}

const MOCK_OFFERS: AffiliateOffer[] = [
  {
    id: '1',
    type: 'transport',
    title: 'Airport Transfer to City Center',
    provider: 'GetYourGuide',
    discount: '15% OFF',
    originalPrice: 35,
    discountedPrice: 29.75,
    savings: 5.25,
    url: 'https://getyourguide.com'
  },
  {
    id: '2',
    type: 'transport',
    title: 'Unlimited Metro Pass (3 Days)',
    provider: 'Klook',
    discount: '20% OFF',
    originalPrice: 25,
    discountedPrice: 20,
    savings: 5,
    url: 'https://klook.com'
  },
  {
    id: '3',
    type: 'attraction',
    title: 'City Museum Skip-the-Line Ticket',
    provider: 'Viator',
    discount: '10% OFF',
    originalPrice: 40,
    discountedPrice: 36,
    savings: 4,
    url: 'https://viator.com'
  },
  {
    id: '4',
    type: 'attraction',
    title: 'Historic Walking Tour with Guide',
    provider: 'GetYourGuide',
    discount: '25% OFF',
    originalPrice: 60,
    discountedPrice: 45,
    savings: 15,
    url: 'https://getyourguide.com'
  },
  {
    id: '5',
    type: 'activity',
    title: 'Food Tasting Experience',
    provider: 'Klook',
    discount: '15% OFF',
    originalPrice: 55,
    discountedPrice: 46.75,
    savings: 8.25,
    url: 'https://klook.com'
  },
  {
    id: '6',
    type: 'activity',
    title: 'Sunset River Cruise',
    provider: 'Viator',
    discount: '20% OFF',
    originalPrice: 50,
    discountedPrice: 40,
    savings: 10,
    url: 'https://viator.com'
  }
]

export default function NoOnlineDocuments({ extractedData, requirements, onProceed }: NoOnlineDocumentsProps) {
  const [wantsOptionalService, setWantsOptionalService] = useState(false)
  const [wantsRecommendations, setWantsRecommendations] = useState(false)
  
  const optionalReqs = requirements.filter(r => r.category === 'optional')
  const hasOptionalDocs = optionalReqs.length > 0
  
  const countryLaws = MOCK_COUNTRY_LAWS.default
  
  const totalSavings = MOCK_OFFERS.reduce((sum, offer) => sum + offer.savings, 0)

  const getSeverityColor = (severity: CountryLaw['severity']) => {
    switch (severity) {
      case 'critical': return 'text-destructive'
      case 'warning': return 'text-amber-600'
      case 'info': return 'text-blue-600'
    }
  }

  const getSeverityBadge = (severity: CountryLaw['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'warning': return 'outline'
      case 'info': return 'secondary'
    }
  }

  const handleProceed = () => {
    const needsPayment = (hasOptionalDocs && wantsOptionalService) || wantsRecommendations
    onProceed(needsPayment)
  }

  const needsPayment = (hasOptionalDocs && wantsOptionalService) || wantsRecommendations

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-2">
          <Sparkle className="text-success" size={32} weight="fill" />
        </div>
        <h2 className="text-3xl font-bold">Great News!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          No online documents are required for your trip from <span className="font-semibold text-foreground">{extractedData.origin}</span> to <span className="font-semibold text-foreground">{extractedData.destination}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          We've found some great deals to help you save money on your trip!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-2">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <Ticket className="text-accent" size={32} weight="duotone" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Book Online & Save Big</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Save up to <span className="font-bold text-success">${totalSavings.toFixed(2)}</span> by booking these essentials online before your trip
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_OFFERS.map((offer, index) => (
              <OfferCard
                key={offer.id}
                type={offer.type}
                title={offer.title}
                provider={offer.provider}
                discount={offer.discount}
                originalPrice={offer.originalPrice}
                discountedPrice={offer.discountedPrice}
                savings={offer.savings}
                url={offer.url}
                delay={0.2 + index * 0.05}
              />
            ))}
          </div>
        </Card>
      </motion.div>

      {hasOptionalDocs && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-dashed">
            <div className="flex items-start gap-4 mb-4">
              <Sparkle className="text-primary flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Optional Services Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  While not required, we can help you prepare these optional documents for ${' '}
                  <span className="font-bold text-primary">2.00</span>
                </p>
                
                <div className="space-y-3 mb-4">
                  {optionalReqs.map((req) => (
                    <div key={req.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{req.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                        {req.tips && (
                          <p className="text-xs text-primary mt-1.5 italic">💡 {req.tips}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Checkbox
                    id="optional-service"
                    checked={wantsOptionalService}
                    onCheckedChange={(checked) => setWantsOptionalService(checked as boolean)}
                  />
                  <label htmlFor="optional-service" className="text-sm font-medium cursor-pointer flex-1">
                    Yes, help me prepare these optional documents ($2.00)
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 border-dashed">
          <div className="flex items-start gap-4 mb-4">
            <Compass className="text-primary flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Personalized Travel Recommendations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get curated recommendations for restaurants, hidden gems, and local experiences for just{' '}
                <span className="font-bold text-primary">$2.00</span>
              </p>
              
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <Checkbox
                  id="recommendations"
                  checked={wantsRecommendations}
                  onCheckedChange={(checked) => setWantsRecommendations(checked as boolean)}
                />
                <label htmlFor="recommendations" className="text-sm font-medium cursor-pointer flex-1">
                  Yes, I want personalized travel recommendations ($2.00)
                </label>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-primary flex-shrink-0" size={28} weight="duotone" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">Important Laws & Regulations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please familiarize yourself with these laws in {extractedData.destination}
              </p>
              
              <div className="space-y-3">
                {countryLaws.map((law, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm">{law.category}</h4>
                            <Badge variant={getSeverityBadge(law.severity)} className="text-xs">
                              {law.severity}
                            </Badge>
                          </div>
                          <p className={`text-sm mb-3 ${getSeverityColor(law.severity)}`}>
                            {law.description}
                          </p>
                          <a
                            href={law.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ShieldCheck size={12} className="text-success" />
                            Official Government Source
                            <ArrowSquareOut size={12} />
                          </a>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-2">
                  <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    These links direct you to official government websites. Always verify current regulations before your trip.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex flex-col items-center gap-4 pt-4">
        {needsPayment ? (
          <div className="text-center space-y-4 w-full">
            <Card className="p-4 bg-muted/30 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Total Amount</span>
                <span className="text-2xl font-bold">$2.00</span>
              </div>
            </Card>
            <Button
              size="lg"
              onClick={handleProceed}
              className="min-w-64"
            >
              Proceed to Payment
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={handleProceed}
            className="min-w-64 bg-success hover:bg-success/90 text-success-foreground"
          >
            Continue - No Payment Required
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground text-center max-w-md">
          {needsPayment 
            ? '🔒 Secure payment processing for selected services'
            : '✅ You\'re all set! Review the laws above and enjoy your trip'
          }
        </p>
      </div>
    </div>
  )
}
