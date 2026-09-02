import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope, Pill, Siren, Bot, MapPin, ChevronRight, HeartPulse, Clock, FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../ui/UserAvatar';
import HealthAlertBanner from './HealthAlertBanner';
import PatientPrisesTodayTeaser from './PatientPrisesTodayTeaser';
import PatientActualitesTeaser from './PatientActualitesTeaser';
import PatientCarnetTeaser from './PatientCarnetTeaser';
import PatientOrdonnancesElecTeaser from './PatientOrdonnancesElecTeaser';
import { openAiAssistant } from '../../utils/openAiAssistant';

const Page = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 4px;
`;

const HomeHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const HeaderText = styled.div`
  flex: 1;
  min-width: 0;

  h1 {
    margin: 0 0 4px;
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
`;

const MissionHero = styled.div`
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary[100]};
  background: linear-gradient(145deg, ${({ theme }) => theme.colors.primary[50]} 0%, ${({ theme }) => theme.colors.surface} 100%);

  h2 {
    margin: 0 0 4px;
    font-size: 0.95rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
    letter-spacing: -0.01em;
  }

  > p {
    margin: 0;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
`;

const MissionList = styled.ul`
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MissionItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;

  .dot {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
  }

  strong {
    display: block;
    font-size: 0.84rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 1px;
  }

  span {
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.35;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SecondarySection = styled(Section)`
  gap: 16px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const ActionTile = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:active {
    transform: scale(0.98);
    border-color: ${({ theme }) => theme.colors.primary[200]};
  }

  .icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
  }

  strong {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.25;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 0.72rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.3;
  }
`;

const EmergencyStrip = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.25);

  strong {
    display: block;
    font-size: 0.95rem;
    font-weight: 800;
  }

  p {
    margin: 2px 0 0;
    font-size: 0.76rem;
    opacity: 0.9;
  }
`;

const AssistantStrip = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.primary[100]};
  background: ${({ theme }) => theme.colors.primary[50]};
  cursor: pointer;
  text-align: left;

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[600]};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  strong {
    display: block;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 2px;
  }

  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.35;
  }
`;

const ACTIONS = [
  {
    to: '/sante?tab=soignants&profession=aide_soignant',
    icon: HeartPulse,
    titleKey: 'patientHome.find_home_care',
    descKey: 'patientHome.find_home_care_short',
    bg: '#FFF7ED',
    color: '#C2410C',
  },
  {
    to: '/sante?tab=soignants&profession=medecin',
    icon: Stethoscope,
    titleKey: 'patientHome.find_doctor',
    descKey: 'patientHome.find_doctor_short',
    bg: '#ECFDF5',
    color: '#047857',
  },
  {
    to: '/pharmacie-hub',
    icon: Pill,
    titleKey: 'patientHome.find_pharmacy',
    descKey: 'patientHome.find_pharmacy_short',
    bg: '#EFF6FF',
    color: '#1D4ED8',
  },
  {
    to: '/sante?tab=etablissements&type=pharmacie&de_garde=1',
    icon: MapPin,
    titleKey: 'patientHome.pharmacy_on_duty',
    descKey: 'patientHome.pharmacy_on_duty_short',
    bg: '#FEF3C7',
    color: '#B45309',
  },
];

export default function PatientSimplifiedHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  return (
    <Page>
      <HomeHeader>
        <UserAvatar
          user={user}
          role={role}
          size={52}
          round
          onClick={() => navigate('/profil')}
        />
        <HeaderText>
          <h1>{t('patientHome.greeting', { name: user?.prenom || t('common.patient') })}</h1>
          <p>{t('patientHome.subtitle')}</p>
        </HeaderText>
      </HomeHeader>

      <MissionHero>
        <h2>{t('patientHome.mission_title')}</h2>
        <p>{t('patientHome.mission_lead')}</p>
        <MissionList>
          <MissionItem $bg="#ECFDF5" $color="#047857">
            <div className="dot"><Clock size={16} /></div>
            <div>
              <strong>{t('patientHome.mission_meds_title')}</strong>
              <span>{t('patientHome.mission_meds_desc')}</span>
            </div>
          </MissionItem>
          <MissionItem $bg="#FFF7ED" $color="#C2410C">
            <div className="dot"><Stethoscope size={16} /></div>
            <div>
              <strong>{t('patientHome.mission_care_title')}</strong>
              <span>{t('patientHome.mission_care_desc')}</span>
            </div>
          </MissionItem>
          <MissionItem $bg="#EFF6FF" $color="#1D4ED8">
            <div className="dot"><FileText size={16} /></div>
            <div>
              <strong>{t('patientHome.mission_records_title')}</strong>
              <span>{t('patientHome.mission_records_desc')}</span>
            </div>
          </MissionItem>
        </MissionList>
      </MissionHero>

      <Section>
        <SectionHead>
          <SectionTitle>{t('patientHome.section_find')}</SectionTitle>
        </SectionHead>
        <ActionGrid>
          {ACTIONS.map((action) => (
            <ActionTile
              key={action.to}
              type="button"
              $bg={action.bg}
              $color={action.color}
              onClick={() => navigate(action.to)}
            >
              <div className="icon"><action.icon size={20} /></div>
              <div>
                <strong>{t(action.titleKey)}</strong>
                <span>{t(action.descKey)}</span>
              </div>
            </ActionTile>
          ))}
        </ActionGrid>
      </Section>

      <HealthAlertBanner region={user?.region} />

      <Section>
        <SectionHead>
          <SectionTitle>{t('patientHome.section_meds')}</SectionTitle>
        </SectionHead>
        <PatientPrisesTodayTeaser />
      </Section>

      <EmergencyStrip type="button" onClick={() => navigate('/urgence')}>
        <div>
          <strong>{t('patientHome.emergency')}</strong>
          <p>{t('patientHome.emergency_desc')}</p>
        </div>
        <Siren size={22} />
      </EmergencyStrip>

      <AssistantStrip
        type="button"
        onClick={() => openAiAssistant({ message: t('patientHome.ai_prises_prompt') })}
      >
        <div className="icon"><Bot size={20} /></div>
        <div style={{ flex: 1 }}>
          <strong>{t('patientHome.assistant_cta')}</strong>
          <span>{t('patientHome.assistant_hint')}</span>
        </div>
        <ChevronRight size={18} color="#94A3B8" />
      </AssistantStrip>

      <SecondarySection>
        <SectionHead>
          <SectionTitle>{t('patientHome.section_records')}</SectionTitle>
        </SectionHead>
        <PatientCarnetTeaser alwaysVisible />
        <PatientOrdonnancesElecTeaser />
      </SecondarySection>

      <Section>
        <PatientActualitesTeaser />
      </Section>
    </Page>
  );
}
