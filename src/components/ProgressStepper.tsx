import { CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  name: string
  description: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-accent text-accent-foreground ring-4 ring-accent/20',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle weight="fill" size={20} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <p className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-foreground',
                    !isCurrent && 'text-muted-foreground'
                  )}>
                    {step.name}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 text-center md:hidden">
          <p className="text-sm font-medium">{steps[currentStep].name}</p>
          <p className="text-xs text-muted-foreground">{steps[currentStep].description}</p>
        </div>
      </div>
    </div>
  )
}
