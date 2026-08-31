export const ROLES = {
  PATIENT: 'patient',
  MEDECIN: 'medecin',
  PHARMACIE: 'pharmacie',
  HOPITAL: 'hopital',
  CLINIQUE: 'clinique',
  ADMIN: 'admin',
};

/** Marque principale — DjamSanté */
export const BRAND = {
  name: 'DjamSanté',
  namePlain: 'DjamSante',
  domain: 'djamsante.cm',
  tagline: 'Paix et santé pour l\'Afrique',
  subtitle: 'Santé numérique africaine',
  pitch: 'Conçu au Cameroun, pour l\'Afrique',
  aiName: 'Dr. DjamSanté',
};

export const BRANDING = {
  patient: {
    appName: 'DjamSanté',
    tagline: BRAND.tagline,
    subtitle: BRAND.subtitle,
    loginTitle: 'Bon retour !',
    loginSubtitle: 'Connectez-vous pour gérer vos traitements.',
    defaultRoute: '/dashboard',
    primary: {
      50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
      400: '#34D399', 500: '#007A5E', 600: '#005C47', 700: '#004D3B',
      800: '#003D2F', 900: '#002E23',
    },
    gradient: ['#007A5E', '#005C47', '#1a2e1a'],
    icon: 'activity',
  },
  medecin: {
    appName: 'DjamSanté Pro',
    tagline: 'Espace praticien',
    subtitle: 'Gérez votre profil et vos avis patients',
    loginTitle: 'Espace Médecin',
    loginSubtitle: 'Accédez à votre tableau de bord professionnel.',
    defaultRoute: '/medecin/dashboard',
    primary: {
      50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
      400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857',
      800: '#065F46', 900: '#064E3B',
    },
    gradient: ['#10B981', '#059669', '#064E3B'],
    icon: 'stethoscope',
  },
  pharmacie: {
    appName: 'DjamSanté Pharma',
    tagline: 'Espace officine',
    subtitle: 'Répondez aux patients en temps réel',
    loginTitle: 'Espace Pharmacie',
    loginSubtitle: 'Gérez vos conversations et horaires.',
    defaultRoute: '/pharmacie/dashboard',
    primary: {
      50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD',
      400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9',
      800: '#5B21B6', 900: '#4C1D95',
    },
    gradient: ['#8B5CF6', '#7C3AED', '#4C1D95'],
    icon: 'pill',
  },
  hopital: {
    appName: 'DjamSanté Hôpital',
    tagline: 'Espace hospitalier',
    subtitle: 'Gérez votre équipe, services et rendez-vous — aligné MINSANTE',
    loginTitle: 'Espace Hôpital',
    loginSubtitle: 'Rejoignez la santé numérique camerounaise : CSU, téléconsultation, DPI.',
    defaultRoute: '/hopital/dashboard',
    primary: {
      50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
      400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
      800: '#9A3412', 900: '#7C2D12',
    },
    gradient: ['#F97316', '#EA580C', '#7C2D12'],
    icon: 'hospital',
  },
  clinique: {
    appName: 'DjamSanté Clinique',
    tagline: 'Espace clinique',
    subtitle: 'Inscrivez vos médecins, publiez vos tarifs FCFA, suivez les RDV',
    loginTitle: 'Espace Clinique',
    loginSubtitle: 'Visibilité nationale pour votre clinique à Yaoundé, Douala et au-delà.',
    defaultRoute: '/clinique/dashboard',
    primary: {
      50: '#FDF2F8', 100: '#FCE7F3', 200: '#FBCFE8', 300: '#F9A8D4',
      400: '#F472B6', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D',
      800: '#9D174D', 900: '#831843',
    },
    gradient: ['#EC4899', '#DB2777', '#831843'],
    icon: 'building',
  },
  admin: {
    appName: 'DjamSanté Admin',
    tagline: 'Validation MINSANTE',
    subtitle: 'Gestion des inscriptions professionnelles et conformité CSU',
    loginTitle: 'Espace Administrateur',
    loginSubtitle: 'Validez les dossiers professionnels et supervisez la plateforme.',
    defaultRoute: '/admin/dashboard',
    primary: {
      50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4',
      400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E',
      800: '#115E59', 900: '#134E4A',
    },
    gradient: ['#14B8A6', '#0D9488', '#134E4A'],
    icon: 'shield',
  },
};

export function getBranding(role) {
  return BRANDING[role] || BRANDING.patient;
}

export function getHomeRoute(role) {
  return getBranding(role).defaultRoute;
}

export function getDisplayName(user, role) {
  if (!user) return '';
  if (['pharmacie', 'hopital', 'clinique'].includes(role)) return user.nom;
  if (role === 'admin') return user.nom || 'Administrateur';
  if (role === 'medecin') return `Dr. ${user.prenom} ${user.nom}`;
  return `${user.prenom} ${user.nom}`;
}
