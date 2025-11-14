import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import PartnerLogo from '@/components/PartnerLogo'
import { AFFILIATE_PARTNERS } from '@/lib/constants'

interface OfferCardProps {
  type: 'transport' | 'attraction' | 'activity'
  title: string
  provider: string
  discount: string
  originalPrice: number
  discountedPrice: number
  savings: number
  url: string
  delay?: number
}

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'transport': return '🚌'
    case 'attraction': return '🎭'
    case 'activity': return '🎪'
    default: return '✨'
  }
}

export default function OfferCard({ 
  type, 
  title, 
  provider, 
  discount, 
  originalPrice, 
  discountedPrice, 
  savings, 
  url,
  delay = 0
}: OfferCardProps) {
  const partnerLogo = AFFILIATE_PARTNERS.find(p => p.name === provider)?.logo || 'getyourguide'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-4 h-full flex flex-col hover:shadow-lg transition-shadow bg-card">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {getTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
          <Badge className="bg-success text-success-foreground text-xs font-bold">
            {discount}
          </Badge>
        </div>
        
        <h4 className="font-semibold text-sm mb-2 flex-1">{title}</h4>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PartnerLogo logo={partnerLogo} className="w-3 h-3" />
            {provider}
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-success">
              ${discountedPrice}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice}
            </span>
          </div>
          
          <p className="text-xs text-success font-medium">
            Save ${savings.toFixed(2)}
          </p>
        </div>
        
        <Button 
          size="sm" 
          className="w-full"
          onClick={() => window.open(url, '_blank')}
        >
          Book Now
          <ArrowSquareOut className="ml-1" size={14} />
        </Button>
      </Card>
    </motion.div>
  )
}
