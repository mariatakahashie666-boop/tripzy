import { Button } from '@/components/ui/button'
import PartnerLogo from '@/components/PartnerLogo'
import { AFFILIATE_PARTNERS } from '@/lib/constants'

interface AffiliatePartnerSectionProps {
  title: string
  emoji: string
  categories: string[]
}

export default function AffiliatePartnerSection({ title, emoji, categories }: AffiliatePartnerSectionProps) {
  const partners = AFFILIATE_PARTNERS.filter(p => categories.includes(p.category))
  
  if (partners.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{emoji} {title}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {partners.map(partner => (
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
  )
}
