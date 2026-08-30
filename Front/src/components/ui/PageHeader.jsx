import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: fadeIn 0.4s ease both;

  h1 {
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: clamp(1.65rem, 3vw, 2rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.15;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.55;
  }
`;

export default function PageHeader({ title, subtitle, children }) {
  return (
    <Header>
      {title && <h1>{title}</h1>}
      {subtitle && <p>{subtitle}</p>}
      {children}
    </Header>
  );
}
