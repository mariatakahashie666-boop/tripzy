import { Card } from '@/components/ui/card'
import { Warning, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ConfidenceAlertProps {
  type: 'no-data' | 'very-low' | 'low' | 'good'
  confidence?: number
}

export default function ConfidenceAlert({ type, confidence }: ConfidenceAlertProps) {
  if (type === 'no-data') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-2 bg-destructive/10 border-destructive">
          <div className="flex items-start gap-2">
            <Warning size={16} className="text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Unable to Read Documents</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                GPT-4 Vision couldn't extract information from your documents. Common issues:
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                <li>Image is too blurry or low resolution</li>
                <li>Poor lighting or glare on document</li>
                <li>Text is obscured or cut off</li>
                <li>Wrong document type (need passport biodata page)</li>
              </ul>
              <p className="text-xs font-medium text-foreground mt-1.5">
                ✏️ You can manually enter your information below, or go back and upload clearer images.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                💡 Tip: Check browser console (F12) for detailed error logs
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (type === 'very-low') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-2 bg-destructive/10 border-destructive">
          <div className="flex items-start gap-2">
            <Warning size={16} className="text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Very Low Confidence Scan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confidence: {confidence}% - We had difficulty reading your documents. Please verify all fields very carefully and correct any errors.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (type === 'low') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-2 bg-accent/10 border-accent">
          <div className="flex items-start gap-2">
            <Warning size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Good Scan - Please Verify</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confidence: {confidence}% - Most fields were read successfully. Please review carefully before proceeding.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  // type === 'good'
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-2 bg-success/10 border-success">
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="text-sm font-medium text-success">Excellent Scan! 🎉</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Confidence: {confidence}% - All key information extracted successfully. Please verify the details below are correct.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
