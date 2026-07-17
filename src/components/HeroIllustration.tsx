export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 520"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hiBg" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d8f0e2" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d8f0e2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hiPlatform" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2ea36b" />
          <stop offset="100%" stopColor="#146c43" />
        </linearGradient>
        <linearGradient id="hiWallet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e8a54" />
          <stop offset="100%" stopColor="#0f5a37" />
        </linearGradient>
        <linearGradient id="hiCoin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbd66a" />
          <stop offset="100%" stopColor="#e5a419" />
        </linearGradient>
        <linearGradient id="hiBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2ea36b" />
          <stop offset="100%" stopColor="#146c43" />
        </linearGradient>
        <filter id="hiShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* soft background blobs */}
      <circle cx="470" cy="120" r="70" fill="url(#hiBg)" />
      <circle cx="120" cy="380" r="90" fill="url(#hiBg)" />

      {/* document / pie card */}
      <g transform="translate(300 60)">
        <rect x="0" y="10" width="230" height="270" rx="18" fill="#111827" opacity="0.06" filter="url(#hiShadow)" />
        <rect x="0" y="0" width="230" height="270" rx="18" fill="#ffffff" stroke="#e3ebe5" />
        <circle cx="60" cy="70" r="34" fill="#eaf7ef" />
        <path d="M60 36 A34 34 0 0 1 94 70 L60 70 Z" fill="#146c43" />
        <path d="M60 36 A34 34 0 0 0 26 70 L60 70 Z" fill="#2ea36b" />
        <rect x="110" y="52" width="90" height="8" rx="4" fill="#d1e5d8" />
        <rect x="110" y="70" width="60" height="8" rx="4" fill="#e3ebe5" />
        <rect x="20" y="130" width="190" height="10" rx="5" fill="#eaf7ef" />
        <rect x="20" y="150" width="150" height="10" rx="5" fill="#f1f5f2" />
        <rect x="20" y="170" width="170" height="10" rx="5" fill="#eaf7ef" />
        <rect x="20" y="190" width="120" height="10" rx="5" fill="#f1f5f2" />
        <rect x="20" y="220" width="80" height="24" rx="12" fill="#146c43" />
      </g>

      {/* growth arrow */}
      <g stroke="#2ea36b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M180 360 L250 300 L310 340 L400 240" />
        <path d="M370 232 L400 240 L392 270" />
      </g>

      {/* platform */}
      <ellipse cx="280" cy="430" rx="200" ry="34" fill="#146c43" opacity="0.15" />
      <ellipse cx="280" cy="420" rx="200" ry="34" fill="url(#hiPlatform)" />
      <ellipse cx="280" cy="416" rx="200" ry="30" fill="#2ea36b" opacity="0.4" />

      {/* bars */}
      <g>
        <rect x="170" y="330" width="42" height="90" rx="8" fill="url(#hiBar)" />
        <rect x="220" y="290" width="42" height="130" rx="8" fill="url(#hiBar)" />
        <rect x="270" y="250" width="42" height="170" rx="8" fill="url(#hiBar)" />
      </g>

      {/* wallet */}
      <g transform="translate(360 300)">
        <rect x="0" y="6" width="150" height="115" rx="16" fill="#111827" opacity="0.15" filter="url(#hiShadow)" />
        <rect x="0" y="0" width="150" height="115" rx="16" fill="url(#hiWallet)" />
        <path d="M0 30 L150 30" stroke="#0f5a37" strokeWidth="2" opacity="0.5" />
        <circle cx="115" cy="65" r="12" fill="#e5a419" />
        <circle cx="115" cy="65" r="5" fill="#146c43" />
      </g>

      {/* floating coin */}
      <g transform="translate(210 140)">
        <ellipse cx="0" cy="60" rx="46" ry="10" fill="#111827" opacity="0.12" />
        <circle cx="0" cy="0" r="46" fill="url(#hiCoin)" />
        <circle cx="0" cy="0" r="46" fill="none" stroke="#c48a12" strokeWidth="3" />
        <circle cx="0" cy="0" r="34" fill="none" stroke="#c48a12" strokeWidth="1.5" opacity="0.5" />
        <text x="0" y="10" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="32" fontWeight="700" fill="#7a5209">৳</text>
      </g>

      {/* coin stack */}
      <g transform="translate(430 380)">
        <ellipse cx="0" cy="30" rx="34" ry="9" fill="url(#hiCoin)" stroke="#c48a12" />
        <ellipse cx="0" cy="18" rx="34" ry="9" fill="url(#hiCoin)" stroke="#c48a12" />
        <ellipse cx="0" cy="6" rx="34" ry="9" fill="url(#hiCoin)" stroke="#c48a12" />
      </g>
    </svg>
  );
}
