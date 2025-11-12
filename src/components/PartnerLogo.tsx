import { ReactElement } from 'react'

interface PartnerLogoProps {
  logo: string
  className?: string
}

export default function PartnerLogo({ logo, className = "w-4 h-4" }: PartnerLogoProps) {
  const logos: Record<string, ReactElement> = {
    klook: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#FF5722"/>
        <path d="M7 6h2v5.5l4-4h2.5l-4 4 4.5 6.5h-2.5l-3.5-5-1 1V18H7V6z" fill="white"/>
      </svg>
    ),
    booking: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="2" fill="#003580"/>
        <path d="M6 7h5c2 0 3 1 3 2.5s-1 2.5-3 2.5H8v3H6V7zm2 3.5h3c.8 0 1-.5 1-1s-.2-1-1-1H8v2z" fill="white"/>
      </svg>
    ),
    agoda: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#D7153A"/>
        <path d="M12 7l-1.5 5h3L12 7zm-3 7l-.5 2h7l-.5-2h-6z" fill="white"/>
      </svg>
    ),
    worldnomads: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#00A651"/>
        <path d="M12 6l2 6h-4l2-6zm-3 9l-2 3h10l-2-3H9z" fill="white"/>
        <path d="M8 11l-2 2 2 2V11zm8 0v4l2-2-2-2z" fill="white"/>
      </svg>
    ),
    airalo: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="airalo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C5CE7"/>
            <stop offset="100%" stopColor="#A29BFE"/>
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#airalo-grad)"/>
        <path d="M12 6C9 6 7 8 7 11v6h2v-6c0-2 1-3 3-3s3 1 3 3v6h2v-6c0-3-2-5-5-5z" fill="white"/>
      </svg>
    ),
    getyourguide: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#FF6B00"/>
        <path d="M8 8v8h2v-3h2c2 0 3-1 3-2.5S14 8 12 8H8zm2 3.5v-2h2c.5 0 1 .2 1 1s-.5 1-1 1h-2z" fill="white"/>
        <circle cx="16" cy="12" r="1.5" fill="white"/>
      </svg>
    ),
    '12go': (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#FF9500"/>
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">12</text>
      </svg>
    ),
    viator: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#00AA6C"/>
        <path d="M7 7l2.5 10h1L13 7h-2l-1.5 6L8 7H7zm6 0v10h2V7h-2z" fill="white"/>
      </svg>
    )
  }

  return logos[logo] || <span className={className}>{logo}</span>
}
