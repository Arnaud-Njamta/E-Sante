import React from 'react';
import styled, { css } from 'styled-components';

const variants = {
    primary: css`
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[600]});
    color: ${({ theme }) => theme.colors.textOnPrimary};
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[600]}, ${({ theme }) => theme.colors.primary[700]});
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  `,
    secondary: css`
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.neutral[200]};
    }
  `,
    success: css`
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.success[500]}, ${({ theme }) => theme.colors.success[600]});
    color: white;
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.success[600]}, ${({ theme }) => theme.colors.success[700]});
      transform: translateY(-1px);
    }
  `,
    danger: css`
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.danger[500]}, ${({ theme }) => theme.colors.danger[600]});
    color: white;
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.danger[600]}, ${({ theme }) => theme.colors.danger[700]});
      transform: translateY(-1px);
    }
  `,
    ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary[500]};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[50]};
    }
  `,
    outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary[500]};
    border: 1.5px solid ${({ theme }) => theme.colors.primary[500]};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[50]};
    }
  `,
};

const sizes = {
    sm: css`
    padding: 6px 14px;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    gap: 6px;
  `,
    md: css`
    padding: 10px 20px;
    font-size: ${({ theme }) => theme.typography.sizes.base};
    gap: 8px;
  `,
    lg: css`
    padding: 14px 28px;
    font-size: ${({ theme }) => theme.typography.sizes.md};
    gap: 10px;
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  line-height: 1.4;

  ${({ $variant }) => variants[$variant] || variants.primary}
  ${({ $size }) => sizes[$size] || sizes.md}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon: Icon,
    iconRight: IconRight,
    ...props
}) {
    return (
        <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...props}>
            {Icon && <Icon />}
            {children}
            {IconRight && <IconRight />}
        </StyledButton>
    );
}
