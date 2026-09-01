import React, { useState, Suspense } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PatientBottomNav, { BOTTOM_NAV_HEIGHT } from './PatientBottomNav';
import PageContentSkeleton from '../ui/PageContentSkeleton';
import { HERO_IMAGE } from '../auth/authTheme';

const AiAssistantWidget = React.lazy(() => import('../ai/AiAssistantWidget'));

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
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
  min-height: 100dvh;
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
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
  min-width: 0;
  padding-bottom: ${({ $patientMobile, $compact, theme }) => {
    if ($patientMobile) {
      return `calc(${BOTTOM_NAV_HEIGHT}px + 28px + env(safe-area-inset-bottom, 0px))`;
    }
    if ($compact) {
      return `calc(${theme.spacing[6]} + env(safe-area-inset-bottom, 0px))`;
    }
    return theme.spacing[6];
  }};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme, $patientMobile, $compact }) => {
      const side = theme.spacing[4];
      if ($patientMobile) {
        return `${theme.spacing[3]} ${side} calc(${BOTTOM_NAV_HEIGHT}px + 28px + env(safe-area-inset-bottom, 0px))`;
      }
      if ($compact) {
        return `${theme.spacing[4]} ${side} calc(${theme.spacing[4]} + env(safe-area-inset-bottom, 0px))`;
      }
      return theme.spacing[4];
    }};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-left: ${({ theme }) => theme.spacing[3]};
    padding-right: ${({ theme }) => theme.spacing[3]};
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
  const { role } = useAuth();
  const { isMobile, isCompact } = useBreakpoint();
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
        <PageContent $patientMobile={isPatientMobile} $compact={isCompact && !isPatientMobile}>
          <Suspense fallback={<PageContentSkeleton />}>
            <Outlet />
          </Suspense>
        </PageContent>
      </MainArea>
      {isPatientMobile && <PatientBottomNav />}
      <Suspense fallback={null}>
        <AiAssistantWidget />
      </Suspense>
    </LayoutWrapper>
  );
}
