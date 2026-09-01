import {
  LayoutDashboard, Clock, Building2, MessageCircle, LayoutGrid,
  Heart, Calendar, Package, Wallet, FileText, ScanLine,
  BarChart3, Newspaper, User, Stethoscope, BookHeart,
} from 'lucide-react';

/** Barre de navigation bas — mobile patient */
export const PATIENT_MOBILE_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil', match: (p) => p === '/dashboard' },
  { to: '/prises', icon: Clock, label: 'Prises', match: (p) => p === '/prises' },
  {
    to: '/sante',
    icon: Building2,
    label: 'Santé',
    center: true,
    match: (p) => p === '/sante' || p.startsWith('/sante/'),
  },
  {
    to: '/pharmacie/chat',
    icon: MessageCircle,
    label: 'Chat',
    match: (p) => p.startsWith('/pharmacie/chat'),
  },
];

/** Menu « Plus » — routes secondaires */
export const PATIENT_MORE_SECTIONS = [
  {
    title: 'Soins & suivi',
    items: [
      { to: '/medications', icon: Heart, label: 'Médicaments', desc: 'Votre traitement' },
      { to: '/rendez-vous', icon: Calendar, label: 'Rendez-vous', desc: 'Consultations & téléconsult.' },
      { to: '/carnet-medical', icon: BookHeart, label: 'Carnet médical', desc: 'Allergies & antécédents' },
      { to: '/reservations', icon: Package, label: 'Réservations', desc: 'Pharmacies & dispensaires' },
      { to: '/ordonnances', icon: ScanLine, label: 'Scanner ordonnance', desc: 'Ajout rapide' },
      { to: '/ordonnances-electroniques', icon: FileText, label: 'Ordonnances élec.', desc: 'Documents signés' },
    ],
  },
  {
    title: 'Outils',
    items: [
      { to: '/paiements', icon: Wallet, label: 'Paiements', desc: 'Historique & reçus' },
      { to: '/analytics', icon: BarChart3, label: 'Statistiques', desc: 'Observance détaillée' },
      { to: '/actualites', icon: Newspaper, label: 'Actualités', desc: 'Santé publique' },
      { to: '/sante?tab=medecins', icon: Stethoscope, label: 'Trouver un médecin', desc: 'Annuaire praticiens' },
    ],
  },
  {
    title: 'Compte',
    items: [
      { to: '/profil', icon: User, label: 'Mon profil', desc: 'Infos & notifications' },
    ],
  },
];

/** Titres contextuels pour la TopBar mobile */
export const PATIENT_ROUTE_TITLES = [
  { path: '/dashboard', title: null },
  { path: '/prises', title: 'Prises du jour', subtitle: 'Confirmez vos médicaments' },
  { path: '/medications', title: 'Médicaments', subtitle: 'Votre traitement en cours' },
  { path: '/ordonnances', title: 'Ordonnances', subtitle: 'Scan & import' },
  { path: '/ordonnances-electroniques', title: 'Ordonnances électroniques', subtitle: 'Documents signés' },
  { path: '/analytics', title: 'Statistiques', subtitle: 'Observance & tendances' },
  { path: '/sante', title: 'Annuaire santé', subtitle: 'Médecins, établissements, médicaments' },
  { path: '/sante/etablissement', title: 'Établissement', subtitle: 'Fiche détaillée' },
  { path: '/sante/medecin', title: 'Médecin', subtitle: 'Profil & prise de RDV' },
  { path: '/rendez-vous', title: 'Mes rendez-vous', subtitle: 'Consultations & téléconsult.' },
  { path: '/carnet-medical', title: 'Carnet médical', subtitle: 'Allergies, antécédents & vaccinations' },
  { path: '/reservations', title: 'Mes réservations', subtitle: 'Pharmacies & dispensaires' },
  { path: '/paiements', title: 'Mes paiements', subtitle: 'Historique & reçus' },
  { path: '/pharmacie/chat', title: 'Pharmacie en ligne', subtitle: 'Disponibilité & horaires' },
  { path: '/profil', title: 'Mon profil', subtitle: 'Informations & préférences' },
  { path: '/actualites', title: 'Actualités', subtitle: 'Santé publique' },
];

export function getPatientMobileTitle(pathname, user, todayFormatted) {
  if (pathname === '/dashboard') {
    return {
      title: `Bonjour, ${user?.prenom || 'Patient'}`,
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
    return { title: match.title, subtitle: match.subtitle };
  }

  return { title: 'DjamSanté', subtitle: 'Paix et santé pour l\'Afrique' };
}

export function isPatientNavActive(pathname, item) {
  if (item.match) return item.match(pathname);
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
