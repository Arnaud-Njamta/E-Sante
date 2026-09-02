import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { FieldInput, DEEP } from './AuthShell';

const Wrap = styled.div`
  position: relative;
  width: 100%;
`;

const StyledFieldInput = styled(FieldInput)`
  padding-right: 36px;
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 0;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: #A8A29E;
  cursor: pointer;

  &:hover {
    color: ${DEEP};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const AuthPasswordInput = forwardRef(({ $error, ...props }, ref) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <Wrap>
      <StyledFieldInput
        ref={ref}
        type={visible ? 'text' : 'password'}
        $error={$error}
        {...props}
      />
      <ToggleBtn
        type="button"
        aria-label={visible ? t('auth.hide_password') : t('auth.show_password')}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </ToggleBtn>
    </Wrap>
  );
});

AuthPasswordInput.displayName = 'AuthPasswordInput';

export default AuthPasswordInput;
