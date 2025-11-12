import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ExtractedData, TripRequirement } from '@/types'
import { ListChecks, Airplane, Shield, Star } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { analyzeRequirements } from '@/lib/ai-service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AFFILIATE_PARTNERS } from '@/lib/constants'

interface RequirementsChecklistProps {
  extractedData: ExtractedData
  onProceed: (requirements: TripRequirement[]) => void
}

export default function RequirementsChecklist({ extractedData, onProceed }: RequirementsChecklistProps) {
  const [requirements, setRequirements] = useState<TripRequirement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false)

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
      case 'physical': return 'Physical Requirements'
      case 'optional': return 'Optional (Recommended)'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Required Documents</h2>
        <p className="text-muted-foreground">
          Here's what you need for your trip. Check items you already have.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {exitDocs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getCategoryIcon('exit')} {getCategoryTitle('exit')}
            </h3>
            <div className="space-y-2">
              {exitDocs.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={req.id}
                        checked={req.userHas}
                        onCheckedChange={() => toggleRequirement(req.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={req.id} className="font-medium cursor-pointer">
                          {req.name}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {entryDocs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getCategoryIcon('entry')} {getCategoryTitle('entry')}
            </h3>
            <div className="space-y-2">
              {entryDocs.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (exitDocs.length + index) * 0.05 }}
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={req.id}
                        checked={req.userHas}
                        onCheckedChange={() => toggleRequirement(req.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={req.id} className="font-medium cursor-pointer">
                          {req.name}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {physicalReqs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getCategoryIcon('physical')} {getCategoryTitle('physical')}
            </h3>
            <div className="space-y-2">
              {physicalReqs.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (exitDocs.length + entryDocs.length + index) * 0.05 }}
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={req.id}
                        checked={req.userHas}
                        onCheckedChange={() => toggleRequirement(req.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={req.id} className="font-medium cursor-pointer">
                          {req.name}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {optionalReqs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getCategoryIcon('optional')} {getCategoryTitle('optional')}
            </h3>
            <div className="space-y-2">
              {optionalReqs.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (exitDocs.length + entryDocs.length + physicalReqs.length + index) * 0.05 }}
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={req.id}
                        checked={req.userHas}
                        onCheckedChange={() => toggleRequirement(req.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={req.id} className="font-medium cursor-pointer">
                          {req.name}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() => onProceed(requirements)}
          className="min-w-40"
        >
          Proceed to Payment
        </Button>
      </div>

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
                    <span className="mr-1 text-sm">{partner.logo}</span>
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
                    <span className="mr-1 text-sm">{partner.logo}</span>
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
                    <span className="mr-1 text-sm">{partner.logo}</span>
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
                    <span className="mr-1 text-sm">{partner.logo}</span>
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
