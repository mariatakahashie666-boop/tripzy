import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExtractedData, FlightLeg } from '@/types'
import { Warning, CheckCircle, PencilSimple, DeviceMobile, Plus, X, Airplane } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { simulateDocumentExtraction } from '@/lib/ai-service'
import { useIsMobile } from '@/hooks/use-mobile'
import ConfidenceAlert from '@/components/ConfidenceAlert'

interface DataVerificationProps {
  files: File[]
  onVerified: (data: ExtractedData) => void
}

export default function DataVerification({ files, onVerified }: DataVerificationProps) {
  const isMobile = useIsMobile()
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editedData, setEditedData] = useState<Partial<ExtractedData>>({})
  const [flightLegs, setFlightLegs] = useState<FlightLeg[]>([])
  const [showMultiLeg, setShowMultiLeg] = useState(false)

  useEffect(() => {
    const extractData = async () => {
      setIsLoading(true)
      
      const firstFile = files[0] as any
      if (firstFile?.manualData) {
        setExtractedData(firstFile.manualData)
        if (firstFile.manualData.flightLegs && firstFile.manualData.flightLegs.length > 0) {
          setFlightLegs(firstFile.manualData.flightLegs)
          setShowMultiLeg(true)
        }
        setIsLoading(false)
        return
      }
      
      const data = await simulateDocumentExtraction(files)
      setExtractedData(data)
      if (data.flightLegs && data.flightLegs.length > 0) {
        setFlightLegs(data.flightLegs)
        setShowMultiLeg(true)
      }
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

  const addFlightLeg = () => {
    const newLeg: FlightLeg = {
      from: '',
      to: '',
      date: '',
      flightNumber: '',
      isTransit: true,
      transitDuration: ''
    }
    setFlightLegs([...flightLegs, newLeg])
  }

  const removeFlightLeg = (index: number) => {
    setFlightLegs(flightLegs.filter((_, i) => i !== index))
  }

  const updateFlightLeg = (index: number, field: keyof FlightLeg, value: string | boolean) => {
    const updated = [...flightLegs]
    updated[index] = { ...updated[index], [field]: value }
    setFlightLegs(updated)
  }

  const handleProceed = () => {
    if (extractedData) {
      const transitCountries = flightLegs
        .filter(leg => leg.isTransit && leg.from)
        .map(leg => leg.from)
      
      const finalData = { 
        ...extractedData, 
        ...editedData,
        flightLegs: showMultiLeg && flightLegs.length > 0 ? flightLegs : undefined,
        isMultiLeg: showMultiLeg && flightLegs.length > 0,
        transitCountries: transitCountries.length > 0 ? transitCountries : undefined
      }
      onVerified(finalData)
    }
  }

  if (isLoading || !extractedData) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-xl font-semibold">Scanning Your Documents...</h3>
          <p className="text-muted-foreground">
            GPT-4 Vision is analyzing your passport and flight ticket to extract your real information
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📸 Reading passport MRZ and text fields...</p>
            <p>🎫 Extracting flight details and dates...</p>
            <p>⏱️ This usually takes 15-30 seconds</p>
          </div>
          <div className="text-xs text-accent/70 mt-4">
            Check your browser console (F12) for detailed progress logs
          </div>
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
          <p className="font-medium">Please check {isMobile ? 'carefully' : 'very carefully'} as this will be used for your documents 😇</p>
        </div>
        {isMobile && (
          <p className="text-xs text-accent flex items-center justify-center gap-1">
            <DeviceMobile size={16} weight="duotone" />
            Mobile layout optimized for easy editing
          </p>
        )}
      </div>

      {noDataExtracted && <ConfidenceAlert type="no-data" />}

      {!noDataExtracted && veryLowConfidence && (
        <ConfidenceAlert type="very-low" confidence={extractedData.confidence} />
      )}

      {!noDataExtracted && !veryLowConfidence && lowConfidence && (
        <ConfidenceAlert type="low" confidence={extractedData.confidence} />
      )}

      {!noDataExtracted && !lowConfidence && (
        <ConfidenceAlert type="good" confidence={extractedData.confidence} />
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

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Airplane size={18} className="text-accent" />
                    Multi-Leg Flight with Transit Countries?
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add connecting flights that pass through other countries (layovers/transits)
                  </p>
                </div>
                <Button
                  type="button"
                  variant={showMultiLeg ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowMultiLeg(!showMultiLeg)
                    if (!showMultiLeg && flightLegs.length === 0) {
                      addFlightLeg()
                    }
                  }}
                >
                  {showMultiLeg ? "Hide" : "Add Transit"}
                </Button>
              </div>

              {showMultiLeg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <Card className="p-4 bg-accent/5 border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Important:</strong> Only add flights where you'll pass through another country's airport. 
                      We'll check transit visa requirements for each country. Short layovers may not require transit visas.
                    </p>
                  </Card>

                  {flightLegs.map((leg, index) => (
                    <Card key={index} className="p-4 space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm flex items-center gap-2">
                          <Airplane size={16} weight="fill" className="text-primary" />
                          Flight Leg {index + 1}
                        </h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFlightLeg(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X size={16} />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`leg-from-${index}`} className="text-xs">From (Transit Country)</Label>
                          <Input
                            id={`leg-from-${index}`}
                            placeholder="e.g., Singapore"
                            value={leg.from}
                            onChange={(e) => updateFlightLeg(index, 'from', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`leg-to-${index}`} className="text-xs">To</Label>
                          <Input
                            id={`leg-to-${index}`}
                            placeholder="e.g., Bangkok"
                            value={leg.to}
                            onChange={(e) => updateFlightLeg(index, 'to', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`leg-date-${index}`} className="text-xs">Date</Label>
                          <Input
                            id={`leg-date-${index}`}
                            type="date"
                            value={leg.date}
                            onChange={(e) => updateFlightLeg(index, 'date', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`leg-flight-${index}`} className="text-xs">Flight Number</Label>
                          <Input
                            id={`leg-flight-${index}`}
                            placeholder="e.g., SQ123"
                            value={leg.flightNumber}
                            onChange={(e) => updateFlightLeg(index, 'flightNumber', e.target.value)}
                            className="font-mono"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`leg-duration-${index}`} className="text-xs">
                            Layover Duration (optional)
                          </Label>
                          <Input
                            id={`leg-duration-${index}`}
                            placeholder="e.g., 3 hours, 1 day"
                            value={leg.transitDuration || ''}
                            onChange={(e) => updateFlightLeg(index, 'transitDuration', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            This helps determine if you need a transit visa (short layovers may not require one)
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFlightLeg}
                    className="w-full"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Another Flight Leg
                  </Button>
                </motion.div>
              )}
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
