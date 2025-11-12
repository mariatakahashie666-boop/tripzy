import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Airplane, Shield, Clock, CheckCircle, LockKey } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

interface HeroProps {
  onStart: () => void
  onGuestMode: () => void
}

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function Hero({ onStart, onGuestMode }: HeroProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true)
    try {
      const user = await window.spark.user()
      
      if (user && user.login) {
        toast.success(`Welcome, ${user.login}!`)
        onStart()
      } else {
        toast.error('Unable to authenticate. Please try again.')
      }
    } catch (error) {
      toast.error('Authentication failed. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleGuestMode = () => {
    onGuestMode()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4 py-8 md:py-4">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-2 md:mb-4">
            <Airplane className="text-accent" size={40} weight="duotone" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tripzy</h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Scan your passport and flight ticket. We'll handle all your travel documents.
          </p>
          
          <p className="text-base md:text-lg text-foreground/70 max-w-xl mx-auto">
            Stop wasting hours filling forms and risking scam websites. Get verified, pre-filled documents in 10 minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 md:p-8 space-y-4 md:space-y-6 shadow-lg">
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Clock className="text-accent" size={24} weight="duotone" />
                </div>
                <h3 className="font-semibold">Save 3+ Hours</h3>
                <p className="text-sm text-muted-foreground">
                  10 minutes instead of hours researching requirements
                </p>
              </div>

              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Shield className="text-success" size={24} weight="duotone" />
                </div>
                <h3 className="font-semibold">Scam Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Only verified official government links
                </p>
              </div>

              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="text-primary" size={24} weight="duotone" />
                </div>
                <h3 className="font-semibold">You're In Control</h3>
                <p className="text-sm text-muted-foreground">
                  Review and submit forms yourself
                </p>
              </div>
            </div>

            <div className="pt-6 border-t space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={handleGuestMode}
                  size="lg"
                  variant="outline"
                  className="w-full md:flex-1 text-base md:text-lg h-12 md:h-14"
                >
                  <LockKey className="mr-2" size={20} />
                  Guest Mode (No data saved)
                </Button>
                
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  size="lg"
                  className="w-full md:flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-base md:text-lg h-12 md:h-14"
                >
                  <GoogleLogo />
                  <span className="ml-2">
                    {isAuthenticating ? 'Signing in...' : 'Sign in using Google'}
                  </span>
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                From $5 per trip • No account required • 195+ countries
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
