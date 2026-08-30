import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
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

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
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
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarWidth = collapsed ? '72px' : '260px';

    return (
        <LayoutWrapper>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
                mobileOpen={mobileOpen}
            />
            <MobileOverlay $show={mobileOpen} onClick={() => setMobileOpen(false)} />
            <MainArea $sidebarWidth={sidebarWidth}>
                <TopBar onMenuToggle={() => setMobileOpen((o) => !o)} />
                <PageContent>
                    <Outlet />
                </PageContent>
            </MainArea>
            <AiAssistantWidget />
        </LayoutWrapper>
    );
}
