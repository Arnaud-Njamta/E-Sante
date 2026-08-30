import {
  LayoutDashboard, Clock, Building2, MessageCircle, User,
} from 'lucide-react';

/** Navigation bas de page — version mobile patient uniquement */
export const PATIENT_MOBILE_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/prises', icon: Clock, label: 'Prises' },
  { to: '/sante', icon: Building2, label: 'Santé' },
  { to: '/pharmacie/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profil', icon: User, label: 'Profil' },
];
