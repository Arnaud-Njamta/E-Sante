import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PatientBottomNav, { BOTTOM_NAV_HEIGHT } from './PatientBottomNav';
import AiAssistantWidget from '../ai/AiAssistantWidget';
import { HERO_IMAGE } from '../auth/authTheme';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  background: ${({ $patient, theme }) => ($patient ? 'transparent' : theme.colors.background)};
`;

const PatientBackdrop = styled.div`
  display: none;
  pointer-events: none;

  ${({ $visible }) => $visible && `
    display: block;
    position: fixed;
    inset: 0;
    z-index: 0;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('${HERO_IMAGE}') center 22% / cover no-repeat;
      opacity: 0.24;
      filter: saturate(0.9);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(236, 253, 245, 0.78) 0%, rgba(245, 242, 237, 0.88) 50%, rgba(245, 242, 237, 0.94) 100%),
        radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0, 122, 94, 0.18), transparent 65%);
    }
  `}
`;

const MainArea = styled.main`
  flex: 1;
  margin-left: ${({ $sidebarWidth }) => $sidebarWidth};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  transition: margin-left ${({ theme }) => theme.transitions.normal};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: 0;
  }
`;

const PageContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: ${({ $patientMobile, theme }) => (
    $patientMobile
      ? `calc(${BOTTOM_NAV_HEIGHT}px + 28px + env(safe-area-inset-bottom, 0px))`
      : theme.spacing[6]
  )};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme, $patientMobile }) => (
      $patientMobile
        ? `${theme.spacing[3]} ${theme.spacing[4]} calc(${BOTTOM_NAV_HEIGHT}px + 28px + env(safe-area-inset-bottom, 0px))`
        : theme.spacing[4]
    )};
  }
`;

const MobileOverlay = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ $show }) => ($show ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: ${({ theme }) => theme.colors.overlay};
    z-index: ${({ theme }) => theme.zIndex.sidebar - 1};
  }
`;

export default function AppLayout() {
  const theme = useTheme();
  const { role } = useAuth();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const isPatient = role === 'patient';
  const isPatientMobile = isPatient && isMobile;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = isPatientMobile ? '0px' : (collapsed ? '72px' : '260px');

  return (
    <LayoutWrapper $patient={isPatient}>
      <PatientBackdrop $visible={isPatient} aria-hidden />
      {!isPatientMobile && (
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
        />
      )}
      {!isPatientMobile && (
        <MobileOverlay $show={mobileOpen} onClick={() => setMobileOpen(false)} />
      )}
      <MainArea $sidebarWidth={sidebarWidth}>
        <TopBar
          patientMobile={isPatientMobile}
          onMenuToggle={() => setMobileOpen((o) => !o)}
        />
        <PageContent $patientMobile={isPatientMobile}>
          <Outlet />
        </PageContent>
      </MainArea>
      {isPatientMobile && <PatientBottomNav />}
      <AiAssistantWidget />
    </LayoutWrapper>
  );
}
