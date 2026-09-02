import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pill, MapPin, Package, MessageCircle, Search, Phone, ArrowRight,
} from 'lucide-react';
import Card from '../components/ui/Card';
import PatientPageHeader from '../components/patient/PatientPageHeader';

const Intro = styled.p`
  margin: 0 0 20px;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const HubGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HubCard = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[300]};
  }

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
  }

  .text {
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 4px;
    }

    span {
      font-size: 0.82rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      line-height: 1.35;
    }
  }
`;

const Note = styled(Card)`
  margin-top: 20px;
  padding: 16px 18px;
  background: ${({ theme }) => theme.colors.primary[50]};
  border-color: ${({ theme }) => theme.colors.primary[100]};
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const ITEMS = [
  {
    to: '/sante?type=pharmacie',
    icon: MapPin,
    titleKey: 'pharmacyHub.nearby',
    descKey: 'pharmacyHub.nearby_desc',
    bg: '#ECFDF5',
    color: '#047857',
  },
  {
    to: '/sante?tab=medicaments',
    icon: Search,
    titleKey: 'pharmacyHub.medicine',
    descKey: 'pharmacyHub.medicine_desc',
    bg: '#EFF6FF',
    color: '#2563EB',
  },
  {
    to: '/reservations',
    icon: Package,
    titleKey: 'pharmacyHub.reservations',
    descKey: 'pharmacyHub.reservations_desc',
    bg: '#FFF7ED',
    color: '#C2410C',
  },
  {
    to: '/pharmacie/chat',
    icon: MessageCircle,
    titleKey: 'pharmacyHub.contact',
    descKey: 'pharmacyHub.contact_desc',
    bg: '#F5F3FF',
    color: '#7C3AED',
  },
];

export default function PatientPharmacyHubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <PatientPageHeader
        title={t('pharmacyHub.title')}
        subtitle={t('pharmacyHub.subtitle')}
        icon={<Pill size={24} />}
      />

      <Intro>{t('pharmacyHub.intro')}</Intro>

      <HubGrid>
        {ITEMS.map((item) => (
          <HubCard
            key={item.to}
            type="button"
            $bg={item.bg}
            $color={item.color}
            onClick={() => navigate(item.to)}
          >
            <div className="icon"><item.icon size={22} /></div>
            <div className="text">
              <strong>{t(item.titleKey)}</strong>
              <span>{t(item.descKey)}</span>
            </div>
            <ArrowRight size={18} color="#94A3B8" />
          </HubCard>
        ))}
      </HubGrid>

      <Note>
        <Phone size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        {t('pharmacyHub.legal_note')}
      </Note>
    </div>
  );
}
