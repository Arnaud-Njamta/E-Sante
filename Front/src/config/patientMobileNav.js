import {
  LayoutDashboard, Clock, Building2, MessageCircle,
  Heart, Calendar, Package, Wallet, FileText, ScanLine,
  BarChart3, Newspaper, User, Stethoscope, BookHeart, Siren, Users, QrCode,
} from 'lucide-react';

/** Barre de navigation bas — mobile patient */
export const PATIENT_MOBILE_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.home', match: (p) => p === '/dashboard' },
  { to: '/prises', icon: Clock, labelKey: 'nav.prises', match: (p) => p === '/prises' },
  {
    to: '/sante',
    icon: Building2,
    labelKey: 'nav.health_directory',
    center: true,
    match: (p) => p === '/sante' || p.startsWith('/sante/'),
  },
  {
    to: '/pharmacie/chat',
    icon: MessageCircle,
    labelKey: 'nav.chat',
    match: (p) => p.startsWith('/pharmacie/chat'),
  },
];

/** Menu « Plus » — routes secondaires */
export const PATIENT_MORE_SECTIONS = [
  {
    titleKey: 'nav.more_sections.care',
    items: [
      { to: '/medications', icon: Heart, labelKey: 'nav.medications', descKey: 'nav.desc.medications' },
      { to: '/rendez-vous', icon: Calendar, labelKey: 'nav.my_appointments', descKey: 'nav.desc.appointments' },
      { to: '/carnet-medical', icon: BookHeart, labelKey: 'nav.carnet', descKey: 'nav.desc.carnet' },
      { to: '/famille', icon: Users, labelKey: 'nav.famille', descKey: 'nav.desc.famille' },
      { to: '/qr-medical', icon: QrCode, labelKey: 'nav.qr', descKey: 'nav.desc.qr' },
      { to: '/urgence', icon: Siren, labelKey: 'nav.urgence', descKey: 'nav.desc.urgence' },
      { to: '/reservations', icon: Package, labelKey: 'nav.my_reservations', descKey: 'nav.desc.reservations' },
      { to: '/ordonnances', icon: ScanLine, labelKey: 'nav.prescriptions', descKey: 'nav.desc.scan_prescription' },
      { to: '/ordonnances-electroniques', icon: FileText, labelKey: 'nav.e_prescriptions', descKey: 'nav.desc.e_prescriptions' },
    ],
  },
  {
    titleKey: 'nav.more_sections.tools',
    items: [
      { to: '/paiements', icon: Wallet, labelKey: 'nav.my_payments', descKey: 'nav.desc.payments' },
      { to: '/analytics', icon: BarChart3, labelKey: 'nav.statistics', descKey: 'nav.desc.statistics' },
      { to: '/actualites', icon: Newspaper, labelKey: 'nav.actualites', descKey: 'nav.desc.news' },
      { to: '/sante?tab=medecins', icon: Stethoscope, labelKey: 'nav.find_doctor', descKey: 'nav.desc.find_doctor' },
    ],
  },
  {
    titleKey: 'nav.more_sections.account',
    items: [
      { to: '/profil', icon: User, labelKey: 'nav.profil', descKey: 'nav.desc.profile' },
    ],
  },
];

/** Titres contextuels pour la TopBar mobile */
export const PATIENT_ROUTE_TITLES = [
  { path: '/dashboard', titleKey: null },
  { path: '/prises', titleKey: 'nav.routes.prises', subtitleKey: 'nav.routes.prises_sub' },
  { path: '/medications', titleKey: 'nav.routes.medications', subtitleKey: 'nav.routes.medications_sub' },
  { path: '/ordonnances', titleKey: 'nav.routes.prescriptions', subtitleKey: 'nav.routes.prescriptions_sub' },
  { path: '/ordonnances-electroniques', titleKey: 'nav.routes.e_prescriptions', subtitleKey: 'nav.routes.e_prescriptions_sub' },
  { path: '/analytics', titleKey: 'nav.routes.statistics', subtitleKey: 'nav.routes.statistics_sub' },
  { path: '/sante', titleKey: 'nav.routes.health_directory', subtitleKey: 'nav.routes.health_directory_sub' },
  { path: '/sante/etablissement', titleKey: 'nav.routes.establishment', subtitleKey: 'nav.routes.establishment_sub' },
  { path: '/sante/medecin', titleKey: 'nav.routes.doctor', subtitleKey: 'nav.routes.doctor_sub' },
  { path: '/rendez-vous', titleKey: 'nav.routes.my_appointments', subtitleKey: 'nav.routes.my_appointments_sub' },
  { path: '/carnet-medical', titleKey: 'nav.carnet', subtitleKey: 'nav.routes.carnet_sub' },
  { path: '/famille', titleKey: 'nav.famille', subtitleKey: 'nav.routes.famille_sub' },
  { path: '/qr-medical', titleKey: 'nav.qr', subtitleKey: 'nav.routes.qr_sub' },
  { path: '/urgence', titleKey: 'nav.urgence', subtitleKey: 'nav.routes.urgence_sub' },
  { path: '/reservations', titleKey: 'nav.routes.my_reservations', subtitleKey: 'nav.routes.my_reservations_sub' },
  { path: '/paiements', titleKey: 'nav.routes.my_payments', subtitleKey: 'nav.routes.my_payments_sub' },
  { path: '/pharmacie/chat', titleKey: 'nav.routes.online_pharmacy', subtitleKey: 'nav.routes.online_pharmacy_sub' },
  { path: '/profil', titleKey: 'nav.profil', subtitleKey: 'nav.routes.profile_sub' },
  { path: '/actualites', titleKey: 'nav.actualites', subtitleKey: 'nav.routes.news_sub' },
];

export function getPatientMobileTitle(pathname, user, todayFormatted, t) {
  if (pathname === '/dashboard') {
    return {
      title: t('greeting.hello_name', { name: user?.prenom || t('common.patient') }),
      subtitle: todayFormatted,
    };
  }

  const sorted = [...PATIENT_ROUTE_TITLES]
    .filter((r) => r.path !== '/dashboard')
    .sort((a, b) => b.path.length - a.path.length);

  const match = sorted.find(
    (r) => pathname === r.path || pathname.startsWith(`${r.path}/`),
  );

  if (match) {
    return {
      title: match.titleKey ? t(match.titleKey) : null,
      subtitle: match.subtitleKey ? t(match.subtitleKey) : null,
    };
  }

  return { title: 'DjamSanté', subtitle: t('common.brand_tagline') };
}

export function isPatientNavActive(pathname, item) {
  if (item.match) return item.match(pathname);
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
