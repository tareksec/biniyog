export function HeroWave({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f8a6b" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#34c9a0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0f8a6b" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="hwLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f8a6b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#34c9a0" stopOpacity="0.05" />
        </linearGradient>
        <filter id="hwBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>

      {/* Soft blob mass */}
      <g filter="url(#hwBlur)" opacity="0.85">
        <path
          d="M120 340 C 200 180, 400 120, 560 200 C 720 280, 820 200, 820 360 C 820 500, 620 540, 460 500 C 300 460, 60 500, 120 340 Z"
          fill="url(#hwGrad)"
        />
      </g>

      {/* Orchestrated capital lines */}
      <g fill="none" stroke="url(#hwLine)" strokeWidth="1.2">
        <path d="M60 420 C 220 320, 340 500, 500 380 S 780 320, 860 420" />
        <path d="M60 460 C 220 380, 340 540, 500 440 S 780 380, 860 460" />
        <path d="M60 380 C 220 260, 340 460, 500 320 S 780 260, 860 380" />
        <path d="M60 340 C 220 220, 340 440, 500 260 S 780 220, 860 340" />
      </g>

      {/* Nodes */}
      <g fill="#0f8a6b">
        {[
          [180, 380], [280, 300], [420, 360], [540, 260],
          [640, 340], [740, 300], [820, 400],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} opacity={0.85} />
        ))}
      </g>
      <g fill="#ffffff" stroke="#0f8a6b" strokeWidth="1.5">
        {[[280, 300], [540, 260], [740, 300]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} />
        ))}
      </g>
    </svg>
  );
}
