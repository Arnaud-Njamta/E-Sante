/**
 * DjamSanté Design Tokens
 * Charte éditoriale (connexion) + système UI intérieur
 */

const editorial = {
  ink: '#1C1917',
  paper: '#F5F2ED',
  muted: '#6B6560',
  line: '#DDD6CE',
  deep: '#0B3D30',
  sans: "'DM Sans', system-ui, -apple-system, sans-serif",
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
};

const tokens = {
  editorial,

  colors: {
    // Primary — Trust Blue
    primary: {
      50:  '#EBF5FF',
      100: '#D1E9FF',
      200: '#A3D3FF',
      300: '#75BDFF',
      400: '#47A7FF',
      500: '#2D7FF9',
      600: '#1A66D9',
      700: '#0F4EB3',
      800: '#0A3A8C',
      900: '#062766',
    },
    // Success — Medication Taken
    success: {
      50:  '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    // Warning — Upcoming Dose
    warning: {
      50:  '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    // Danger — Missed Dose
    danger: {
      50:  '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    // Neutrals
    neutral: {
      0:   '#FFFFFF',
      50:  '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    // Semantic aliases — charte éditoriale DjamSanté
    background: editorial.paper,
    surface: '#FFFFFF',
    surfaceHover: '#F0EBE4',
    border: editorial.line,
    borderFocus: editorial.deep,
    text: editorial.ink,
    textSecondary: editorial.muted,
    textMuted: '#A8A29E',
    textOnPrimary: '#FFFFFF',
    ink: editorial.ink,
    deep: editorial.deep,
    // Overlay
    overlay: 'rgba(28, 25, 23, 0.45)',
  },

  typography: {
    fontFamily: editorial.sans,
    fontFamilySerif: editorial.serif,
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
    sizes: {
      xs:   '0.75rem',    // 12px
      sm:   '0.8125rem',  // 13px
      base: '0.875rem',   // 14px
      md:   '1rem',       // 16px
      lg:   '1.125rem',   // 18px
      xl:   '1.25rem',    // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    0:  '0',
    1:  '0.25rem',   // 4px
    2:  '0.5rem',    // 8px
    3:  '0.75rem',   // 12px
    4:  '1rem',      // 16px
    5:  '1.25rem',   // 20px
    6:  '1.5rem',    // 24px
    8:  '2rem',      // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
  },

  radii: {
    editorial: '2px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '14px',
    '2xl': '18px',
    full: '999px',
  },

  shadows: {
    xs:  '0 1px 2px rgba(28, 25, 23, 0.04)',
    sm:  '0 1px 3px rgba(28, 25, 23, 0.06)',
    md:  '0 4px 12px rgba(28, 25, 23, 0.06)',
    lg:  '0 8px 20px rgba(28, 25, 23, 0.08)',
    xl:  '0 16px 32px rgba(28, 25, 23, 0.1)',
    focus: '0 0 0 3px rgba(11, 61, 48, 0.2)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    sidebar: 100,
    topbar: 110,
    bottomNav: 115,
    modal: 200,
    toast: 300,
    tooltip: 400,
  },
};

export default tokens;
