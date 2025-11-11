import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExtractedData } from '@/types'
import { Warning, CheckCircle, PencilSimple } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { simulateDocumentExtraction } from '@/lib/ai-service'

interface DataVerificationProps {
  files: File[]
  onVerified: (data: ExtractedData) => void
}

export default function DataVerification({ files, onVerified }: DataVerificationProps) {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editedData, setEditedData] = useState<Partial<ExtractedData>>({})

  useEffect(() => {
    const extractData = async () => {
      setIsLoading(true)
      const data = await simulateDocumentExtraction(files)
      setExtractedData(data)
      setIsLoading(false)
    }
    extractData()
  }, [files])

  const handleChange = (field: keyof ExtractedData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const getFinalValue = (field: keyof ExtractedData): string => {
    return (editedData[field] as string) ?? (extractedData?.[field] as string) ?? ''
  }

  const handleProceed = () => {
    if (extractedData) {
      onVerified({ ...extractedData, ...editedData })
    }
  }

  if (isLoading || !extractedData) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-xl font-semibold">Scanning Your Documents...</h3>
          <p className="text-muted-foreground">
            Our AI is analyzing your passport and flight ticket using GPT-4 vision to extract your real information
          </p>
          <p className="text-sm text-muted-foreground">
            This may take 10-30 seconds depending on image quality
          </p>
        </Card>
      </div>
    )
  }

  const lowConfidence = extractedData.confidence < 85
  const veryLowConfidence = extractedData.confidence < 50
  const noDataExtracted = extractedData.confidence === 0 || 
    (!extractedData.firstName && !extractedData.lastName && !extractedData.passportNumber)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Verify Your Information</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Warning size={20} className="text-accent" />
          <p className="font-medium">Please check very carefully as this will be used for your documents 😇</p>
        </div>
      </div>

      {noDataExtracted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-start gap-3">
              <Warning size={24} className="text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Unable to Read Documents</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our AI couldn't extract information from your documents. Please ensure:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Images are clear and well-lit</li>
                  <li>Text is not blurry or obscured</li>
                  <li>The entire document is visible in the photo</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  You can manually enter your information below.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {!noDataExtracted && veryLowConfidence && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-start gap-3">
              <Warning size={24} className="text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Very Low Confidence Scan</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Confidence: {extractedData.confidence}% - We had difficulty reading your documents. Please verify all fields very carefully and correct any errors.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {!noDataExtracted && !veryLowConfidence && lowConfidence && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-accent/10 border-accent">
            <div className="flex items-start gap-3">
              <Warning size={24} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Lower Confidence Scan</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Confidence: {extractedData.confidence}% - Please review all fields carefully
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  First Name
                  <PencilSimple size={14} className="text-muted-foreground" />
                </Label>
                <Input
                  id="firstName"
                  value={getFinalValue('firstName')}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={getFinalValue('lastName')}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={getFinalValue('passportNumber')}
                  onChange={(e) => handleChange('passportNumber', e.target.value)}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={getFinalValue('dateOfBirth')}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={getFinalValue('nationality')}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportExpiry">Passport Expiry</Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  value={getFinalValue('passportExpiry')}
                  onChange={(e) => handleChange('passportExpiry', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              Travel Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <Input
                  id="origin"
                  value={getFinalValue('origin')}
                  onChange={(e) => handleChange('origin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <Input
                  id="destination"
                  value={getFinalValue('destination')}
                  onChange={(e) => handleChange('destination', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={getFinalValue('departureDate')}
                  onChange={(e) => handleChange('departureDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={getFinalValue('returnDate')}
                  onChange={(e) => handleChange('returnDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flightNumber">Flight Number</Label>
                <Input
                  id="flightNumber"
                  value={getFinalValue('flightNumber')}
                  onChange={(e) => handleChange('flightNumber', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          size="lg"
          onClick={handleProceed}
          className="min-w-40 bg-success hover:bg-success/90 text-success-foreground"
        >
          Yes, Proceed
        </Button>
      </div>
    </div>
  )
}
