/** Précharge les chunks de pages au survol / focus des liens de navigation. */
const prefetchers = {
  '/dashboard': () => import('../pages/DashboardPage'),
  '/medications': () => import('../pages/MedicationsPage'),
  '/prises': () => import('../pages/PrisesPage'),
  '/ordonnances': () => import('../pages/OrdonnancePage'),
  '/analytics': () => import('../pages/AnalyticsPage'),
  '/sante': () => import('../pages/SantePage'),
  '/rendez-vous': () => import('../pages/PatientRendezVousPage'),
  '/reservations': () => import('../pages/PatientReservationsPage'),
  '/paiements': () => import('../pages/PatientPaiementsPage'),
  '/carnet-medical': () => import('../pages/CarnetMedicalPage'),
  '/famille': () => import('../pages/FamillePage'),
  '/qr-medical': () => import('../pages/QrMedicalPage'),
  '/urgence': () => import('../pages/UrgencePage'),
  '/ordonnances-electroniques': () => import('../pages/PatientOrdonnancesElecPage'),
  '/pharmacie/chat': () => import('../pages/PharmacieChatPage'),
  '/profil': () => import('../pages/ProfilePage'),
  '/actualites': () => import('../pages/ActualitesPage'),
  '/medecin/dashboard': () => import('../pages/MedecinDashboardPage'),
  '/pharmacie/dashboard': () => import('../pages/PharmacieDashboardPage'),
  '/hopital/dashboard': () => import('../pages/StructureDashboardPage'),
  '/clinique/dashboard': () => import('../pages/StructureDashboardPage'),
  '/admin/dashboard': () => import('../pages/AdminDashboardPage'),
};

const loaded = new Set();

export function prefetchRoute(path) {
  const base = path?.split('?')[0];
  if (!base || loaded.has(base)) return;
  const loader = prefetchers[base];
  if (!loader) return;
  loaded.add(base);
  loader().catch(() => loaded.delete(base));
}

export function prefetchPatientCore() {
  ['/dashboard', '/prises', '/sante', '/medications', '/profil'].forEach(prefetchRoute);
}

export const navPrefetchHandlers = {
  onMouseEnter: (e) => prefetchRoute(e.currentTarget.getAttribute('href') || e.currentTarget.pathname),
  onFocus: (e) => prefetchRoute(e.currentTarget.getAttribute('href') || e.currentTarget.pathname),
  onTouchStart: (e) => prefetchRoute(e.currentTarget.getAttribute('href') || e.currentTarget.pathname),
};
