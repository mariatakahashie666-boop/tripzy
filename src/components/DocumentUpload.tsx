import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CloudArrowUp, File, X, Eye, Warning, CheckCircle, Pencil } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ExtractedData } from '@/types'

interface DocumentUploadProps {
  onUploadComplete: (files: File[]) => void
}

interface FileWithPreview extends File {
  preview?: string
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [passportUploaded, setPassportUploaded] = useState(false)
  const [ticketUploaded, setTicketUploaded] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileWithPreview | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [manualData, setManualData] = useState<Partial<ExtractedData>>({
    firstName: '',
    lastName: '',
    passportNumber: '',
    dateOfBirth: '',
    nationality: '',
    passportExpiry: '',
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    flightNumber: ''
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const createFilePreview = (file: File): Promise<FileWithPreview> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const fileWithPreview = Object.assign(file, { preview: reader.result as string })
          resolve(fileWithPreview)
        }
        reader.readAsDataURL(file)
      } else {
        resolve(file)
      }
    })
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).slice(0, 5 - files.length)
      const filesWithPreviews = await Promise.all(newFiles.map(createFilePreview))
      
      if (filesWithPreviews.length === 1 && filesWithPreviews[0].type.startsWith('image/')) {
        setPreviewFile(filesWithPreviews[0])
        setPreviewOpen(true)
      } else {
        setFiles(prev => [...prev, ...filesWithPreviews].slice(0, 5))
      }
    }
  }, [files.length])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'ticket' | 'additional') => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length)
      const filesWithPreviews = await Promise.all(newFiles.map(createFilePreview))
      
      if (filesWithPreviews.length === 1 && filesWithPreviews[0].type.startsWith('image/')) {
        setPreviewFile(filesWithPreviews[0])
        setPreviewOpen(true)
        if (type === 'passport') setPassportUploaded(true)
        if (type === 'ticket') setTicketUploaded(true)
      } else {
        setFiles(prev => [...prev, ...filesWithPreviews].slice(0, 5))
        if (type === 'passport') setPassportUploaded(true)
        if (type === 'ticket') setTicketUploaded(true)
      }
    }
    e.target.value = ''
  }

  const confirmPreview = () => {
    if (previewFile) {
      setFiles(prev => [...prev, previewFile].slice(0, 5))
    }
    setPreviewOpen(false)
    setPreviewFile(null)
  }

  const cancelPreview = () => {
    setPreviewOpen(false)
    setPreviewFile(null)
  }

  const removeFile = (index: number) => {
    const removedFile = files[index]
    if (removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview)
    }
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const viewFile = (file: FileWithPreview) => {
    setPreviewFile(file)
    setPreviewOpen(true)
  }

  const handleContinue = () => {
    if (files.length >= 2) {
      onUploadComplete(files)
    }
  }

  const handleManualEntry = () => {
    setManualEntryOpen(true)
  }

  const handleManualDataChange = (field: keyof ExtractedData, value: string) => {
    setManualData(prev => ({ ...prev, [field]: value }))
  }

  const handleManualSubmit = () => {
    try {
      const fileData = {
        name: 'manual-entry.txt',
        size: 0,
        type: 'text/plain',
        lastModified: Date.now(),
        manualData: { ...manualData, confidence: 100 },
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: async () => 'manual-entry',
        arrayBuffer: async () => new ArrayBuffer(0)
      } as unknown as FileWithPreview & { manualData: ExtractedData }
      
      setFiles([fileData])
      setPassportUploaded(true)
      setTicketUploaded(true)
      setManualEntryOpen(false)
      onUploadComplete([fileData as File])
    } catch (error) {
      console.error('Error creating file:', error)
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

      <Card className="p-4 bg-accent/10 border-accent mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil size={20} className="text-accent" weight="duotone" />
            <div>
              <p className="font-medium text-sm">Having trouble scanning?</p>
              <p className="text-xs text-muted-foreground">Type your details manually instead</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleManualEntry}
            className="shrink-0"
          >
            <Pencil className="mr-2" size={16} />
            Type Details Manually
          </Button>
        </div>
      </Card>

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
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <File size={20} className="text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.preview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewFile(file)}
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Verify Document Clarity</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {previewFile?.preview && (
              <div className="space-y-4">
                <div className="relative bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={previewFile.preview} 
                    alt={previewFile.name}
                    className="w-full h-auto"
                  />
                </div>

                <Card className="p-2 bg-accent/10 border-accent">
                  <div className="flex items-start gap-2">
                    <Warning size={16} className="text-accent shrink-0 mt-0.5" weight="fill" />
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">Please verify your document is:</p>
                      <ul className="space-y-0.5 text-muted-foreground">
                        <li>✓ All text is clear and readable</li>
                        <li>✓ No blur or glare</li>
                        <li>✓ All corners visible</li>
                        <li>✓ No fingers or objects covering text</li>
                        <li>✓ Good lighting without shadows</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-2 bg-muted/50">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success shrink-0 mt-0.5" weight="fill" />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-medium">Clear documents = Better accuracy</p>
                      <p className="text-muted-foreground">
                        High quality photos help us extract your information with 99% accuracy
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={cancelPreview}>
              Retake Photo
            </Button>
            <Button onClick={confirmPreview}>
              Looks Good, Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Enter Your Travel Details Manually</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-6 pr-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="font-semibold">Passport Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="JUAN"
                    value={manualData.firstName}
                    onChange={(e) => handleManualDataChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="DELA CRUZ"
                    value={manualData.lastName}
                    onChange={(e) => handleManualDataChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    placeholder="P1234567"
                    value={manualData.passportNumber}
                    onChange={(e) => handleManualDataChange('passportNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    placeholder="Philippines"
                    value={manualData.nationality}
                    onChange={(e) => handleManualDataChange('nationality', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={manualData.dateOfBirth}
                    onChange={(e) => handleManualDataChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                  <Input
                    id="passportExpiry"
                    type="date"
                    value={manualData.passportExpiry}
                    onChange={(e) => handleManualDataChange('passportExpiry', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="font-semibold">Flight Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin (From)</Label>
                  <Input
                    id="origin"
                    placeholder="Manila, Philippines"
                    value={manualData.origin}
                    onChange={(e) => handleManualDataChange('origin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination (To)</Label>
                  <Input
                    id="destination"
                    placeholder="Bangkok, Thailand"
                    value={manualData.destination}
                    onChange={(e) => handleManualDataChange('destination', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={manualData.departureDate}
                    onChange={(e) => handleManualDataChange('departureDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={manualData.returnDate}
                    onChange={(e) => handleManualDataChange('returnDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
                <Input
                  id="flightNumber"
                  placeholder="PR123"
                  value={manualData.flightNumber}
                  onChange={(e) => handleManualDataChange('flightNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setManualEntryOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualData.firstName || !manualData.lastName || !manualData.passportNumber || !manualData.destination}
            >
              Continue with Manual Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
