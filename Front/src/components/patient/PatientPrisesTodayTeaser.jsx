import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Pill, CheckCircle, Bot, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { usePrisesToday, useConfirmerPrise } from '../../hooks/usePrises';
import { formatHeurePrise, isPrisePending, isPriseDone } from '../../utils/priseHelpers';
import { openAiAssistant } from '../../utils/openAiAssistant';
import toast from 'react-hot-toast';

const Wrap = styled(Card)`
  padding: 18px 20px;
  margin-bottom: 16px;
  border-color: ${({ theme }) => theme.colors.primary[100]};
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary[50]} 0%, ${({ theme }) => theme.colors.surface} 100%);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutral[100]};
  overflow: hidden;
  margin-bottom: 14px;

  div {
    height: 100%;
    width: ${({ $percent }) => $percent}%;
    background: linear-gradient(90deg, #007A5E, #10B981);
    transition: width 0.4s ease;
  }
`;

const PriseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  &:first-of-type { border-top: none; padding-top: 0; }

  .info {
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      font-size: 0.92rem;
      color: ${({ theme }) => theme.colors.text};
    }

    span {
      font-size: 0.78rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

const AiHint = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.primary[200]};
  background: white;
  cursor: pointer;
  text-align: left;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;

  strong { color: ${({ theme }) => theme.colors.primary[700]}; }
`;

const ViewAll = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[600]};
  cursor: pointer;
`;

export default function PatientPrisesTodayTeaser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = usePrisesToday();
  const confirmerMutation = useConfirmerPrise();

  const prises = Array.isArray(data) ? data : [];
  const pending = prises.filter((p) => isPrisePending(p.statut));
  const taken = prises.filter((p) => isPriseDone(p.statut)).length;
  const total = prises.length;
  const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
  const shown = pending.slice(0, 3);

  const handleConfirm = (priseId) => {
    confirmerMutation.mutate({ id: priseId, statut: 'pris' }, {
      onSuccess: (res) => {
        if (res?.offline) toast(t('dashboard.offline_saved'), { icon: '📴' });
        else toast.success(t('prises.confirmed_toast'));
      },
      onError: (err) => toast.error(err.response?.data?.message || t('prises.confirm_error')),
    });
  };

  if (isLoading) {
    return (
      <Wrap>
        <Spinner size={22} text={t('prises.loading')} />
      </Wrap>
    );
  }

  if (total === 0) {
    return (
      <Wrap>
        <Header>
          <div>
            <h2><Pill size={18} /> {t('patientHome.prises_title')}</h2>
            <p>{t('patientHome.prises_empty')}</p>
          </div>
        </Header>
        <Button size="sm" variant="outline" onClick={() => navigate('/medications')}>
          {t('patientHome.prises_add_treatment')}
        </Button>
        <AiHint type="button" onClick={() => openAiAssistant({ message: t('patientHome.ai_prises_prompt') })}>
          <Bot size={18} />
          <span>{t('patientHome.prises_ai_help')}</span>
        </AiHint>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Header>
        <div>
          <h2><Pill size={18} /> {t('patientHome.prises_title')}</h2>
          <p>{t('prises.progress', { taken, total })}</p>
        </div>
        <ViewAll type="button" onClick={() => navigate('/prises')}>
          {t('patientHome.prises_view_all')} <ChevronRight size={14} />
        </ViewAll>
      </Header>

      <ProgressBar $percent={percent}><div /></ProgressBar>

      {shown.map((prise) => (
        <PriseRow key={prise.prise_programmee_id}>
          <div className="info">
            <strong>{prise.nom_medicament} {prise.dosage}</strong>
            <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {formatHeurePrise(prise.heure_prevue)}</span>
          </div>
          <Button
            size="sm"
            variant="success"
            icon={CheckCircle}
            onClick={() => handleConfirm(prise.prise_programmee_id)}
            disabled={confirmerMutation.isPending}
          >
            {t('prises.confirm')}
          </Button>
        </PriseRow>
      ))}

      {pending.length > 3 && (
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
          {t('patientHome.prises_more', { count: pending.length - 3 })}
        </p>
      )}

      <AiHint type="button" onClick={() => openAiAssistant({ message: t('patientHome.ai_prises_prompt') })}>
        <Bot size={18} />
        <span><strong>{t('patientHome.prises_ai_label')}</strong> — {t('patientHome.prises_ai_desc')}</span>
      </AiHint>
    </Wrap>
  );
}
