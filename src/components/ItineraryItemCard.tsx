import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ItineraryItemCardProps {
  index: number
  title: string
  subtitle?: string
  description: string
  badge?: string
  extraInfo?: string
  extraInfoEmoji?: string
}

export default function ItineraryItemCard({ 
  index, 
  title, 
  subtitle, 
  description, 
  badge, 
  extraInfo,
  extraInfoEmoji = '💡'
}: ItineraryItemCardProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Badge className="shrink-0 h-6">{index + 1}</Badge>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold">{title}</h4>
            {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          <p className="text-sm mt-2">{description}</p>
          {extraInfo && (
            <p className="text-sm text-accent font-medium mt-2">
              {extraInfoEmoji} {extraInfo}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
