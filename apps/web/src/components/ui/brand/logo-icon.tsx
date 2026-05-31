interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iso-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="iso-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="iso-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      <g opacity={0.35} transform="translate(0,10)">
        <polygon points="30,8 52,20 30,32 8,20" fill="url(#iso-top)" />
        <polygon points="8,20 30,32 30,44 8,32" fill="url(#iso-left)" />
        <polygon points="52,20 30,32 30,44 52,32" fill="url(#iso-right)" />
      </g>
      <g opacity={0.6} transform="translate(0,3)">
        <polygon points="30,8 52,20 30,32 8,20" fill="url(#iso-top)" />
        <polygon points="8,20 30,32 30,44 8,32" fill="url(#iso-left)" />
        <polygon points="52,20 30,32 30,44 52,32" fill="url(#iso-right)" />
      </g>
      <polygon points="30,8 52,20 30,32 8,20" fill="url(#iso-top)" />
      <polygon points="8,20 30,32 30,44 8,32" fill="url(#iso-left)" />
      <polygon points="52,20 30,32 30,44 52,32" fill="url(#iso-right)" />
    </svg>
  );
}
