import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBranding, getDisplayName } from '../../config/branding';
import { getInitials } from '../../utils/helpers';
import BrandLogo from '../brand/BrandLogo';
import UserAvatar from '../ui/UserAvatar';
import {
  LayoutDashboard, Heart, BookHeart, Clock, FileText, BarChart3, User, LogOut,
  ChevronLeft, Building2, MessageCircle, Stethoscope, Star, Pill, Newspaper, Camera, Package, Shield, Wallet, ScrollText, Briefcase, Users,
} from 'lucide-react';

const SidebarContainer = styled.aside`
  width: ${({ $collapsed }) => ($collapsed ? '72px' : '260px')};
  height: 100vh;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transitions.normal};
  position: fixed;
  left: 0;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sidebar};
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    transform: ${({ $mobileOpen }) => ($mobileOpen ? 'translateX(0)' : 'translateX(-100%)')};
    width: 260px;
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const LogoSection = styled.div`
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 68px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  svg { width: 22px; height: 22px; }
`;

const LogoText = styled.div`
  overflow: hidden;
  white-space: nowrap;
  h1 {
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: 500;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  span {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const NavSection = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const SectionLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[1]};
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;

  svg { width: 20px; height: 20px; flex-shrink: 0; }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.ink};
  }

  &.active {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.ink};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    svg { color: ${({ theme }) => theme.colors.deep}; }
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  right: -12px;
  top: 76px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  z-index: 10;
  svg {
    width: 14px;
    height: 14px;
    transform: ${({ $collapsed }) => ($collapsed ? 'rotate(180deg)' : 'rotate(0)')};
    transition: transform ${({ theme }) => theme.transitions.fast};
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

const ProfileSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[400]}, ${({ theme }) => theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  overflow: hidden;
  flex: 1;
  p { margin: 0; font-size: ${({ theme }) => theme.typography.sizes.sm}; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  span { font-size: ${({ theme }) => theme.typography.sizes.xs }; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const LogoutBtn = styled.button`
  width: 32px; height: 32px; border-radius: ${({ theme }) => theme.radii.md};
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { background: ${({ theme }) => theme.colors.danger[50]}; color: ${({ theme }) => theme.colors.danger[500]}; }
  svg { width: 18px; height: 18px; }
`;

const ROLE_NAV = {
  patient: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
    { to: '/medications', icon: Heart, label: 'Médicaments', section: 'principal' },
    { to: '/prises', icon: Clock, label: 'Prises du jour', section: 'principal' },
    { to: '/sante', icon: Building2, label: 'Annuaire Santé', section: 'sante' },
    { to: '/sante?tab=medicaments', icon: Pill, label: 'Trouver un médicament', section: 'sante' },
    { to: '/rendez-vous', icon: Clock, label: 'Mes rendez-vous', section: 'sante' },
    { to: '/reservations', icon: Package, label: 'Mes réservations', section: 'sante' },
    { to: '/paiements', icon: Wallet, label: 'Mes paiements', section: 'sante' },
    { to: '/carnet-medical', icon: BookHeart, label: 'Carnet médical', section: 'sante' },
    { to: '/ordonnances-electroniques', icon: FileText, label: 'Ordonnances élec.', section: 'sante' },
    { to: '/sante?tab=medecins', icon: Stethoscope, label: 'Trouver un médecin', section: 'sante' },
    { to: '/actualites', icon: Newspaper, label: 'Actualités', section: 'sante' },
    { to: '/pharmacie/chat', icon: MessageCircle, label: 'Pharmacie en ligne', section: 'sante' },
    { to: '/ordonnances', icon: FileText, label: 'Ordonnances', section: 'outils' },
    { to: '/analytics', icon: BarChart3, label: 'Statistiques', section: 'outils' },
    { to: '/profil', icon: User, label: 'Mon profil', section: 'compte' },
  ],
  medecin: [
    { to: '/medecin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
    { to: '/medecin/rendez-vous', icon: Clock, label: 'Rendez-vous', section: 'principal' },
    { to: '/medecin/ordonnances', icon: FileText, label: 'Ordonnances élec.', section: 'principal' },
    { to: '/medecin/carriere', icon: Briefcase, label: 'Carrière & affiliations', section: 'principal' },
    { to: '/medecin/actualites', icon: Newspaper, label: 'Actualités', section: 'principal' },
    { to: '/medecin/profil', icon: User, label: 'Mon profil public', section: 'principal' },
    { to: '/medecin/parametres', icon: Camera, label: 'Photo & cachet', section: 'compte' },
    { to: '/medecin/avis', icon: Star, label: 'Mes avis', section: 'compte' },
  ],
  pharmacie: [
    { to: '/pharmacie/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
    { to: '/pharmacie/messages', icon: MessageCircle, label: 'Messages patients', section: 'principal' },
    { to: '/pharmacie/produits', icon: Pill, label: 'Catalogue produits', section: 'principal' },
    { to: '/pharmacie/reservations', icon: Package, label: 'Réservations', section: 'principal' },
    { to: '/pharmacie/ordonnances', icon: FileText, label: 'Vérifier ordonnance', section: 'principal' },
    { to: '/pharmacie/actualites', icon: Newspaper, label: 'Actualités', section: 'principal' },
    { to: '/pharmacie/equipe', icon: Users, label: 'Équipe', section: 'principal' },
    { to: '/pharmacie/profil', icon: Camera, label: 'Photo & profil', section: 'compte' },
    { to: '/pharmacie/horaires', icon: Clock, label: 'Horaires', section: 'principal' },
    { to: '/pharmacie/localisation', icon: Building2, label: 'Localisation', section: 'compte' },
  ],
  hopital: [
    { to: '/hopital/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
    { to: '/hopital/medecins', icon: Stethoscope, label: 'Médecins affiliés', section: 'principal' },
    { to: '/hopital/equipe', icon: Users, label: 'Équipe', section: 'principal' },
    { to: '/hopital/services', icon: Heart, label: 'Services & tarifs', section: 'principal' },
    { to: '/hopital/rendez-vous', icon: Clock, label: 'Rendez-vous', section: 'principal' },
    { to: '/hopital/dispensaire', icon: Pill, label: 'Dispensaire', section: 'principal' },
    { to: '/hopital/reservations', icon: Package, label: 'Réservations', section: 'principal' },
    { to: '/hopital/ordonnances', icon: FileText, label: 'Vérifier ordonnance', section: 'principal' },
    { to: '/hopital/messages', icon: MessageCircle, label: 'Messages patients', section: 'principal' },
    { to: '/hopital/actualites', icon: Newspaper, label: 'Actualités', section: 'principal' },
    { to: '/hopital/profil', icon: Camera, label: 'Photo & profil', section: 'principal' },
    { to: '/hopital/horaires', icon: Clock, label: 'Horaires', section: 'compte' },
    { to: '/hopital/localisation', icon: Building2, label: 'Localisation', section: 'compte' },
  ],
  clinique: [
    { to: '/clinique/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
    { to: '/clinique/medecins', icon: Stethoscope, label: 'Médecins affiliés', section: 'principal' },
    { to: '/clinique/equipe', icon: Users, label: 'Équipe', section: 'principal' },
    { to: '/clinique/services', icon: Heart, label: 'Services & tarifs', section: 'principal' },
    { to: '/clinique/rendez-vous', icon: Clock, label: 'Rendez-vous', section: 'principal' },
    { to: '/clinique/dispensaire', icon: Pill, label: 'Dispensaire', section: 'principal' },
    { to: '/clinique/reservations', icon: Package, label: 'Réservations', section: 'principal' },
    { to: '/clinique/ordonnances', icon: FileText, label: 'Vérifier ordonnance', section: 'principal' },
    { to: '/clinique/messages', icon: MessageCircle, label: 'Messages patients', section: 'principal' },
    { to: '/clinique/actualites', icon: Newspaper, label: 'Actualités', section: 'principal' },
    { to: '/clinique/profil', icon: Camera, label: 'Photo & profil', section: 'principal' },
    { to: '/clinique/horaires', icon: Clock, label: 'Horaires', section: 'compte' },
    { to: '/clinique/localisation', icon: Building2, label: 'Localisation', section: 'compte' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
    { to: '/admin/inscriptions', icon: Shield, label: 'Validations MINSANTE', section: 'principal' },
    { to: '/admin/audit', icon: ScrollText, label: 'Journal de contrôle', section: 'principal' },
    { to: '/admin/commissions', icon: BarChart3, label: 'Finances & commissions', section: 'principal' },
  ],
};

const SECTION_LABELS = {
  principal: 'Principal',
  sante: 'Santé',
  outils: 'Outils',
  compte: 'Compte',
};

const ROLE_ICONS = {
  patient: Heart,
  medecin: Stethoscope,
  pharmacie: Pill,
  hopital: Building2,
  clinique: Building2,
  admin: Shield,
};

export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
  const { user, role, logout } = useAuth();
  const branding = getBranding(role);
  const navItems = ROLE_NAV[role] || ROLE_NAV.patient;
  const RoleIcon = ROLE_ICONS[role] || Heart;

  const sections = [...new Set(navItems.map((i) => i.section))];

  const displayName = getDisplayName(user, role);
  const initials = ['pharmacie', 'hopital', 'clinique'].includes(role)
    ? (user?.nom?.[0] || 'P')
    : getInitials(user?.nom || user?.prenom || 'U');

  return (
    <SidebarContainer $collapsed={collapsed} $mobileOpen={mobileOpen}>
      <CollapseButton onClick={onToggle} $collapsed={collapsed}><ChevronLeft /></CollapseButton>

      <LogoSection>
        {collapsed ? (
          <BrandLogo variant="emblem" emblemSize={40} />
        ) : (
          <BrandLogo variant="compact" tagline={branding.tagline} emblemSize={40} />
        )}
      </LogoSection>

      <NavSection>
        {sections.map((sectionKey) => (
          <React.Fragment key={sectionKey}>
            <SectionLabel $collapsed={collapsed}>{SECTION_LABELS[sectionKey]}</SectionLabel>
            {navItems.filter((i) => i.section === sectionKey).map((item) => (
              <NavItem key={item.to} to={item.to} title={collapsed ? item.label : undefined}>
                <item.icon />
                {!collapsed && item.label}
              </NavItem>
            ))}
          </React.Fragment>
        ))}
      </NavSection>

      <ProfileSection>
        <UserAvatar user={user} role={role} size={36} round />
        {!collapsed && (
          <>
            <ProfileInfo>
              <p>{displayName}</p>
              <span>{branding.tagline}</span>
            </ProfileInfo>
            <LogoutBtn onClick={logout} title="Déconnexion"><LogOut /></LogoutBtn>
          </>
        )}
      </ProfileSection>
    </SidebarContainer>
  );
}
