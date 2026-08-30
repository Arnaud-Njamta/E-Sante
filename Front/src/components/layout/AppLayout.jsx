import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PatientBottomNav from './PatientBottomNav';
import AiAssistantWidget from '../ai/AiAssistantWidget';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const MainArea = styled.main`
  flex: 1;
  margin-left: ${({ $sidebarWidth }) => $sidebarWidth};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
    $patientMobile ? `calc(88px + ${theme.spacing[4]})` : theme.spacing[6]
  )};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme, $patientMobile }) => (
      $patientMobile
        ? `calc(${theme.spacing[4]} + 4px) ${theme.spacing[4]} calc(88px + ${theme.spacing[4]})`
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
  const isPatientMobile = role === 'patient' && isMobile;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = isPatientMobile ? '0px' : (collapsed ? '72px' : '260px');

  return (
    <LayoutWrapper>
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
