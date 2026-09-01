import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATIENT_MOBILE_NAV, PATIENT_MORE_SECTIONS, isPatientNavActive } from '../../config/patientMobileNav';
import { prefetchRoute } from '../../utils/routePrefetch';
import PatientMoreSheet from '../patient/PatientMoreSheet';
import { LayoutGrid } from 'lucide-react';

const BOTTOM_NAV_HEIGHT = 72;

const Nav = styled.nav`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    z-index: ${({ theme }) => theme.zIndex.bottomNav};
    height: ${BOTTOM_NAV_HEIGHT}px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid rgba(221, 214, 206, 0.7);
    border-radius: 22px;
    padding: 6px 8px;
    justify-content: space-around;
    align-items: flex-end;
    gap: 2px;
    box-shadow:
      0 8px 32px rgba(11, 61, 48, 0.1),
      0 2px 8px rgba(28, 25, 23, 0.04);
  }
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.62rem;
  font-weight: 600;
  text-decoration: none;
  position: relative;
  transition: color ${({ theme }) => theme.transitions.fast};

  svg {
    width: 22px;
    height: 22px;
    transition: transform ${({ theme }) => theme.transitions.spring};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary[600]};

    svg { transform: scale(1.05); }

    &::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 28px;
      height: 28px;
      border-radius: 10px;
      background: ${({ theme }) => theme.colors.primary[50]};
      z-index: -1;
    }
  }
`;

const CenterItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding-bottom: 2px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.62rem;
  font-weight: 600;

  &.active { color: ${({ theme }) => theme.colors.primary[600]}; }
`;

const CenterFab = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 18px;
  margin-top: -22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[700]});
  color: white;
  box-shadow:
    0 8px 20px rgba(0, 122, 94, 0.35),
    0 2px 6px rgba(0, 92, 71, 0.2);
  transition: transform ${({ theme }) => theme.transitions.spring},
    box-shadow ${({ theme }) => theme.transitions.fast};

  svg { width: 24px; height: 24px; }
`;

const MoreBtn = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.62rem;
  font-weight: 600;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;

  svg { width: 22px; height: 22px; }

  ${({ $open, theme }) => $open && `
    color: ${theme.colors.primary[600]};
    &::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 28px;
      height: 28px;
      border-radius: 10px;
      background: ${theme.colors.primary[50]};
      z-index: -1;
    }
  `}
`;

export { BOTTOM_NAV_HEIGHT };

export default function PatientBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = location.pathname;
  const isMoreRoute = PATIENT_MORE_SECTIONS.some((section) =>
    section.items.some((item) => isPatientNavActive(pathname, item)),
  );

  return (
    <>
      <Nav aria-label="Navigation patient">
        {PATIENT_MOBILE_NAV.map((item) => {
          if (item.center) {
            const active = isPatientNavActive(pathname, item);
            return (
              <CenterItem
                key={item.to}
                to={item.to}
                className={active ? 'active' : ''}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
                onTouchStart={() => prefetchRoute(item.to)}
              >
                <CenterFab><item.icon /></CenterFab>
                {t(item.labelKey)}
              </CenterItem>
            );
          }

          const active = isPatientNavActive(pathname, item);
          return (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={active ? 'active' : ''}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              onTouchStart={() => prefetchRoute(item.to)}
            >
              <item.icon />
              {t(item.labelKey)}
            </NavItem>
          );
        })}

        <MoreBtn
          type="button"
          $open={moreOpen || isMoreRoute}
          onClick={() => setMoreOpen(true)}
          aria-label={t('nav.more_options')}
          aria-expanded={moreOpen}
        >
          <LayoutGrid />
          {t('nav.more')}
        </MoreBtn>
      </Nav>

      <PatientMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
