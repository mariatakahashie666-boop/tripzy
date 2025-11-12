import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ExtractedData, TripRequirement, TravelDocument } from '@/types'
import { FilePdf, ArrowSquareOut, Warning, CheckCircle, ShieldCheck, Trash, MapTrifold, ForkKnife, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { generateDocuments, generateItinerary } from '@/lib/ai-service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useKV } from '@github/spark/hooks'

interface DocumentDeliveryProps {
  extractedData: ExtractedData
  requirements: TripRequirement[]
  hasPaid: boolean
}

export default function DocumentDelivery({ extractedData, requirements, hasPaid }: DocumentDeliveryProps) {
  const [documents, setDocuments] = useState<TravelDocument[]>([])
  const [isGenerating, setIsGenerating] = useState(true)
  const [completedDocs, setCompletedDocs] = useState<Set<string>>(new Set())
  const [showCongratsPage, setShowCongratsPage] = useState(false)
  const [showLawsDialog, setShowLawsDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [wantsLaws, setWantsLaws] = useState<boolean | null>(null)
  const [itinerary, setItinerary] = useState<any>(null)
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false)
  const [showItinerary, setShowItinerary] = useState(false)
  
  const [userData] = useKV<any>('user-travel-data', undefined)

  const hasItineraryOption = requirements.some(req => req.id === 'ai-itinerary' && req.userHas)

  useEffect(() => {
    const generate = async () => {
      setIsGenerating(true)
      const docs = await generateDocuments(extractedData, requirements)
      setDocuments(docs)
      setIsGenerating(false)
      
      if (hasItineraryOption && hasPaid) {
        setIsGeneratingItinerary(true)
        const itineraryData = await generateItinerary(extractedData.destination)
        setItinerary(itineraryData)
        setIsGeneratingItinerary(false)
      }
    }
    generate()
  }, [extractedData, requirements, hasItineraryOption, hasPaid])

  const toggleCompleted = (docId: string) => {
    setCompletedDocs(prev => {
      const next = new Set(prev)
      if (next.has(docId)) {
        next.delete(docId)
      } else {
        next.add(docId)
      }
      return next
    })
  }

  const handleFinish = () => {
    setShowCongratsPage(true)
  }

  const handleDeleteData = async () => {
    try {
      await window.spark.kv.delete('user-travel-data')
      await window.spark.kv.delete('extracted-data')
      await window.spark.kv.delete('requirements')
      setShowDeleteConfirm(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-primary border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
          <h3 className="text-2xl font-semibold">We just finished your required documents...</h3>
          <p className="text-muted-foreground">
            Our AI is pre-filling your forms with verified data
          </p>
          <div className="pt-4 space-y-2 text-left">
            <p className="text-sm flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              Accessing official government websites
            </p>
            <p className="text-sm flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              Pre-filling known information
            </p>
            <p className="text-sm flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              Identifying missing fields
            </p>
            <p className="text-sm flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              Generating PDFs
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const allCompleted = documents.every(doc => completedDocs.has(doc.id))

  const isSingapore = extractedData.destination.toLowerCase().includes('singapore')
  const isThailand = extractedData.destination.toLowerCase().includes('thailand')
  const isJapan = extractedData.destination.toLowerCase().includes('japan')

  const getCountryLaws = () => {
    if (isSingapore) {
      return [
        { law: 'Vaping is illegal', fine: 'Up to SGD 2,000 (~PHP 90,000)' },
        { law: 'No chewing gum (except medicinal)', fine: 'Fine up to SGD 1,000' },
        { law: 'Do not litter', fine: 'SGD 300-1,000 fine' },
        { law: 'No smoking except designated areas', fine: 'SGD 200-1,000 fine' },
        { law: 'No eating/drinking in public transport (including Grab)', fine: 'SGD 500 fine' },
        { law: 'No jaywalking', fine: 'SGD 50 fine for first offense' },
        { law: 'No public intoxication', fine: 'Arrest and prosecution' },
        { law: 'NO DRUGS: Oh I\'m sorry, every country actually has this law 😉', fine: 'Death penalty for trafficking' },
      ]
    } else if (isThailand) {
      return [
        { law: 'Do not disrespect monarchy or Buddha images', fine: 'Imprisonment' },
        { law: 'Dress modestly in temples', fine: 'May be denied entry' },
        { law: 'NO DRUGS: Oh I\'m sorry, every country actually has this law 😉', fine: 'Severe penalties including death' },
        { law: 'Respect monks - women cannot touch', fine: 'Cultural offense' },
        { law: 'Do not step on Thai currency (has King\'s image)', fine: 'Jail time' },
      ]
    } else if (isJapan) {
      return [
        { law: 'No loud talking on trains', fine: 'Social disapproval' },
        { law: 'Remove shoes when entering homes/temples', fine: 'Major offense' },
        { law: 'No tipping (considered rude)', fine: 'Cultural offense' },
        { law: 'Dispose of trash properly - no public bins', fine: 'Take trash with you' },
        { law: 'NO DRUGS: Oh I\'m sorry, every country actually has this law 😉 (including CBD products)', fine: 'Immediate deportation' },
      ]
    }
    return []
  }

  if (showCongratsPage) {
    return <CongratsPage
      destination={extractedData.destination}
      onShowLaws={() => setShowLawsDialog(true)}
      onDeleteData={() => setShowDeleteConfirm(true)}
      laws={getCountryLaws()}
      showLawsDialog={showLawsDialog}
      onCloseLawsDialog={() => setShowLawsDialog(false)}
      showDeleteConfirm={showDeleteConfirm}
      onCancelDelete={() => setShowDeleteConfirm(false)}
      onConfirmDelete={handleDeleteData}
    />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold">Your Documents Are Ready! 🎉</h2>
        </motion.div>
        <p className="text-muted-foreground">
          Download PDFs and complete any missing information on official government sites
        </p>
      </div>

      <Card className="p-2 bg-accent/10 border-accent">
        <div className="flex items-start gap-2">
          <Warning size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Please double-check each document</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI can make mistakes. Review all pre-filled information carefully before submitting.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={completedDocs.has(doc.id)}
                        onCheckedChange={() => toggleCompleted(doc.id)}
                      />
                      <label htmlFor={`doc-${doc.id}`} className="text-xl font-semibold cursor-pointer">
                        {doc.name}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-9">
                      <Badge variant={doc.completed ? 'default' : 'secondary'} className="bg-success text-success-foreground">
                        {doc.completed ? '✓ Complete' : '⚠️ Action Required'}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(doc.confidence)}% Confidence
                      </Badge>
                    </div>
                  </div>
                </div>

                {doc.missingFields.length > 0 && (
                  <div className="ml-9 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm font-medium text-amber-900 mb-1">Missing Information:</p>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {doc.missingFields.map((field, i) => (
                        <li key={i}>• {field}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="ml-9 flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2">
                    <FilePdf size={18} />
                    Download PDF
                  </Button>
                  
                  {hasPaid ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(doc.officialUrl, '_blank')}
                    >
                      <ArrowSquareOut size={18} />
                      Open Official Site
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled
                    >
                      <ArrowSquareOut size={18} />
                      Payment Required
                    </Button>
                  )}
                </div>

                {hasPaid && (
                  <>
                    <div className="ml-9 flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={16} className="text-success" />
                      <span>Verified: {doc.officialUrl}</span>
                    </div>
                    
                    <div className="ml-9 text-xs text-muted-foreground">
                      Last verified: {new Date(doc.lastVerified).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {hasItineraryOption && hasPaid && (
        <Card className="p-6 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border-accent border-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkle size={28} className="text-accent" weight="duotone" />
                <div>
                  <h3 className="text-xl font-bold">Your AI Travel Itinerary</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalized recommendations for {extractedData.destination}
                  </p>
                </div>
              </div>
              {!isGeneratingItinerary && itinerary && (
                <Button onClick={() => setShowItinerary(true)} className="bg-accent hover:bg-accent/90">
                  View Guide
                </Button>
              )}
            </div>
            
            {isGeneratingItinerary && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium">Generating your personalized itinerary...</p>
                </div>
              </div>
            )}
            
            {!isGeneratingItinerary && itinerary && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <ForkKnife size={20} className="text-accent" />
                    <h4 className="font-semibold">Restaurants & Food</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {itinerary.restaurants?.length || 0} restaurants + {itinerary.foods?.length || 0} local dishes
                  </p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <MapTrifold size={20} className="text-accent" />
                    <h4 className="font-semibold">Places & Activities</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {itinerary.attractions?.length || 0} attractions + {itinerary.mustDo?.length || 0} activities
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-primary/5 border-primary">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Next Steps:</h3>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Download all PDFs to your device</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Click "Open Official Site" for each document</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Review the pre-filled information carefully</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Complete any missing fields (highlighted in yellow on the PDFs)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">5.</span>
              <span>Submit each form on the official government website</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">6.</span>
              <span>Save confirmation emails and QR codes</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">7.</span>
              <span>Check the box above when each document is submitted</span>
            </li>
          </ol>
        </div>
      </Card>

      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 bg-success/10 border-success text-center space-y-4">
            <CheckCircle size={64} className="text-success mx-auto" weight="duotone" />
            <h3 className="text-2xl font-bold">All Documents Submitted! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              You're all set! Let's get you ready for your trip.
            </p>
            <Button
              size="lg"
              onClick={handleFinish}
              className="min-w-48"
            >
              Finish & View Travel Tips
            </Button>
          </Card>
        </motion.div>
      )}

      <Dialog open={showItinerary} onOpenChange={setShowItinerary}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkle className="text-accent" weight="duotone" />
              Your AI Travel Guide for {extractedData.destination}
            </DialogTitle>
            <DialogDescription>
              Curated recommendations from AI based on local insights
            </DialogDescription>
          </DialogHeader>
          
          {itinerary && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <ForkKnife className="text-accent" />
                  Top Restaurants
                </h3>
                <div className="space-y-3">
                  {itinerary.restaurants?.map((restaurant: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-3">
                        <Badge className="shrink-0 h-6">{index + 1}</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold">{restaurant.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{restaurant.cuisine}</p>
                          <p className="text-sm mt-2">{restaurant.description}</p>
                          <p className="text-sm text-accent font-medium mt-2">
                            🍽️ Must Try: {restaurant.mustTry}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <MapTrifold className="text-accent" />
                  Must-Visit Places
                </h3>
                <div className="space-y-3">
                  {itinerary.attractions?.map((place: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-3">
                        <Badge className="shrink-0 h-6">{index + 1}</Badge>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold">{place.name}</h4>
                            <Badge variant="outline" className="text-xs">{place.category}</Badge>
                          </div>
                          <p className="text-sm mt-2">{place.description}</p>
                          <p className="text-sm text-accent font-medium mt-2">
                            💡 Tip: {place.tip}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  🍜 Local Foods to Try
                </h3>
                <div className="space-y-3">
                  {itinerary.foods?.map((food: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-3">
                        <Badge className="shrink-0 h-6">{index + 1}</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold">{food.name}</h4>
                          <p className="text-sm mt-1">{food.description}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            📍 Where: {food.where}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  ✨ Must-Do Activities
                </h3>
                <div className="space-y-3">
                  {itinerary.mustDo?.map((activity: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-3">
                        <Badge className="shrink-0 h-6">{index + 1}</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold">{activity.activity}</h4>
                          <p className="text-sm mt-1">{activity.description}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            🕐 Best Time: {activity.bestTime}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <Button onClick={() => setShowItinerary(false)} className="w-full">
            Close Guide
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CongratsPageProps {
  destination: string
  onShowLaws: () => void
  onDeleteData: () => void
  laws: Array<{ law: string; fine: string }>
  showLawsDialog: boolean
  onCloseLawsDialog: () => void
  showDeleteConfirm: boolean
  onCancelDelete: () => void
  onConfirmDelete: () => void
}

function CongratsPage({
  destination,
  onShowLaws,
  onDeleteData,
  laws,
  showLawsDialog,
  onCloseLawsDialog,
  showDeleteConfirm,
  onCancelDelete,
  onConfirmDelete
}: CongratsPageProps) {
  const countryName = destination.split(',')[1]?.trim() || destination

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center"
      >
        <div className="text-8xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold mb-2">CONGRATULATIONS!</h1>
        <p className="text-xl text-muted-foreground">Your documents are ready for {destination}</p>
      </motion.div>

      <Card className="p-4 border-2 border-accent max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <Warning size={24} className="text-accent shrink-0 mt-0.5" weight="duotone" />
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Important Reminder</h2>
            
            {countryName.toLowerCase().includes('singapore') && (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">
                  <strong>Singapore is a strict country implementing rules without exemption.</strong> They have strict goals of keeping their country clean and safe. As a visitor, you must obey their laws and respect everyone. Better be careful and read their laws carefully.
                </p>
                
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-2">
                  <p className="font-semibold text-destructive text-sm flex items-center gap-2">
                    <Warning size={18} />
                    Key Laws to Remember:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Vapes are NOT allowed</strong> - can charge you up to SGD 2,000 (~PHP 90,000)</li>
                    <li>• <strong>Make sure you stand and walk on proper sides</strong></li>
                    <li>• <strong>Join the queues</strong> - cutting in line is offensive</li>
                    <li>• <strong>Do not litter</strong> - Singapore is "The Fine Country" for the fines they give</li>
                    <li>• <strong>No chewing gum</strong> (except medicinal)</li>
                    <li>• <strong>Foods and drinks NOT allowed in public transportation</strong> (Grab is no exemption)</li>
                    <li>• <strong>Do not smoke</strong> unless in specifically designated areas</li>
                    <li>• <strong>NO DRUGS:</strong> Oh I'm sorry, every country actually has this law 😉</li>
                  </ul>
                </div>
              </div>
            )}

            {countryName.toLowerCase().includes('thailand') && (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">
                  <strong>Thailand has strict cultural and legal rules.</strong> Show respect to the monarchy, Buddha images, and monks at all times.
                </p>
                
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-2">
                  <p className="font-semibold text-destructive text-sm flex items-center gap-2">
                    <Warning size={18} />
                    Key Laws to Remember:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Never disrespect monarchy or Buddha images</strong> - serious offense</li>
                    <li>• <strong>Dress modestly in temples</strong> - cover shoulders and knees</li>
                    <li>• <strong>Women cannot touch monks</strong></li>
                    <li>• <strong>Do not step on Thai currency</strong> (has King's image)</li>
                    <li>• <strong>NO DRUGS:</strong> Oh I'm sorry, every country actually has this law 😉</li>
                    <li>• <strong>Remove shoes before entering temples/homes</strong></li>
                  </ul>
                </div>
              </div>
            )}

            {!countryName.toLowerCase().includes('singapore') && !countryName.toLowerCase().includes('thailand') && (
              <p className="text-sm leading-relaxed">
                Every country has its own laws and customs. Please research and respect the local laws of {countryName}. When in doubt, observe what locals do and follow their lead.
              </p>
            )}
          </div>
        </div>
      </Card>

      {laws.length > 0 && (
        <Card className="p-6 bg-muted/50">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Do you want more details about local laws?</h3>
            <p className="text-sm text-muted-foreground">
              Get the complete list of laws that might be legal in your country but illegal in {countryName}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={onShowLaws} size="lg">
                ✅ Yes, Show Me
              </Button>
              <Button variant="outline" onClick={() => {}} size="lg">
                ❌ No, Thanks
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 border-destructive/50">
        <div className="text-center space-y-4">
          <Trash size={32} className="text-destructive mx-auto" weight="duotone" />
          <h3 className="text-lg font-semibold">Delete My Information</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your privacy is important. All your uploaded documents and personal information are encrypted and can be deleted anytime.
          </p>
          <Button
            variant="destructive"
            onClick={onDeleteData}
            size="lg"
          >
            Delete All My Data
          </Button>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Start Another Trip
        </Button>
      </div>

      <Dialog open={showLawsDialog} onOpenChange={onCloseLawsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete List of {countryName} Laws</DialogTitle>
            <DialogDescription>
              Laws that might be different from your home country
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {laws.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="destructive" className="shrink-0">{index + 1}</Badge>
                  <div className="flex-1">
                    <p className="font-semibold">{item.law}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Penalty:</strong> {item.fine}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button onClick={onCloseLawsDialog} className="w-full">
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={onCancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Your Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your uploaded documents, extracted information, and trip details. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              Yes, Delete Everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
