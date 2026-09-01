import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Users, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useFamilleProfils } from '../../hooks/useFamille';
import { useFamilleProfil } from '../../context/FamilleProfilContext';
import { useAuth } from '../../context/AuthContext';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow-x: auto;

  label {
    font-size: 0.72rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const Chip = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.deep : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.deep : 'transparent')};
  color: ${({ $active }) => ($active ? 'white' : 'inherit')};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export default function FamilleProfilSwitcher() {
  const { t } = useTranslation();
  const { user, isPatient } = useAuth();
  const { data: profils } = useFamilleProfils();
  const { activeProfilId, switchProfil, setProfils } = useFamilleProfil();
  const qc = useQueryClient();

  const handleSwitch = (id) => {
    switchProfil(id);
    qc.invalidateQueries({ queryKey: ['carnet-medical'] });
    qc.invalidateQueries({ queryKey: ['qr-medical'] });
  };

  useEffect(() => {
    if (Array.isArray(profils)) setProfils(profils);
  }, [profils, setProfils]);

  if (!isPatient) return null;
  if (!profils?.length) return null;

  return (
    <Bar>
      <label><Users size={14} /> {t('famille.switch_profile')}</label>
      <Chip type="button" $active={!activeProfilId} onClick={() => handleSwitch(null)}>
        <User size={12} /> {t('famille.myself')}
      </Chip>
      {profils.map((p) => (
        <Chip
          key={p.id}
          type="button"
          $active={activeProfilId === p.id}
          onClick={() => handleSwitch(p.id)}
        >
          {p.prenom} {p.nom}
        </Chip>
      ))}
    </Bar>
  );
}
