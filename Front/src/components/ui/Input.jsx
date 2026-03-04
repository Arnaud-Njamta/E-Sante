import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  padding-left: ${({ $hasIcon }) => ($hasIcon ? '42px' : '14px')};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.neutral[400]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.7;
  }

  ${({ $error, theme }) =>
        $error &&
        css`
      border-color: ${theme.colors.danger[500]};
      &:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
      }
    `}
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
  svg { width: 18px; height: 18px; }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.danger[500]};
`;

const Input = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => {
    return (
        <Wrapper className={className}>
            {label && <Label>{label}</Label>}
            <InputContainer>
                {Icon && <IconWrapper><Icon /></IconWrapper>}
                <StyledInput ref={ref} $hasIcon={!!Icon} $error={!!error} {...props} />
            </InputContainer>
            {error && <ErrorText role="alert">{error}</ErrorText>}
        </Wrapper>
    );
});

Input.displayName = 'Input';
export default Input;
