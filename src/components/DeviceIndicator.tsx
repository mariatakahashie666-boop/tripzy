import { DeviceMobile, Desktop } from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function DeviceIndicator() {
  const isMobile = useIsMobile()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50"
      >
        <Card className="p-3 shadow-lg border-2 border-accent/20 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {isMobile ? (
              <>
                <DeviceMobile size={20} className="text-accent" weight="duotone" />
                <div className="text-sm">
                  <p className="font-semibold text-accent">Mobile Mode</p>
                  <p className="text-xs text-muted-foreground">Camera optimized</p>
                </div>
              </>
            ) : (
              <>
                <Desktop size={20} className="text-accent" weight="duotone" />
                <div className="text-sm">
                  <p className="font-semibold text-accent">Desktop Mode</p>
                  <p className="text-xs text-muted-foreground">File upload ready</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
