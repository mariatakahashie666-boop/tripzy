import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Airplane, Shield, Clock, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface HeroProps {
  onStart: () => void
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Airplane className="text-accent" size={48} weight="duotone" />
            <h1 className="text-5xl font-bold tracking-tight">Tripzy</h1>
          </div>
          
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Scan your passport and flight ticket. We'll handle all your travel documents.
          </p>
          
          <p className="text-lg text-foreground/70 max-w-xl mx-auto">
            Stop wasting hours filling forms and risking scam websites. Get verified, pre-filled documents in 10 minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8 space-y-6 shadow-lg">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Clock className="text-accent" size={24} weight="duotone" />
                </div>
                <h3 className="font-semibold">Save 3+ Hours</h3>
                <p className="text-sm text-muted-foreground">
                  10 minutes instead of hours researching requirements
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Shield className="text-success" size={24} weight="duotone" />
                </div>
                <h3 className="font-semibold">Scam Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Only verified official government links
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="text-primary" size={24} weight="duotone" />
                </div>
                <h3 className="font-semibold">You're In Control</h3>
                <p className="text-sm text-muted-foreground">
                  Review and submit forms yourself
                </p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button
                onClick={onStart}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-14"
              >
                Start Your Trip
                <Airplane className="ml-2" size={20} />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                From $8 per trip • No account required • 195+ countries
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>🔒 Your data is encrypted and deleted after use</p>
        </motion.div>
      </div>
    </div>
  )
}
