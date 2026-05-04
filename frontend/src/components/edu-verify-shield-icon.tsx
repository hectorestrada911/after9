"use client";

import { useId } from "react";

/** Green shield + mortarboard mark for student verification surfaces. */
export function EduVerifyShieldIcon({ size = 52 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `eduShieldFill-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="10" y1="6" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5cff9e" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path
        d="M26 4L44 11.2V24.5C44 35.2 36.8 43.5 26 48C15.2 43.5 8 35.2 8 24.5V11.2L26 4Z"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
      />
      <path d="M26 17L36 21L26 25L16 21L26 17Z" fill="white" fillOpacity="0.98" />
      <path d="M16 21H36V23H16V21Z" fill="white" fillOpacity="0.88" />
      <path d="M26 23V28" stroke="white" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 28H30" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
