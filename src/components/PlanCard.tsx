import { Card } from '@/components/ui/card'
import { CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface PlanCardProps {
  title: string
  price: number
  features: string[]
  isSelected: boolean
  onClick: () => void
  badge?: string
  delay?: number
}

export default function PlanCard({ title, price, features, isSelected, onClick, badge, delay = 0 }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: delay > 0 ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="w-40"
    >
      <Card className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
        isSelected 
          ? 'border-primary border-2 shadow-md' 
          : 'border-border hover:border-primary/50'
      }`}>
        <div className="space-y-2 text-center">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold">{title}</h3>
            <div className="text-2xl font-bold">${price}</div>
            {badge && <div className="text-[10px] text-success font-medium">{badge}</div>}
          </div>
          
          <div className="pt-1 border-t">
            <ul className="space-y-1 text-left">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <CheckCircle 
                    size={14} 
                    className={`flex-shrink-0 mt-0.5 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    weight="fill" 
                  />
                  <span className="text-xs leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
