import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TripRequirement, ExtractedData } from '@/types'
import { CheckCircle, CreditCard } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface PaymentProps {
  requirements: TripRequirement[]
  extractedData?: ExtractedData
  onPaymentComplete: (plan: 'standard' | 'premium') => void
  optionalServiceOnly?: boolean
}

const PAYMENT_METHODS = [
  { 
    id: 'card', 
    name: 'Card',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="10" width="40" height="28" rx="4" fill="#4A5568"/>
        <rect x="4" y="16" width="40" height="6" fill="#2D3748"/>
        <rect x="8" y="26" width="12" height="4" rx="1" fill="#CBD5E0"/>
        <rect x="22" y="26" width="8" height="4" rx="1" fill="#CBD5E0"/>
      </svg>
    )
  },
  { 
    id: 'paypal', 
    name: 'PayPal',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <path d="M18 12h8c5 0 8 3 8 7s-3 7-8 7h-3l-2 10h-4l3-17h-2l3-7z" fill="#003087"/>
        <path d="M16 19h8c5 0 8 3 8 7s-3 7-8 7h-3l-2 10h-4l3-17h-2l3-7z" fill="#009CDE"/>
      </svg>
    )
  },
  { 
    id: 'applepay', 
    name: 'Apple Pay',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <path d="M24 12c-1.5 0-2.8.5-3.8 1.4-.9.8-1.4 1.9-1.4 3.1 0 .2 0 .4.1.5 1.4-.1 2.7-.7 3.6-1.6.9-.9 1.4-2.1 1.4-3.4h.1zm4.5 5.5c-2.5 0-3.5 1.2-5.2 1.2-1.8 0-3.1-1.2-5.2-1.2-2.6 0-5.1 1.6-6.8 4.2-2.3 3.6-1.9 10.3 1.8 15.8 1.2 1.8 2.8 3.8 4.9 3.8 1.8 0 2.3-1.2 4.7-1.2 2.3 0 2.8 1.2 4.7 1.2 2.1 0 3.8-2.2 5.1-4 1-1.4 1.4-2.1 2.1-3.7-5.5-2.1-6.4-9.9-.9-12.8-1.5-2-3.8-3.3-6.2-3.3z" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'googlepay', 
    name: 'Google Pay',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <path d="M24 9.5v29" stroke="#5F6368" strokeWidth="3" strokeLinecap="round"/>
        <path d="M31 24c0 3.9-3.1 7-7 7s-7-3.1-7-7 3.1-7 7-7" stroke="#4285F4" strokeWidth="3" strokeLinecap="round"/>
        <path d="M31 17v14" stroke="#34A853" strokeWidth="3" strokeLinecap="round"/>
        <path d="M35 24c0 3.9-3.1 7-7 7" stroke="#FBBC04" strokeWidth="3" strokeLinecap="round"/>
        <path d="M28 17c3.9 0 7 3.1 7 7" stroke="#EA4335" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    id: 'crypto', 
    name: 'Crypto',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" fill="#F7931A"/>
        <path d="M27.5 18.5c.3-2-1.2-3-3.2-3.7l.7-2.6-1.6-.4-.6 2.5c-.4-.1-.9-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.6c-.3-.1-.7-.1-1-.2v0l-2.2-.5-.4 1.7s1.2.3 1.1.3c.7.2.8.6.8 1l-.8 3.2c0 .1.1.1.2.1h-.2l-1.1 4.4c-.1.2-.3.5-.8.4.0.0-1.1-.3-1.1-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.7 1.6.4.7-2.6c.4.1.9.2 1.4.3l-.7 2.6 1.6.4.7-2.7c2.9.5 5.1.3 6-2.3.7-2.1-.0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.6zm-3.8 5.3c-.5 2.1-4.1 1-5.2.7l.9-3.8c1.2.3 4.9.9 4.3 3.1zm.5-5.4c-.5 1.9-3.5.9-4.5.7l.8-3.4c1 .2 4.2.7 3.7 2.7z" fill="white"/>
      </svg>
    )
  },
  { 
    id: 'gcash', 
    name: 'GCash',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#007DFF"/>
        <path d="M18 28v-8h-2v10h8v-2h-6zm12-8c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.4 0 2.6-.7 3.3-1.7l-1.6-1.1c-.4.5-1 .8-1.7.8-1.1 0-2-.9-2-2s.9-2 2-2c.7 0 1.3.3 1.7.8l1.6-1.1c-.7-1-1.9-1.7-3.3-1.7z" fill="white"/>
      </svg>
    )
  },
  { 
    id: 'maya', 
    name: 'Maya',
    logo: (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#00D632"/>
        <path d="M15 28V18h2.5l2.5 6.5 2.5-6.5H25v10h-2v-7l-2.5 6h-1l-2.5-6v7H15zm18-5c0-1.7-1.3-3-3-3s-3 1.3-3 3 1.3 3 3 3 3-1.3 3-3zm2 0c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5z" fill="white"/>
      </svg>
    )
  },
]

export default function Payment({ requirements, extractedData, onPaymentComplete, optionalServiceOnly = false }: PaymentProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'oneway' | 'roundtrip'>('oneway')

  const handlePayment = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    onPaymentComplete(selectedPlan === 'roundtrip' ? 'premium' : 'standard')
  }

  const optionalItemsPrice = requirements
    .filter(req => req.category === 'optional' && req.userHas && req.price)
    .reduce((sum, req) => sum + (req.price || 0), 0)

  const basePlanPrice = optionalServiceOnly ? 0 : (selectedPlan === 'oneway' ? 5 : 8)
  const planPrice = basePlanPrice + optionalItemsPrice
  const isRoundTrip = selectedPlan === 'roundtrip'
  
  const oneWayFeatures = [
    'One-way documents',
    'Pre-filled forms',
    'Official government links',
    'Data deleted after use'
  ]
  
  const roundTripFeatures = [
    'Round-trip documents',
    'Pre-filled forms (both ways)',
    'Official government links',
    'Saved for return trip',
    'Auto-deleted after second flight'
  ]

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{optionalServiceOnly ? 'Payment for Optional Services' : 'Choose Your Plan'}</h2>
        <p className="text-muted-foreground">
          {optionalServiceOnly 
            ? 'Complete your payment for the selected optional services'
            : 'Select the assistance package that fits your travel needs'
          }
        </p>
      </div>

      {!optionalServiceOnly && (
        <div className="flex gap-3 justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedPlan('oneway')}
            className="w-40"
          >
            <Card className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === 'oneway' 
                ? 'border-primary border-2 shadow-md' 
                : 'border-border hover:border-primary/50'
            }`}>
              <div className="space-y-2 text-center">
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold">One-Way</h3>
                  <div className="text-2xl font-bold">$5</div>
                </div>
                
                <div className="pt-1 border-t">
                  <ul className="space-y-1 text-left">
                    {oneWayFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <CheckCircle 
                          size={14} 
                          className={`flex-shrink-0 mt-0.5 ${
                            selectedPlan === 'oneway' ? 'text-primary' : 'text-muted-foreground'
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedPlan('roundtrip')}
            className="w-40"
          >
            <Card className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === 'roundtrip' 
                ? 'border-primary border-2 shadow-md' 
                : 'border-border hover:border-primary/50'
            }`}>
              <div className="space-y-2 text-center">
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold">Round-Trip</h3>
                  <div className="text-2xl font-bold">$8</div>
                  <div className="text-[10px] text-success font-medium">Best Value</div>
                </div>
                
                <div className="pt-1 border-t">
                  <ul className="space-y-1 text-left">
                    {roundTripFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <CheckCircle 
                          size={14} 
                          className={`flex-shrink-0 mt-0.5 ${
                            selectedPlan === 'roundtrip' ? 'text-primary' : 'text-muted-foreground'
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
        </div>
      )}

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Payment Method</h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPaymentMethod(method.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedPaymentMethod === method.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center">
                {method.logo}
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">
                {method.name}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {selectedPaymentMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card className="p-5 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border rounded-md"
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    className="w-full p-3 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="p-4 bg-muted/30 space-y-2">
        {!optionalServiceOnly && basePlanPrice > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedPlan === 'oneway' ? 'One-Way' : 'Round-Trip'} Plan
            </span>
            <span className="font-semibold">${basePlanPrice}</span>
          </div>
        )}
        
        {optionalItemsPrice > 0 && (
          <>
            {requirements
              .filter(req => req.category === 'optional' && req.userHas && req.price)
              .map(req => (
                <div key={req.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="text-xs">✨</span>
                    {req.name.replace(/🤖\s*/, '')}
                  </span>
                  <span className="font-semibold text-accent">+${req.price}</span>
                </div>
              ))
            }
            {!optionalServiceOnly && basePlanPrice > 0 && (
              <div className="border-t pt-2" />
            )}
          </>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Total Amount</span>
          <span className="text-2xl font-bold">
            ${planPrice}
          </span>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full md:w-auto min-w-48 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Pay $${planPrice}`
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        🔒 Secure payment processing • Your data is encrypted
      </p>
    </div>
  )
}
