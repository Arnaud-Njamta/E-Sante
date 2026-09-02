import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Bell, FileText, Users } from 'lucide-react';
import Card from '../ui/Card';

const Notice = styled(Card)`
  padding: 18px 20px;
  margin-bottom: 24px;
  background: ${({ theme }) => theme.colors.primary[50]};
  border-color: ${({ theme }) => theme.colors.primary[100]};

  h3 {
    margin: 0 0 8px;
    font-size: 1rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0 0 12px;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.4;

    svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: ${({ theme }) => theme.colors.primary[600]};
    }
  }
`;

export default function MedecinPatientCareNotice() {
  const { t } = useTranslation();

  return (
    <Notice>
      <h3>{t('medecinCare.notice_title')}</h3>
      <p>{t('medecinCare.notice_intro')}</p>
      <List>
        <li><Bell size={16} /> {t('medecinCare.notice_reminders')}</li>
        <li><FileText size={16} /> {t('medecinCare.notice_prescriptions')}</li>
        <li><Users size={16} /> {t('medecinCare.notice_actualites')}</li>
      </List>
    </Notice>
  );
}
