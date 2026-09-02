import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ChevronRight, Download } from 'lucide-react';
import { useOrdonnancesElecPatient } from '../../hooks/useReservations';
import { useDownloadOrdonnanceElec } from '../../hooks/useOrdonnances';
import toast from 'react-hot-toast';

const Wrap = styled.div`
  margin-bottom: 4px;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ViewAll = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[600]};
  cursor: pointer;
`;

const Card = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;

  &:active { transform: scale(0.99); }
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #EFF6FF;
  color: #1D4ED8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const DownloadBtn = styled.button`
  border: none;
  background: #EFF6FF;
  color: #1D4ED8;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:active { transform: scale(0.95); }
`;

export default function PatientOrdonnancesElecTeaser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: ordonnances, isLoading } = useOrdonnancesElecPatient();
  const download = useDownloadOrdonnanceElec();

  if (isLoading) return null;

  const list = Array.isArray(ordonnances) ? ordonnances : [];
  const latest = list[0];

  const handleDownload = async (e, id) => {
    e.stopPropagation();
    try {
      await download.mutateAsync(id);
      toast.success(t('ordonnancesElec.download_success'));
    } catch {
      toast.error(t('ordonnancesElec.download_error'));
    }
  };

  return (
    <Wrap>
      <Head>
        <Title><FileText size={14} /> {t('ordonnancesElec.title')}</Title>
        <ViewAll type="button" onClick={() => navigate('/ordonnances-electroniques')}>
          {t('ordonnancesElecTeaser.view_all')} <ChevronRight size={14} />
        </ViewAll>
      </Head>

      {!latest ? (
        <Card type="button" onClick={() => navigate('/ordonnances-electroniques')}>
          <IconBox><FileText size={20} /></IconBox>
          <Body>
            <strong>{t('ordonnancesElecTeaser.empty_title')}</strong>
            <span>{t('ordonnancesElecTeaser.empty_desc')}</span>
          </Body>
          <ChevronRight size={18} color="#94A3B8" />
        </Card>
      ) : (
        <Card type="button" onClick={() => navigate('/ordonnances-electroniques')}>
          <IconBox><FileText size={20} /></IconBox>
          <Body>
            <strong>
              {latest.medecin?.prenom ? `Dr. ${latest.medecin.prenom} ${latest.medecin.nom}` : t('ordonnancesElec.signed')}
            </strong>
            <span>
              {latest.numero_ordonnance || latest.id?.slice(0, 8)}
              {latest.createdAt && ` · ${new Date(latest.createdAt).toLocaleDateString('fr-FR')}`}
            </span>
          </Body>
          <DownloadBtn
            type="button"
            aria-label={t('ordonnancesElec.download')}
            onClick={(e) => handleDownload(e, latest.id)}
            disabled={download.isPending}
          >
            <Download size={16} />
          </DownloadBtn>
        </Card>
      )}
    </Wrap>
  );
}
