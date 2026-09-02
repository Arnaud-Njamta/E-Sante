import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/branding';
import client from '../../api/client';
import ENDPOINTS from '../../api/endpoints';
import { normalizeSupportedLang } from '../../i18n/syncLanguage';

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: ${({ $compact }) => ($compact ? '8px 10px' : '6px 10px')};
  font-size: ${({ $compact }) => ($compact ? '0.8rem' : '0.82rem')};
  min-height: ${({ $compact }) => ($compact ? '36px' : 'auto')};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const ToggleWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ToggleBtn = styled.button`
  min-width: 40px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  border: none;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[600] : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.textSecondary)};
  box-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(0, 122, 94, 0.25)' : 'none')};

  &:active {
    transform: scale(0.97);
  }
`;

export default function LanguageSwitcher({ compact = false, variant = 'select' }) {
  const { i18n, t } = useTranslation();
  const { isPatient, role, user } = useAuth();
  const activeLang = normalizeSupportedLang(i18n.language);

  const persistLanguage = useCallback(async (lng) => {
    if (!isPatient && role !== ROLES.PATIENT) return;
    if (!user) return;
    try {
      await client.put(ENDPOINTS.patients.profile, { langue: lng });
    } catch {
      // silencieux — localStorage + i18n déjà mis à jour
    }
  }, [isPatient, role, user]);

  const setLanguage = useCallback(async (lng) => {
    const normalized = normalizeSupportedLang(lng);
    if (normalized === activeLang) return;
    await i18n.changeLanguage(normalized);
    if ((isPatient || role === ROLES.PATIENT) && user) {
      await persistLanguage(normalized);
    }
  }, [activeLang, i18n, isPatient, role, user, persistLanguage]);

  const handleSelectChange = async (e) => {
    await setLanguage(e.target.value);
  };

  if (variant === 'toggle') {
    return (
      <ToggleWrap role="group" aria-label={t('common.language')}>
        <Globe size={15} style={{ marginLeft: 8, flexShrink: 0 }} />
        {['fr', 'en'].map((lng) => (
          <ToggleBtn
            key={lng}
            type="button"
            $active={activeLang === lng}
            onClick={() => setLanguage(lng)}
            aria-pressed={activeLang === lng}
          >
            {lng.toUpperCase()}
          </ToggleBtn>
        ))}
      </ToggleWrap>
    );
  }

  return (
    <Wrap>
      {!compact && <Globe size={16} />}
      <Select
        $compact={compact}
        value={activeLang}
        onChange={handleSelectChange}
        aria-label={t('common.language')}
      >
        <option value="fr">{t('languages.fr')}</option>
        <option value="en">{t('languages.en')}</option>
      </Select>
    </Wrap>
  );
}
