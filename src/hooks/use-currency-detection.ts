import { useState, useEffect } from 'react'

type Currency = 'USD' | 'EUR' | 'GBP' | 'PHP'

interface LocationData {
  country_code: string
  country_name: string
}

const CURRENCY_MAP: Record<string, Currency> = {
  'US': 'USD',
  'GB': 'GBP',
  'UK': 'GBP',
  'PH': 'PHP',
  'AT': 'EUR',
  'BE': 'EUR',
  'CY': 'EUR',
  'EE': 'EUR',
  'FI': 'EUR',
  'FR': 'EUR',
  'DE': 'EUR',
  'GR': 'EUR',
  'IE': 'EUR',
  'IT': 'EUR',
  'LV': 'EUR',
  'LT': 'EUR',
  'LU': 'EUR',
  'MT': 'EUR',
  'NL': 'EUR',
  'PT': 'EUR',
  'SK': 'EUR',
  'SI': 'EUR',
  'ES': 'EUR',
}

export function useCurrencyDetection() {
  const [detectedCurrency, setDetectedCurrency] = useState<Currency | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)
  const [countryName, setCountryName] = useState<string | null>(null)

  useEffect(() => {
    detectCurrency()
  }, [])

  const detectCurrency = async () => {
    setIsDetecting(true)
    try {
      const response = await fetch('https://ipapi.co/json/')
      
      if (!response.ok) {
        throw new Error('Failed to detect location')
      }

      const data: LocationData = await response.json()
      
      const currency = CURRENCY_MAP[data.country_code] || 'USD'
      setDetectedCurrency(currency)
      setCountryName(data.country_name)
      
    } catch (error) {
      console.error('Error detecting currency:', error)
      setDetectedCurrency('USD')
    } finally {
      setIsDetecting(false)
    }
  }

  return {
    detectedCurrency,
    isDetecting,
    countryName,
    redetect: detectCurrency
  }
}
