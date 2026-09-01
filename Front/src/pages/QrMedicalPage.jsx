import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, RefreshCw, Droplets, AlertTriangle, Phone } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import FamilleProfilSwitcher from '../components/patient/FamilleProfilSwitcher';
import NfcQrWriter from '../components/patient/NfcQrWriter';
import { useQrMedical, useRegenererQr } from '../hooks/useQrMedical';
import { useFamilleProfil } from '../context/FamilleProfilContext';
import toast from 'react-hot-toast';

const QrWrap = styled(Card)`
  padding: 32px;
  text-align: center;
  max-width: 400px;
  margin: 24px auto;

  .qr-box {
    padding: 20px;
    background: white;
    border-radius: 16px;
    display: inline-block;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin: 16px 0;
  }

  p.hint {
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 12px 0 0;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 10px;
  max-width: 400px;
  margin: 20px auto 0;
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 10px;
  font-size: 0.88rem;

  strong { display: block; font-size: 0.72rem; color: ${({ theme }) => theme.colors.textSecondary}; }
`;

export default function QrMedicalPage() {
  const { t } = useTranslation();
  const { activeProfil } = useFamilleProfil();
  const { data, isLoading, refetch } = useQrMedical();
  const regenerer = useRegenererQr();

  const handleRegenerer = async () => {
    if (!window.confirm('Régénérer le QR ? L\'ancien code ne fonctionnera plus.')) return;
    try {
      await regenerer.mutateAsync();
      toast.success(t('qr.regenerated'));
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner text={t('common.loading')} />;

  const payload = data?.payload || {};
  const qrUrl = data?.url || '';

  return (
    <>
      <PageHeader
        title={t('qr.title')}
        subtitle={activeProfil
          ? t('carnet.famille_note', { name: `${activeProfil.prenom} ${activeProfil.nom}` })
          : t('qr.subtitle')}
        icon={<QrCode size={24} />}
      />

      <FamilleProfilSwitcher />

      <QrWrap>
        <div className="qr-box">
          {qrUrl && <QRCodeSVG value={qrUrl} size={200} level="M" includeMargin />}
        </div>
        <p className="hint">{t('qr.scan_hint')}</p>
        <Button variant="outline" onClick={handleRegenerer} disabled={regenerer.isPending} style={{ marginTop: 16 }}>
          <RefreshCw size={14} /> {t('qr.regenerate')}
        </Button>
      </QrWrap>

      <InfoGrid>
        {(payload.prenom || payload.nom) && (
          <InfoRow>
            <span>👤</span>
            <div><strong>Nom</strong>{payload.prenom} {payload.nom}</div>
          </InfoRow>
        )}
        {payload.groupe_sanguin && (
          <InfoRow>
            <Droplets size={18} color="#DC2626" />
            <div><strong>{t('qr.blood')}</strong>{payload.groupe_sanguin}</div>
          </InfoRow>
        )}
        {payload.allergies?.length > 0 && (
          <InfoRow>
            <AlertTriangle size={18} color="#D97706" />
            <div><strong>{t('qr.allergies')}</strong>{payload.allergies.join(', ')}</div>
          </InfoRow>
        )}
        {payload.contact_urgence && (
          <InfoRow>
            <Phone size={18} />
            <div><strong>{t('qr.contact')}</strong>{payload.contact_urgence}</div>
          </InfoRow>
        )}
      </InfoGrid>

      <NfcQrWriter qrUrl={qrUrl} />
    </>
  );
}
