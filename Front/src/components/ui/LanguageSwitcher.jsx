import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/branding';
import client from '../../api/client';
import ENDPOINTS from '../../api/endpoints';

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.82rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation();
  const { isPatient, role, user } = useAuth();

  const persistLanguage = useCallback(async (lng) => {
    if (!isPatient && role !== ROLES.PATIENT) return;
    try {
      await client.put(ENDPOINTS.patients.profile, { langue: lng });
    } catch {
      // silencieux — localStorage + i18n déjà mis à jour
    }
  }, [isPatient, role]);

  const handleChange = async (e) => {
    const lng = e.target.value;
    await i18n.changeLanguage(lng);
    if ((isPatient || role === ROLES.PATIENT) && user) {
      persistLanguage(lng);
    }
  };

  return (
    <Wrap>
      {!compact && <Globe size={16} />}
      <Select
        value={i18n.language?.split('-')[0] || 'fr'}
        onChange={handleChange}
        aria-label={t('common.language')}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="ewo">Ewondo</option>
        <option value="bas">Bassa</option>
        <option value="dua">Douala</option>
        <option value="ff">Fulfulde</option>
      </Select>
    </Wrap>
  );
}
