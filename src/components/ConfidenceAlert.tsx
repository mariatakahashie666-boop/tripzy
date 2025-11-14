import { Card } from '@/components/ui/card'
import { Warning, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ConfidenceAlertProps {
  type: 'no-data' | 'very-low' | 'low' | 'good'
  confidence?: number
}

interface AlertConfig {
  bgClass: string
  borderClass: string
  iconClass: string
  icon: 'warning' | 'check'
  title: string
  titleClass?: string
  message: string | JSX.Element
}

const getAlertConfig = (type: ConfidenceAlertProps['type'], confidence?: number): AlertConfig => {
  switch (type) {
    case 'no-data':
      return {
        bgClass: 'bg-destructive/10',
        borderClass: 'border-destructive',
        iconClass: 'text-destructive',
        icon: 'warning',
        title: 'Unable to Read Documents',
        titleClass: 'text-destructive',
        message: (
          <>
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
          </>
        )
      }
    case 'very-low':
      return {
        bgClass: 'bg-destructive/10',
        borderClass: 'border-destructive',
        iconClass: 'text-destructive',
        icon: 'warning',
        title: 'Very Low Confidence Scan',
        titleClass: 'text-destructive',
        message: `Confidence: ${confidence}% - We had difficulty reading your documents. Please verify all fields very carefully and correct any errors.`
      }
    case 'low':
      return {
        bgClass: 'bg-accent/10',
        borderClass: 'border-accent',
        iconClass: 'text-accent',
        icon: 'warning',
        title: 'Good Scan - Please Verify',
        message: `Confidence: ${confidence}% - Most fields were read successfully. Please review carefully before proceeding.`
      }
    case 'good':
      return {
        bgClass: 'bg-success/10',
        borderClass: 'border-success',
        iconClass: 'text-success',
        icon: 'check',
        title: 'Excellent Scan! 🎉',
        titleClass: 'text-success',
        message: `Confidence: ${confidence}% - All key information extracted successfully. Please verify the details below are correct.`
      }
  }
}

export default function ConfidenceAlert({ type, confidence }: ConfidenceAlertProps) {
  const config = getAlertConfig(type, confidence)
  const Icon = config.icon === 'warning' ? Warning : CheckCircle
  const iconWeight = config.icon === 'check' ? 'fill' : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`p-2 ${config.bgClass} ${config.borderClass}`}>
        <div className="flex items-start gap-2">
          <Icon size={16} className={`${config.iconClass} flex-shrink-0 mt-0.5`} weight={iconWeight} />
          <div>
            <p className={`text-sm font-medium ${config.titleClass || ''}`}>{config.title}</p>
            {typeof config.message === 'string' ? (
              <p className="text-xs text-muted-foreground mt-0.5">{config.message}</p>
            ) : (
              config.message
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
