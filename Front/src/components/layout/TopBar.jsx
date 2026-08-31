import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTodayFormatted, getGreeting } from '../../utils/helpers';
import { getDisplayName } from '../../config/branding';
import { ROLES } from '../../config/branding';
import { getPatientMobileTitle } from '../../config/patientMobileNav';
import { Menu, Search, X } from 'lucide-react';
import NotificationBell from './NotificationBell';
import UserAvatar from '../ui/UserAvatar';

const TopBarContainer = styled.header`
  height: ${({ $patientMobile }) => ($patientMobile ? 'auto' : '68px')};
  min-height: 68px;
  border-bottom: 1px solid ${({ theme, $patientMobile }) => (
    $patientMobile ? 'transparent' : theme.colors.border
  )};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.topbar};
  backdrop-filter: blur(16px);
  background: ${({ $patientMobile }) => (
    $patientMobile
      ? 'linear-gradient(180deg, rgba(236, 253, 245, 0.95) 0%, rgba(245, 242, 237, 0.92) 100%)'
      : 'rgba(245, 242, 237, 0.92)'
  )};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0;
  }
`;

const TopRow = styled.div`
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  min-width: 0;
  flex: 1;
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

const MobileTitleBlock = styled.div`
  display: none;
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }

  h1 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    margin: 2px 0 0;
    font-size: 0.72rem;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
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

const MobileSearchRow = styled.div`
  display: none;
  padding: 0 ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[3]};
  animation: fadeIn 0.2s ease both;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
  }
`;

const MobileSearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 10px 14px;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  svg { width: 18px; height: 18px; color: ${({ theme }) => theme.colors.textMuted}; flex-shrink: 0; }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  }
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

const MobileSearchBtn = styled(IconButton)`
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
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
  const location = useLocation();
  const { user, role } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const greeting = getGreeting();
  const today = getTodayFormatted();
  const name = getDisplayName(user, role)?.split(' ').slice(-1)[0] || 'Utilisateur';

  const mobileTitle = patientMobile
    ? getPatientMobileTitle(location.pathname, user, today)
    : null;

  const searchPlaceholder = {
    patient: 'Rechercher un médicament…',
    medecin: 'Rechercher un patient…',
    pharmacie: 'Rechercher un produit…',
    hopital: 'Rechercher un produit…',
    clinique: 'Rechercher un produit…',
    admin: 'Rechercher…',
  }[role] || 'Rechercher…';

  const runSearch = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const cfg = SEARCH_ROUTES[role] || SEARCH_ROUTES[ROLES.PATIENT];
    if (cfg.tab) {
      navigate(`${cfg.path}?tab=${cfg.tab}&q=${encodeURIComponent(trimmed)}`);
    } else if (role === ROLES.PATIENT) {
      navigate(`/sante?tab=medicaments&q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`${cfg.path}?q=${encodeURIComponent(trimmed)}`);
    }
    setQuery('');
    setMobileSearchOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const showSearch = role !== ROLES.ADMIN;

  return (
    <TopBarContainer $patientMobile={patientMobile}>
      <TopRow>
        <LeftSection>
          {!patientMobile && (
            <MenuButton onClick={onMenuToggle} aria-label="Menu"><Menu /></MenuButton>
          )}
          {patientMobile ? (
            <MobileTitleBlock>
              <h1>{mobileTitle?.title}</h1>
              {mobileTitle?.subtitle && <p>{mobileTitle.subtitle}</p>}
            </MobileTitleBlock>
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
          {showSearch && patientMobile && (
            <MobileSearchBtn
              type="button"
              onClick={() => setMobileSearchOpen((o) => !o)}
              aria-label={mobileSearchOpen ? 'Fermer la recherche' : 'Rechercher'}
              aria-expanded={mobileSearchOpen}
            >
              {mobileSearchOpen ? <X /> : <Search />}
            </MobileSearchBtn>
          )}
          <NotificationBell button={IconButton} />
          {patientMobile && (
            <UserAvatar
              user={user}
              role={role}
              size={38}
              borderless
              onClick={() => navigate('/profil')}
            />
          )}
        </RightSection>
      </TopRow>

      {patientMobile && showSearch && (
        <MobileSearchRow $open={mobileSearchOpen}>
          <MobileSearchForm onSubmit={handleSearch}>
            <Search size={18} />
            <input
              placeholder={searchPlaceholder}
              aria-label="Rechercher"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={mobileSearchOpen}
            />
          </MobileSearchForm>
        </MobileSearchRow>
      )}
    </TopBarContainer>
  );
}
