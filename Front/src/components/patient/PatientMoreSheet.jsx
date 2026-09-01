import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PATIENT_MORE_SECTIONS } from '../../config/patientMobileNav';
import { prefetchRoute } from '../../utils/routePrefetch';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
  animation: fadeIn 0.2s ease both;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 24px 24px 0 0;
  padding: 12px ${({ theme }) => theme.spacing[4]} calc(16px + env(safe-area-inset-bottom, 0px));
  max-height: 78vh;
  overflow-y: auto;
  box-shadow: 0 -12px 40px rgba(11, 61, 48, 0.12);
  animation: slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1) both;

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 99px;
  background: ${({ theme }) => theme.colors.neutral[200]};
  margin: 0 auto 16px;
`;

const SheetHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  h2 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: none;
  cursor: pointer;

  &:active { transform: scale(0.95); }
`;

const Section = styled.div`
  & + & { margin-top: ${({ theme }) => theme.spacing[5]}; }
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing[2]};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const Item = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.neutral[50]};
  text-align: left;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast};

  &:active {
    transform: scale(0.98);
    background: ${({ theme }) => theme.colors.primary[50]};
    border-color: ${({ theme }) => theme.colors.primary[200]};
  }
`;

const ItemIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[100]}, ${({ theme }) => theme.colors.primary[200]});
  color: ${({ theme }) => theme.colors.primary[700]};

  svg { width: 18px; height: 18px; }
`;

const ItemText = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.2;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 0.68rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.3;
  }
`;

const LogoutBtn = styled.button`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[5]};
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.danger[200]};
  background: ${({ theme }) => theme.colors.danger[50]};
  color: ${({ theme }) => theme.colors.danger[700]};
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
    background: ${({ theme }) => theme.colors.danger[100]};
  }

  svg { width: 18px; height: 18px; }
`;

export default function PatientMoreSheet({ open, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleNav = (to) => {
    onClose();
    navigate(to);
  };

  return (
    <>
      <Backdrop onClick={onClose} aria-hidden />
      <Sheet role="dialog" aria-label={t('nav.more_options')}>
        <Handle />
        <SheetHead>
          <h2>{t('nav.more_options')}</h2>
          <CloseBtn type="button" onClick={onClose} aria-label={t('common.cancel')}>
            <X size={18} />
          </CloseBtn>
        </SheetHead>

        {PATIENT_MORE_SECTIONS.map((section) => (
          <Section key={section.titleKey}>
            <SectionTitle>{t(section.titleKey)}</SectionTitle>
            <ItemGrid>
              {section.items.map((item) => (
                <Item
                  key={item.to}
                  type="button"
                  onMouseEnter={() => prefetchRoute(item.to)}
                  onFocus={() => prefetchRoute(item.to)}
                  onClick={() => handleNav(item.to)}
                >
                  <ItemIcon><item.icon /></ItemIcon>
                  <ItemText>
                    <strong>{t(item.labelKey)}</strong>
                    <span>{t(item.descKey)}</span>
                  </ItemText>
                </Item>
              ))}
            </ItemGrid>
          </Section>
        ))}

        <LogoutBtn
          type="button"
          onClick={() => {
            onClose();
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut />
          {t('common.logout')}
        </LogoutBtn>
      </Sheet>
    </>
  );
}
