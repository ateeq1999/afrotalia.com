/**
 * Brand-mark icons. Solid geometric shapes on a 4px grid, no border radius
 * — see spec: "Afrotalia Mnada" (gavel) and "Afrotalia Shop" (mitred tote
 * bag). Kept separate from packages/ui/components — these are brand
 * assets, not general-purpose UI icons.
 */

export function GavelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <g transform="rotate(45 12 12)">
        <rect x="9" y="2" width="6" height="10" />
        <rect x="10.5" y="12" width="3" height="8" />
      </g>
      <rect x="4" y="20" width="10" height="2" />
    </svg>
  );
}

export function ToteBagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinejoin="miter"
      strokeLinecap="butt"
      className={className}
      aria-hidden
    >
      <path d="M6 9 L8 5 H16 L18 9 V21 H6 Z" />
      <path d="M9 9 V6 H15 V9" />
    </svg>
  );
}
