import React from 'react';

/** Icônes piliers charte DJAMSANTÉ — style plat teal/vert */
const BRAND_TEAL = '#0D5C6E';
const BRAND_GREEN = '#00A651';

export function IconDigitalHealth({ size = 32, color = BRAND_TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="14" y="6" width="20" height="36" rx="4" stroke={color} strokeWidth="2.5" />
      <path d="M20 14h8M20 20h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="21" y="28" width="6" height="6" rx="1" fill={BRAND_GREEN} />
      <path d="M24 25v3M22 27h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconAccessible({ size = 32, color = BRAND_TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="14" r="4" fill={color} />
      <circle cx="12" cy="28" r="3.5" fill={color} />
      <circle cx="36" cy="28" r="3.5" fill={color} />
      <path d="M24 18v8M12 31.5l12-5.5M36 31.5l-12-5.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 36c4-2 8-2 14-2s10 0 14 2" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSecure({ size = 32, color = BRAND_TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 6L8 14v12c0 10 6.5 16.5 16 18 9.5-1.5 16-8 16-18V14L24 6z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="20" y="22" width="8" height="10" rx="1.5" stroke={BRAND_GREEN} strokeWidth="2" />
      <path d="M22 22v-3a2 2 0 014 0v3" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconReliable({ size = 32, color = BRAND_TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 38c8-6 14-12 14-20a14 14 0 00-28 0c0 8 6 14 14 20z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 24h6l3-6 4 12 3-6h6" stroke={BRAND_GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconAfrica({ size = 32, color = BRAND_GREEN }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M28 8c-6 2-10 6-12 12-1 4-1 8 2 11-2 3-1 7 2 9 4 2 8 0 10-3 3-1 6-4 8-8 2-6 0-12-4-16-2-3-4-5-6-5z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M22 14c-1 3-1 6 1 9M26 10v4M30 16c2 2 3 5 2 8"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export const BRAND_PILLARS = [
  { id: 'digital', label: 'Santé digitale', Icon: IconDigitalHealth },
  { id: 'access', label: 'Accessible pour tous', Icon: IconAccessible },
  { id: 'secure', label: 'Sécurisée', Icon: IconSecure },
  { id: 'reliable', label: 'Fiable', Icon: IconReliable },
  { id: 'africa', label: "Pour l'Afrique", Icon: IconAfrica },
];
