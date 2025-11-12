import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ExtractedData, TripRequirement } from '@/types'
import { ListChecks, Airplane, Shield, Star, ArrowSquareOut, ShieldCheck } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { analyzeRequirements } from '@/lib/ai-service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AFFILIATE_PARTNERS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import PartnerLogo from '@/components/PartnerLogo'

interface RequirementsChecklistProps {
  extractedData: ExtractedData
  onProceed: (requirements: TripRequirement[]) => void
}

export default function RequirementsChecklist({ extractedData, onProceed }: RequirementsChecklistProps) {
  const [requirements, setRequirements] = useState<TripRequirement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false)
  const [tripType, setTripType] = useState<'tourist' | 'business'>('tourist')

  useEffect(() => {
    const loadRequirements = async () => {
      setIsLoading(true)
      const reqs = await analyzeRequirements(
        extractedData.origin,
        extractedData.destination,
        extractedData.nationality
      )
      setRequirements(reqs)
      setIsLoading(false)
      
      setTimeout(() => {
        setShowAffiliateDialog(true)
      }, 1000)
    }
    loadRequirements()
  }, [extractedData])

  const toggleRequirement = (id: string) => {
    setRequirements(prev =>
      prev.map(req =>
        req.id === id ? { ...req, userHas: !req.userHas } : req
      )
    )
  }

  const getCategoryIcon = (category: TripRequirement['category']) => {
    switch (category) {
      case 'exit': return '🛫'
      case 'entry': return '🛬'
      case 'physical': return '📋'
      case 'optional': return '⭐'
    }
  }

  const getCategoryTitle = (category: TripRequirement['category']) => {
    switch (category) {
      case 'exit': return 'Exit Documents (Departure Country)'
      case 'entry': return 'Entry Documents (Destination Country)'
      case 'physical': return 'Must Carry Physically'
      case 'optional': return 'Optional (Recommended)'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-xl font-semibold">Analyzing Requirements...</h3>
          <p className="text-muted-foreground">
            Checking what documents you need for {extractedData.destination}
          </p>
        </Card>
      </div>
    )
  }

  const exitDocs = requirements.filter(r => r.category === 'exit')
  const entryDocs = requirements.filter(r => r.category === 'entry')
  const physicalReqs = requirements.filter(r => r.category === 'physical')
  const optionalReqs = requirements.filter(r => r.category === 'optional')

  const onlineDocs = [...exitDocs, ...entryDocs].filter(r => r.deliveryType === 'online')
  const physicalDocs = physicalReqs.filter(r => r.deliveryType === 'physical' || !r.deliveryType)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Trip Requirements</h2>
        <p className="text-muted-foreground">
          {extractedData.origin} → {extractedData.destination}
        </p>
        
        <div className="flex justify-center gap-3">
          <Button
            variant={tripType === 'tourist' ? 'default' : 'outline'}
            onClick={() => setTripType('tourist')}
            size="sm"
          >
            🏖️ Tourist
          </Button>
          <Button
            variant={tripType === 'business' ? 'default' : 'outline'}
            onClick={() => setTripType('business')}
            size="sm"
          >
            💼 Business
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <span className="text-2xl">📱</span>
            <div>
              Online Documents
              <p className="text-xs font-normal text-muted-foreground">Can be submitted online</p>
            </div>
          </h3>
          
          {exitDocs.filter(r => r.deliveryType === 'online').length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {extractedData.origin} Immigration
              </p>
              {exitDocs.filter(r => r.deliveryType === 'online').map((req, index) => (
                <RequirementCard key={req.id} req={req} index={index} onToggle={toggleRequirement} />
              ))}
            </div>
          )}

          {entryDocs.filter(r => r.deliveryType === 'online').length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {extractedData.destination} Immigration
              </p>
              {entryDocs.filter(r => r.deliveryType === 'online').map((req, index) => (
                <RequirementCard key={req.id} req={req} index={index + exitDocs.length} onToggle={toggleRequirement} />
              ))}
            </div>
          )}

          {onlineDocs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No online documents required
            </p>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <span className="text-2xl">🎒</span>
            <div>
              Physical Documents
              <p className="text-xs font-normal text-muted-foreground">Must carry with you</p>
            </div>
          </h3>
          
          <div className="space-y-2">
            {physicalDocs.map((req, index) => (
              <RequirementCard key={req.id} req={req} index={index} onToggle={toggleRequirement} />
            ))}
          </div>

          {physicalDocs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No additional physical documents required
            </p>
          )}
        </Card>
      </div>

      {optionalReqs.length > 0 && (
        <Card className="p-6 space-y-4 border-dashed">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              Optional (Recommended)
              <p className="text-xs font-normal text-muted-foreground">
                Not required but helpful for tourists
              </p>
            </div>
          </h3>
          
          <div className="space-y-3">
            {optionalReqs.filter(r => r.highlight).map((req, index) => (
              <RequirementCard key={req.id} req={req} index={index} onToggle={toggleRequirement} optional highlight />
            ))}
            
            <div className="grid md:grid-cols-2 gap-3">
              {optionalReqs.filter(r => !r.highlight).map((req, index) => (
                <RequirementCard key={req.id} req={req} index={index} onToggle={toggleRequirement} optional />
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="text-accent" />
          Which of these do you already have?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Check the boxes above for documents you already possess. We'll help you prepare the rest.
        </p>
        <div className="flex justify-between items-center gap-4">
          <div className="text-sm">
            <span className="font-semibold">
              {requirements.filter(r => r.userHas).length}
            </span>
            <span className="text-muted-foreground"> / {requirements.length} checked</span>
          </div>
          <Button
            size="lg"
            onClick={() => onProceed(requirements)}
            className="min-w-40"
          >
            Continue
          </Button>
        </div>
      </Card>

      <Dialog open={showAffiliateDialog} onOpenChange={setShowAffiliateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Helpful Services for Your Trip</DialogTitle>
            <DialogDescription className="text-xs">
              Get what you need from our trusted partners
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">📱 eSIM & Data</p>
              <div className="grid grid-cols-2 gap-1.5">
                {AFFILIATE_PARTNERS.filter(p => p.category === 'sim').map(partner => (
                  <Button
                    key={partner.id}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs justify-start px-2"
                    onClick={() => window.open(partner.url, '_blank')}
                  >
                    <span className="mr-1.5 flex-shrink-0">
                      <PartnerLogo logo={partner.logo} className="w-4 h-4" />
                    </span>
                    <span className="truncate">{partner.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">🏨 Hotels</p>
              <div className="grid grid-cols-2 gap-1.5">
                {AFFILIATE_PARTNERS.filter(p => p.category === 'hotel').map(partner => (
                  <Button
                    key={partner.id}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs justify-start px-2"
                    onClick={() => window.open(partner.url, '_blank')}
                  >
                    <span className="mr-1.5 flex-shrink-0">
                      <PartnerLogo logo={partner.logo} className="w-4 h-4" />
                    </span>
                    <span className="truncate">{partner.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">🎫 Tours & Activities</p>
              <div className="grid grid-cols-2 gap-1.5">
                {AFFILIATE_PARTNERS.filter(p => p.category === 'tours').map(partner => (
                  <Button
                    key={partner.id}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs justify-start px-2"
                    onClick={() => window.open(partner.url, '_blank')}
                  >
                    <span className="mr-1.5 flex-shrink-0">
                      <PartnerLogo logo={partner.logo} className="w-4 h-4" />
                    </span>
                    <span className="truncate">{partner.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">🛡️ Insurance & Transport</p>
              <div className="grid grid-cols-2 gap-1.5">
                {AFFILIATE_PARTNERS.filter(p => p.category === 'insurance' || p.category === 'transport').map(partner => (
                  <Button
                    key={partner.id}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs justify-start px-2"
                    onClick={() => window.open(partner.url, '_blank')}
                  >
                    <span className="mr-1.5 flex-shrink-0">
                      <PartnerLogo logo={partner.logo} className="w-4 h-4" />
                    </span>
                    <span className="truncate">{partner.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAffiliateDialog(false)} 
              className="w-full h-8 text-xs"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface RequirementCardProps {
  req: TripRequirement
  index: number
  onToggle: (id: string) => void
  optional?: boolean
  highlight?: boolean
}

function RequirementCard({ req, index, onToggle, optional, highlight }: RequirementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={`p-3 ${
        optional ? 'border-dashed' : ''
      } ${
        highlight 
          ? 'border-accent border-2 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent shadow-lg hover:shadow-xl relative overflow-hidden' 
          : ''
      }`}>
        {highlight && (
          <>
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-md">
              POPULAR
            </div>
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
          </>
        )}
        <div className="flex items-start gap-3 relative z-10">
          <Checkbox
            id={req.id}
            checked={req.userHas}
            onCheckedChange={() => onToggle(req.id)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <label htmlFor={req.id} className={`font-medium cursor-pointer ${
                highlight ? 'text-base' : 'text-sm'
              }`}>
                {req.name}
              </label>
              <div className="flex items-center gap-1.5 shrink-0">
                {req.price && (
                  <Badge variant="secondary" className="text-xs font-bold bg-accent/20 text-accent-foreground">
                    +${req.price}
                  </Badge>
                )}
                {req.deliveryType && !highlight && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {req.deliveryType}
                  </Badge>
                )}
              </div>
            </div>
            <p className={`text-muted-foreground mt-1 ${
              highlight ? 'text-sm font-medium' : 'text-xs'
            }`}>
              {req.description}
            </p>
            {req.tips && (
              <p className={`text-accent mt-1.5 italic ${
                highlight ? 'text-sm' : 'text-xs'
              }`}>
                💡 {req.tips}
              </p>
            )}
            {req.officialUrl && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                <ShieldCheck size={12} className="text-success" />
                {req.verifiedSource ? `Verified by ${req.verifiedSource}` : 'Verified official source'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
