import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ExtractedData, TripRequirement, TravelDocument } from '@/types'
import { FilePdf, ArrowSquareOut, Warning, CheckCircle, Download } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { generateDocuments } from '@/lib/ai-service'

interface DocumentDeliveryProps {
  extractedData: ExtractedData
  requirements: TripRequirement[]
}

export default function DocumentDelivery({ extractedData, requirements }: DocumentDeliveryProps) {
  const [documents, setDocuments] = useState<TravelDocument[]>([])
  const [isGenerating, setIsGenerating] = useState(true)
  const [completedDocs, setCompletedDocs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const generate = async () => {
      setIsGenerating(true)
      const docs = await generateDocuments(extractedData, requirements)
      setDocuments(docs)
      setIsGenerating(false)
    }
    generate()
  }, [extractedData, requirements])

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
                  
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(doc.officialUrl, '_blank')}
                  >
                    <ArrowSquareOut size={18} />
                    Open Official Site
                  </Button>
                </div>

                <div className="ml-9 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-success" />
                  <span>Verified: {doc.officialUrl}</span>
                </div>
                
                <div className="ml-9 text-xs text-muted-foreground">
                  Last verified: {new Date(doc.lastVerified).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

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
          <Card className="p-6 bg-success/10 border-success text-center">
            <CheckCircle size={48} className="text-success mx-auto mb-3" weight="duotone" />
            <h3 className="text-xl font-bold mb-2">All Documents Submitted! 🎉</h3>
            <p className="text-muted-foreground">
              You're all set for your trip. Have a wonderful journey!
            </p>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Start Another Trip
        </Button>
      </div>
    </div>
  )
}
