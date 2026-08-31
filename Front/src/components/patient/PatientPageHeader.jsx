import React from 'react';
import styled from 'styled-components';

/** En-tête de page masqué sur mobile patient (titre géré par la TopBar) */
const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: fadeIn 0.4s ease both;

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  p {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 4px 0 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

export default function PatientPageHeader({ title, subtitle, children }) {
  return (
    <Header>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </Header>
  );
}
