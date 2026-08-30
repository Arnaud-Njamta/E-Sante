import React from 'react';
import styled, { css } from 'styled-components';

const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ $padding, theme }) => $padding || theme.spacing[6]};
  transition: all ${({ theme }) => theme.transitions.normal};
  animation: fadeIn 0.4s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};

  ${({ $hoverable }) =>
        $hoverable &&
        css`
      cursor: pointer;
      &:hover {
        border-color: ${({ theme }) => theme.colors.textMuted};
        box-shadow: ${({ theme }) => theme.shadows.sm};
        transform: translateY(-1px);
      }
    `}

  ${({ $accent }) =>
        $accent &&
        css`
      border-top: 3px solid ${({ theme }) => theme.colors[$accent]?.[500] || theme.colors.primary[500]};
    `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const CardTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamilySerif};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: 500;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

export default function Card({ children, hoverable, accent, padding, delay, ...props }) {
    return (
        <StyledCard $hoverable={hoverable} $accent={accent} $padding={padding} $delay={delay} {...props}>
            {children}
        </StyledCard>
    );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
