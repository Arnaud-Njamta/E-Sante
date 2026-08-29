import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  LayoutDashboard,
  Heart,
  Clock,
  FileText,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  Activity,
  Building2,
  MessageCircle,
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
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[600]});
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
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
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

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[600]};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[600]};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};

    svg { color: ${({ theme }) => theme.colors.primary[500]}; }
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
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[500]};
    border-color: ${({ theme }) => theme.colors.primary[200]};
  }

  svg {
    width: 14px;
    height: 14px;
    transform: ${({ $collapsed }) => $collapsed ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform ${({ theme }) => theme.transitions.fast};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
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

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const LogoutBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.danger[50]};
    color: ${({ theme }) => theme.colors.danger[500]};
  }

  svg { width: 18px; height: 18px; }
`;

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', section: 'principal' },
  { to: '/medications', icon: Heart, label: 'Médicaments', section: 'principal' },
  { to: '/prises', icon: Clock, label: 'Prises du jour', section: 'principal' },
  { to: '/sante', icon: Building2, label: 'Annuaire Santé', section: 'sante' },
  { to: '/pharmacie/chat', icon: MessageCircle, label: 'Pharmacie en ligne', section: 'sante' },
  { to: '/ordonnances', icon: FileText, label: 'Ordonnances', section: 'outils' },
  { to: '/analytics', icon: BarChart3, label: 'Statistiques', section: 'outils' },
  { to: '/profil', icon: User, label: 'Mon profil', section: 'compte' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
  const { user, logout } = useAuth();

  const sections = {
    principal: 'Principal',
    sante: 'Santé & Pharmacies',
    outils: 'Outils',
    compte: 'Compte',
  };

  const grouped = Object.keys(sections).map((key) => ({
    label: sections[key],
    items: navItems.filter((i) => i.section === key),
  }));

  return (
    <SidebarContainer $collapsed={collapsed} $mobileOpen={mobileOpen}>
      <CollapseButton onClick={onToggle} $collapsed={collapsed}>
        <ChevronLeft />
      </CollapseButton>

      <LogoSection>
        <LogoIcon><Activity /></LogoIcon>
        {!collapsed && (
          <LogoText>
            <h1>E-Santé</h1>
            <span>Suivi médicamenteux</span>
          </LogoText>
        )}
      </LogoSection>

      <NavSection>
        {grouped.map((group) => (
          <React.Fragment key={group.label}>
            <SectionLabel $collapsed={collapsed}>{group.label}</SectionLabel>
            {group.items.map((item) => (
              <NavItem key={item.to} to={item.to} title={collapsed ? item.label : undefined}>
                <item.icon />
                {!collapsed && item.label}
              </NavItem>
            ))}
          </React.Fragment>
        ))}
      </NavSection>

      <ProfileSection>
        <Avatar>{getInitials(user?.nom || user?.prenom || 'U')}</Avatar>
        {!collapsed && (
          <>
            <ProfileInfo>
              <p>{user?.prenom} {user?.nom}</p>
              <span>{user?.email || 'Patient'}</span>
            </ProfileInfo>
            <LogoutBtn onClick={logout} title="Déconnexion" aria-label="Déconnexion">
              <LogOut />
            </LogoutBtn>
          </>
        )}
      </ProfileSection>
    </SidebarContainer>
  );
}
