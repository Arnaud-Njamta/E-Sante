/**
 * Mode patient simplifié (Cameroun) — annuaire, pharmacie, contact.
 * Les routes pro (pharmacie, médecin, hôpital, admin) ne sont pas affectées.
 */
export const PATIENT_SIMPLIFIED_MODE = true;

/** Navigation bas d'écran : 3 onglets */
export const PATIENT_SIMPLIFIED_MOBILE_NAV = [
  {
    to: '/dashboard',
    iconName: 'home',
    labelKey: 'patientHome.nav_home',
    match: (p) => p === '/dashboard',
  },
  {
    to: '/pharmacie-hub',
    iconName: 'pharmacy',
    labelKey: 'patientHome.nav_pharmacy',
    center: true,
    match: (p) => p === '/pharmacie-hub' || p.startsWith('/reservations') || p.startsWith('/pharmacie/chat'),
  },
  {
    to: '/profil',
    iconName: 'profile',
    labelKey: 'patientHome.nav_me',
    match: (p) => p === '/profil',
  },
];

/** Sidebar desktop patient (réduite) */
export const PATIENT_SIMPLIFIED_SIDEBAR_KEYS = [
  { to: '/dashboard', labelKey: 'patientHome.nav_home', section: 'principal' },
  { to: '/pharmacie-hub', labelKey: 'patientHome.nav_pharmacy', section: 'principal' },
  { to: '/sante', labelKey: 'nav.health_directory', section: 'principal' },
  { to: '/rendez-vous', labelKey: 'nav.my_appointments', section: 'sante' },
  { to: '/reservations', labelKey: 'nav.my_reservations', section: 'sante' },
  { to: '/profil', labelKey: 'nav.profil', section: 'compte' },
];
