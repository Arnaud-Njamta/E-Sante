import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

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
  padding-right: ${({ $hasToggle }) => ($hasToggle ? '42px' : '14px')};
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

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.danger[500]};
`;

const Input = forwardRef(({ label, error, icon: Icon, className, type, ...props }, ref) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <Wrapper className={className}>
            {label && <Label>{label}</Label>}
            <InputContainer>
                {Icon && <IconWrapper><Icon /></IconWrapper>}
                <StyledInput
                  ref={ref}
                  $hasIcon={!!Icon}
                  $hasToggle={isPassword}
                  $error={!!error}
                  type={inputType}
                  {...props}
                />
                {isPassword && (
                  <ToggleButton
                    type="button"
                    aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                  </ToggleButton>
                )}
            </InputContainer>
            {error && <ErrorText role="alert">{error}</ErrorText>}
        </Wrapper>
    );
});

Input.displayName = 'Input';
export default Input;
