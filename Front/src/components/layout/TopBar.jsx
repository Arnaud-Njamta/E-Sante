import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTodayFormatted, getGreeting } from '../../utils/helpers';
import { getBranding, getDisplayName } from '../../config/branding';
import { ROLES } from '../../config/branding';
import { Menu, Search } from 'lucide-react';
import NotificationBell from './NotificationBell';

const TopBarContainer = styled.header`
  height: 68px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.topbar};
  backdrop-filter: blur(12px);
  background: rgba(245, 242, 237, 0.92);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const MenuButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  &:hover { background: ${({ theme }) => theme.colors.neutral[100]}; }
  svg { width: 20px; height: 20px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: flex; }
`;

const GreetingBlock = styled.div`
  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  p {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
    text-transform: capitalize;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { p { display: none; } }
`;

const MobileBrand = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    h1 {
      margin: 0;
      font-family: ${({ theme }) => theme.typography.fontFamilySerif};
      font-size: 1.35rem;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: ${({ theme }) => theme.colors.text};
      line-height: 1.1;
    }
    p {
      margin: 2px 0 0;
      font-size: 0.72rem;
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.neutral[50]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 8px 16px;
  min-width: 220px;
  transition: all ${({ theme }) => theme.transitions.fast};
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.focus};
    background: ${({ theme }) => theme.colors.surface};
  }
  svg { width: 16px; height: 16px; color: ${({ theme }) => theme.colors.textMuted}; flex-shrink: 0; }
  input {
    border: none; outline: none; background: transparent;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.text}; width: 100%;
    &::placeholder { color: ${({ theme }) => theme.colors.textMuted }; }
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

const IconButton = styled.button`
  width: 40px; height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary };
  position: relative; transition: all ${({ theme }) => theme.transitions.fast};
  border: none; background: transparent; cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.neutral[100]}; color: ${({ theme }) => theme.colors.text}; }
  svg { width: 20px; height: 20px; }
  .notif-dot {
    position: absolute; top: 8px; right: 8px; width: 8px; height: 8px;
    border-radius: 50%; background: ${({ theme }) => theme.colors.danger[500]};
    border: 2px solid ${({ theme }) => theme.colors.surface};
  }
`;

const SEARCH_ROUTES = {
  [ROLES.PATIENT]: { path: '/sante', tab: 'medicaments' },
  [ROLES.MEDECIN]: { path: '/sante', tab: 'medecins' },
  [ROLES.PHARMACIE]: { path: '/pharmacie/produits', tab: null },
  [ROLES.HOPITAL]: { path: '/hopital/dispensaire', tab: null },
  [ROLES.CLINIQUE]: { path: '/clinique/dispensaire', tab: null },
};

export default function TopBar({ onMenuToggle, patientMobile = false }) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const branding = getBranding(role);
  const [query, setQuery] = useState('');
  const greeting = getGreeting();
  const today = getTodayFormatted();
  const name = getDisplayName(user, role)?.split(' ').slice(-1)[0] || 'Utilisateur';

  const searchPlaceholder = {
    patient: 'Rechercher un médicament…',
    medecin: 'Rechercher un patient…',
    pharmacie: 'Rechercher un produit…',
    hopital: 'Rechercher un produit…',
    clinique: 'Rechercher un produit…',
    admin: 'Rechercher…',
  }[role] || 'Rechercher…';

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const cfg = SEARCH_ROUTES[role] || SEARCH_ROUTES[ROLES.PATIENT];
    if (cfg.tab) {
      navigate(`${cfg.path}?tab=${cfg.tab}&q=${encodeURIComponent(q)}`);
    } else if (role === ROLES.PATIENT) {
      navigate(`/sante?tab=medicaments&q=${encodeURIComponent(q)}`);
    } else {
      navigate(`${cfg.path}?q=${encodeURIComponent(q)}`);
    }
    setQuery('');
  };

  const showSearch = role !== ROLES.ADMIN;

  return (
    <TopBarContainer>
      <LeftSection>
        {!patientMobile && (
          <MenuButton onClick={onMenuToggle} aria-label="Menu"><Menu /></MenuButton>
        )}
        {patientMobile ? (
          <MobileBrand>
            <h1>{branding.appName}</h1>
            <p>{branding.tagline}</p>
          </MobileBrand>
        ) : (
          <GreetingBlock>
            <h2>{greeting}, {name}</h2>
            <p>{today}</p>
          </GreetingBlock>
        )}
      </LeftSection>
      <RightSection>
        {showSearch && !patientMobile && (
          <SearchForm onSubmit={handleSearch}>
            <Search size={16} />
            <input
              placeholder={searchPlaceholder}
              aria-label="Rechercher"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchForm>
        )}
        <NotificationBell button={IconButton} />
      </RightSection>
    </TopBarContainer>
  );
}
