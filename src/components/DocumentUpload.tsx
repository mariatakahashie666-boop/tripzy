import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudArrowUp, File, X } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  onUploadComplete: (files: File[]) => void
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [passportUploaded, setPassportUploaded] = useState(false)
  const [ticketUploaded, setTicketUploaded] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).slice(0, 5)
      setFiles(prev => [...prev, ...newFiles].slice(0, 5))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'ticket' | 'additional') => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles].slice(0, 5))
      
      if (type === 'passport') setPassportUploaded(true)
      if (type === 'ticket') setTicketUploaded(true)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    if (files.length >= 2) {
      onUploadComplete(files)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Upload Your Documents</h2>
        <p className="text-muted-foreground">
          We need your passport and flight ticket to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className={cn(
          "p-6 border-2 border-dashed transition-colors",
          passportUploaded && "border-success bg-success/5"
        )}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">1. Passport</h3>
              {passportUploaded && (
                <span className="text-sm text-success">✓ Uploaded</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Main page with your photo and details
            </p>
            <input
              type="file"
              id="passport-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'passport')}
            />
            <Button
              variant={passportUploaded ? "outline" : "default"}
              className="w-full"
              onClick={() => document.getElementById('passport-upload')?.click()}
            >
              <File className="mr-2" size={20} />
              {passportUploaded ? 'Change Passport' : 'Upload Passport'}
            </Button>
          </div>
        </Card>

        <Card className={cn(
          "p-6 border-2 border-dashed transition-colors",
          ticketUploaded && "border-success bg-success/5"
        )}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">2. Flight Ticket</h3>
              {ticketUploaded && (
                <span className="text-sm text-success">✓ Uploaded</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Booking confirmation or e-ticket
            </p>
            <input
              type="file"
              id="ticket-upload"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'ticket')}
            />
            <Button
              variant={ticketUploaded ? "outline" : "default"}
              className="w-full"
              onClick={() => document.getElementById('ticket-upload')?.click()}
            >
              <File className="mr-2" size={20} />
              {ticketUploaded ? 'Change Ticket' : 'Upload Ticket'}
            </Button>
          </div>
        </Card>
      </div>

      <Card
        className={cn(
          "p-8 border-2 border-dashed transition-all cursor-pointer hover:border-accent",
          dragActive && "border-accent bg-accent/5 scale-[1.02]"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('additional-upload')?.click()}
      >
        <div className="text-center space-y-4">
          <CloudArrowUp className="mx-auto text-muted-foreground" size={48} weight="duotone" />
          <div>
            <p className="font-medium">Optional: Add More Documents</p>
            <p className="text-sm text-muted-foreground mt-1">
              Hotel booking, bank statement, etc. (up to 3 more)
            </p>
          </div>
          <input
            type="file"
            id="additional-upload"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e, 'additional')}
          />
          <p className="text-xs text-muted-foreground">
            Click or drag files here
          </p>
        </div>
      </Card>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h4 className="font-medium text-sm">Uploaded Files ({files.length}/5)</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-muted-foreground" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X size={16} />
                </Button>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={files.length < 2}
          onClick={handleContinue}
          className="min-w-40"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
