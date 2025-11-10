import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { TripRequirement } from '@/types'
import { CheckCircle, CreditCard } from '@phosphor-icons/react'
import { calculatePrice, PAYMENT_METHODS } from '@/lib/constants'
import { motion } from 'framer-motion'

interface PaymentProps {
  requirements: TripRequirement[]
  onPaymentComplete: (plan: 'standard' | 'premium') => void
}

export default function Payment({ requirements, onPaymentComplete }: PaymentProps) {
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const documentCount = requirements.filter(r => r.category === 'exit' || r.category === 'entry').length
  const standardPrice = calculatePrice(documentCount, false, 100, 0)

  const handlePayment = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    onPaymentComplete(selectedPlan)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the best option for your trip
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setSelectedPlan('standard')}
        >
          <Card className={`p-6 cursor-pointer transition-all ${
            selectedPlan === 'standard'
              ? 'ring-2 ring-primary shadow-lg'
              : 'hover:shadow-md'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Standard</h3>
                <RadioGroup value={selectedPlan}>
                  <RadioGroupItem value="standard" />
                </RadioGroup>
              </div>
              
              <div className="text-4xl font-bold">
                ${standardPrice}
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">One-way documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Pre-filled forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Official government links</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Data deleted after use</span>
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setSelectedPlan('premium')}
        >
          <Card className={`p-6 cursor-pointer transition-all relative ${
            selectedPlan === 'premium'
              ? 'ring-2 ring-accent shadow-lg'
              : 'hover:shadow-md'
          }`}>
            <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Premium</h3>
                <RadioGroup value={selectedPlan}>
                  <RadioGroupItem value="premium" />
                </RadioGroup>
              </div>
              
              <div className="text-4xl font-bold">
                $20
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Round-trip documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Pre-filled forms (both ways)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Official government links</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Saved for return trip</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Priority support</span>
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">Payment Method</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <Button
              key={method.id}
              variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
              className="justify-start"
              onClick={() => setSelectedPaymentMethod(method.id)}
            >
              <span className="mr-2">{method.icon}</span>
              {method.name}
            </Button>
          ))}
        </div>
      </Card>

      {selectedPaymentMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card className="p-6 space-y-4">
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

      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold">
            ${selectedPlan === 'standard' ? standardPrice : 20}
          </span>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handlePayment}
          disabled={isProcessing}
          className="min-w-40 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Pay $${selectedPlan === 'standard' ? standardPrice : 20}`
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        🔒 Secure payment processing • Your data is encrypted
      </p>
    </div>
  )
}
