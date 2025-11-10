import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import Hero from '@/components/Hero'
import DocumentUpload from '@/components/DocumentUpload'
import DataVerification from '@/components/DataVerification'
import RequirementsChecklist from '@/components/RequirementsChecklist'
import Payment from '@/components/Payment'
import DocumentDelivery from '@/components/DocumentDelivery'
import ProgressStepper from '@/components/ProgressStepper'
import { ExtractedData, TripRequirement } from '@/types'

const STEPS = [
  { id: 'upload', name: 'Upload', description: 'Upload documents' },
  { id: 'verify', name: 'Verify', description: 'Verify information' },
  { id: 'requirements', name: 'Requirements', description: 'Check requirements' },
  { id: 'payment', name: 'Payment', description: 'Choose plan' },
  { id: 'documents', name: 'Documents', description: 'Get documents' }
]

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [requirements, setRequirements] = useState<TripRequirement[]>([])

  const handleStart = () => {
    setCurrentStep(1)
  }

  const handleUploadComplete = (files: File[]) => {
    setUploadedFiles(files)
    setCurrentStep(2)
  }

  const handleDataVerified = (data: ExtractedData) => {
    setExtractedData(data)
    setCurrentStep(3)
  }

  const handleRequirementsProceed = (reqs: TripRequirement[]) => {
    setRequirements(reqs)
    setCurrentStep(4)
  }

  const handlePaymentComplete = () => {
    setCurrentStep(5)
  }

  return (
    <div className="min-h-screen bg-background">
      {currentStep === 0 && <Hero onStart={handleStart} />}
      
      {currentStep > 0 && (
        <>
          <div className="border-b bg-card">
            <ProgressStepper steps={STEPS} currentStep={currentStep - 1} />
          </div>
          
          <div className="py-8">
            {currentStep === 1 && <DocumentUpload onUploadComplete={handleUploadComplete} />}
            {currentStep === 2 && uploadedFiles.length > 0 && (
              <DataVerification files={uploadedFiles} onVerified={handleDataVerified} />
            )}
            {currentStep === 3 && extractedData && (
              <RequirementsChecklist extractedData={extractedData} onProceed={handleRequirementsProceed} />
            )}
            {currentStep === 4 && requirements.length > 0 && (
              <Payment requirements={requirements} onPaymentComplete={handlePaymentComplete} />
            )}
            {currentStep === 5 && extractedData && requirements.length > 0 && (
              <DocumentDelivery extractedData={extractedData} requirements={requirements} />
            )}
          </div>
        </>
      )}
      
      <Toaster />
    </div>
  )
}

export default App