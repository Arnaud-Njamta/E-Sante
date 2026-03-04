import React from 'react';
import styled, { css } from 'styled-components';

const colorMap = {
    primary: css`
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[700]};
    border: 1px solid ${({ theme }) => theme.colors.primary[200]};
  `,
    success: css`
    background: ${({ theme }) => theme.colors.success[50]};
    color: ${({ theme }) => theme.colors.success[700]};
    border: 1px solid ${({ theme }) => theme.colors.success[200]};
  `,
    warning: css`
    background: ${({ theme }) => theme.colors.warning[50]};
    color: ${({ theme }) => theme.colors.warning[700]};
    border: 1px solid ${({ theme }) => theme.colors.warning[200]};
  `,
    danger: css`
    background: ${({ theme }) => theme.colors.danger[50]};
    color: ${({ theme }) => theme.colors.danger[700]};
    border: 1px solid ${({ theme }) => theme.colors.danger[200]};
  `,
    neutral: css`
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.neutral[600]};
    border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  `,
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: 1.6;
  white-space: nowrap;

  ${({ $color }) => colorMap[$color] || colorMap.primary}

  svg { width: 12px; height: 12px; }
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

export default function Badge({ children, color = 'primary', dot = false, icon: Icon, ...props }) {
    return (
        <StyledBadge $color={color} {...props}>
            {dot && <Dot />}
            {Icon && <Icon />}
            {children}
        </StyledBadge>
    );
}
