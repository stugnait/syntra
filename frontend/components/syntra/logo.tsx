import Link from 'next/link'

interface SyntraLogoProps {
  iconSize?: number
  showText?: boolean
  href?: string
  className?: string
}

export function SyntraLogo({
  iconSize = 36,
  showText = true,
  href = '/',
  className = '',
}: SyntraLogoProps) {
  const content = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <SyntraIcon size={iconSize} />
      {showText && (
        <span className="font-display font-bold text-white tracking-tight" style={{ fontSize: iconSize * 0.56 }}>
          SYNTRA
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2.5">
        {content}
      </Link>
    )
  }
  return content
}

export function SyntraIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-label="SYNTRA logo"
    >
      {/* Hexagon shell */}
      <path
        d="M18 2L32 10V26L18 34L4 26V10L18 2Z"
        fill="url(#hexFill)"
        stroke="url(#hexStroke)"
        strokeWidth="1.2"
      />
      {/* Crosshair dot */}
      <circle cx="18" cy="18" r="1.5" fill="rgba(124,58,237,0.9)" />
      {/* S-trace letterform */}
      <path
        d="M23.5 13C23.5 13 21.2 11.5 18 11.5C14.8 11.5 12.5 13 12.5 15.2C12.5 17.4 15 18 18 18.5C21 19 23.5 19.6 23.5 21.8C23.5 24 21.2 25 18 25C14.8 25 12.5 23.5 12.5 23.5"
        stroke="url(#sGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Corner ticks */}
      <line x1="6" y1="10.8" x2="9" y2="10.8" stroke="rgba(34,211,238,0.5)" strokeWidth="1" />
      <line x1="30" y1="25.2" x2="27" y2="25.2" stroke="rgba(34,211,238,0.5)" strokeWidth="1" />
      <defs>
        <linearGradient id="hexFill" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(124,58,237,0.18)" />
          <stop offset="100%" stopColor="rgba(124,58,237,0.06)" />
        </linearGradient>
        <linearGradient id="hexStroke" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(159,103,255,0.8)" />
          <stop offset="100%" stopColor="rgba(124,58,237,0.4)" />
        </linearGradient>
        <linearGradient id="sGrad" x1="12" y1="18" x2="24" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9F67FF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  )
}
