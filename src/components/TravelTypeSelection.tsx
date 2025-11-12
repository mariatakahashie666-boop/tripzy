import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Suitcase, Briefcase } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface TravelTypeSelectionProps {
  onSelect: (type: 'tourist' | 'business') => void
}

export default function TravelTypeSelection({ onSelect }: TravelTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-12"
        >
          <h2 className="text-4xl font-bold">What's Your Travel Purpose?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This helps us identify the right documents and requirements for your trip
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card 
            className="p-8 hover:border-accent transition-all hover:shadow-lg cursor-pointer group"
            onClick={() => onSelect('tourist')}
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Suitcase className="text-accent" size={40} weight="duotone" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Tourist / Vacation</h3>
                <p className="text-muted-foreground">
                  Traveling for leisure, sightseeing, visiting friends/family, or vacation
                </p>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect('tourist')
                }}
              >
                Select Tourist
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:border-primary transition-all hover:shadow-lg cursor-pointer group"
            onClick={() => onSelect('business')}
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Briefcase className="text-primary" size={40} weight="duotone" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Business / Work</h3>
                <p className="text-muted-foreground">
                  Traveling for meetings, conferences, business deals, or work-related purposes
                </p>
              </div>
              <Button 
                size="lg" 
                variant="default"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect('business')
                }}
              >
                Select Business
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>💡 Different travel purposes may require different documents and visa types</p>
        </motion.div>
      </div>
    </div>
  )
}
