import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope, Pill, Hospital, Siren, ArrowRight, Bot, MapPin,
} from 'lucide-react';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import HealthAlertBanner from './HealthAlertBanner';
import PatientMobileProfileHero from './PatientMobileProfileHero';

const Greeting = styled.div`
  margin-bottom: 20px;

  h1 {
    margin: 0 0 6px;
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
`;

const SearchPrompt = styled.p`
  margin: 0 0 14px;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 18px 16px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s;

  &:active {
    transform: scale(0.98);
  }

  .icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
  }

  strong {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.35;
  }
`;

const EmergencyCard = styled(Card)`
  padding: 18px 20px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  border: none;
  cursor: pointer;
  color: white;

  strong { font-size: 1.05rem; display: block; margin-bottom: 4px; }
  p { margin: 0; font-size: 0.82rem; opacity: 0.92; }
`;

const AssistantHint = styled(Card)`
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: ${({ theme }) => theme.colors.primary[50]};
  border-color: ${({ theme }) => theme.colors.primary[100]};

  .icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[500]};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
`;

const ACTIONS = [
  {
    to: '/sante?tab=medecins',
    icon: Stethoscope,
    titleKey: 'patientHome.find_doctor',
    descKey: 'patientHome.find_doctor_desc',
    bg: '#ECFDF5',
    color: '#047857',
  },
  {
    to: '/pharmacie-hub',
    icon: Pill,
    titleKey: 'patientHome.find_pharmacy',
    descKey: 'patientHome.find_pharmacy_desc',
    bg: '#EFF6FF',
    color: '#1D4ED8',
  },
  {
    to: '/sante?type=hopital',
    icon: Hospital,
    titleKey: 'patientHome.find_hospital',
    descKey: 'patientHome.find_hospital_desc',
    bg: '#FEF2F2',
    color: '#B91C1C',
  },
  {
    to: '/sante',
    icon: MapPin,
    titleKey: 'patientHome.directory',
    descKey: 'patientHome.directory_desc',
    bg: '#F5F3FF',
    color: '#6D28D9',
  },
];

export default function PatientSimplifiedHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <PatientMobileProfileHero />

      <HealthAlertBanner region={user?.region} />

      <Greeting>
        <h1>{t('patientHome.greeting', { name: user?.prenom || t('common.patient') })}</h1>
        <p>{t('patientHome.subtitle')}</p>
      </Greeting>

      <SearchPrompt>{t('patientHome.who_looking')}</SearchPrompt>

      <ActionGrid>
        {ACTIONS.map((action) => (
          <ActionCard
            key={action.to}
            type="button"
            $bg={action.bg}
            $color={action.color}
            onClick={() => navigate(action.to)}
          >
            <div className="icon"><action.icon size={22} /></div>
            <strong>{t(action.titleKey)}</strong>
            <span>{t(action.descKey)}</span>
          </ActionCard>
        ))}
      </ActionGrid>

      <EmergencyCard onClick={() => navigate('/urgence')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>🚨 {t('patientHome.emergency')}</strong>
            <p>{t('patientHome.emergency_desc')}</p>
          </div>
          <ArrowRight size={22} />
        </div>
      </EmergencyCard>

      <AssistantHint>
        <div className="icon"><Bot size={22} /></div>
        <p>{t('patientHome.assistant_hint')}</p>
      </AssistantHint>
    </>
  );
}
