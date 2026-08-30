import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { PATIENT_MOBILE_NAV } from '../../config/patientMobileNav';

const Nav = styled.nav`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: ${({ theme }) => theme.zIndex.bottomNav};
    background: ${({ theme }) => theme.colors.surface};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));
    justify-content: space-around;
    gap: 4px;
  }
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.68rem;
  font-weight: 600;
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  svg {
    width: 20px;
    height: 20px;
  }

  &.active {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export default function PatientBottomNav() {
  return (
    <Nav aria-label="Navigation patient">
      {PATIENT_MOBILE_NAV.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard'}
        >
          <item.icon />
          {item.label}
        </NavItem>
      ))}
    </Nav>
  );
}
