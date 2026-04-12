const MentoraLogo = ({ className = "h-10 w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Triangle Shape */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60D5FF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0080FF', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Main Triangle */}
      <path 
        d="M 100 30 L 170 150 L 30 150 Z" 
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="4"
      />
      
      {/* Inner Lines */}
      <path 
        d="M 100 60 L 140 130" 
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path 
        d="M 100 70 L 130 130" 
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path 
        d="M 100 80 L 120 130" 
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Glow effect */}
      <circle cx="100" cy="30" r="8" fill="#60D5FF" opacity="0.6" />
    </svg>
  )
}

export default MentoraLogo
