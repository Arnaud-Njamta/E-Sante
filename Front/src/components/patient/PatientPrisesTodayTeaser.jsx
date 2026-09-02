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
  padding: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.primary[100]};
`;

const Top = styled.div`
  padding: 16px 18px 12px;
  background: ${({ theme }) => theme.colors.primary[600]};
  color: white;

  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.78rem;
    opacity: 0.9;
  }
`;

const ViewAll = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
`;

const ProgressWrap = styled.div`
  padding: 0 18px;
  margin-top: -1px;
  background: ${({ theme }) => theme.colors.primary[600]};
  padding-bottom: 14px;
`;

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;

  div {
    height: 100%;
    width: ${({ $percent }) => $percent}%;
    background: white;
    border-radius: 999px;
    transition: width 0.4s ease;
  }
`;

const Body = styled.div`
  padding: 4px 18px 16px;
`;

const PriseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child { border-bottom: none; padding-bottom: 0; }

  .info {
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      font-size: 0.95rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
    }

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font-size: 0.78rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

const EmptyBody = styled.div`
  padding: 18px;
  text-align: center;

  p {
    margin: 0 0 14px;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

const AiRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 36px);
  margin: 0 18px 16px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.primary[200]};
  background: ${({ theme }) => theme.colors.primary[50]};
  cursor: pointer;
  text-align: left;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong { color: ${({ theme }) => theme.colors.primary[700]}; }
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
      <Wrap style={{ padding: 24 }}>
        <Spinner size={22} text={t('prises.loading')} />
      </Wrap>
    );
  }

  if (total === 0) {
    return (
      <Wrap>
        <Top>
          <h3><Pill size={18} /> {t('patientHome.prises_title')}</h3>
        </Top>
        <EmptyBody>
          <p>{t('patientHome.prises_empty')}</p>
          <Button size="sm" onClick={() => navigate('/medications')}>
            {t('patientHome.prises_add_treatment')}
          </Button>
        </EmptyBody>
        <AiRow type="button" onClick={() => openAiAssistant({ message: t('patientHome.ai_prises_prompt') })}>
          <Bot size={18} />
          <span>{t('patientHome.prises_ai_help')}</span>
        </AiRow>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Top>
        <div className="row">
          <div>
            <h3><Pill size={18} /> {t('patientHome.prises_title')}</h3>
            <p>{t('prises.progress', { taken, total })}</p>
          </div>
          <ViewAll type="button" onClick={() => navigate('/prises')}>
            {t('patientHome.prises_view_all')} <ChevronRight size={12} />
          </ViewAll>
        </div>
      </Top>

      <ProgressWrap>
        <ProgressBar $percent={percent}><div /></ProgressBar>
      </ProgressWrap>

      <Body>
        {shown.map((prise) => (
          <PriseRow key={prise.prise_programmee_id}>
            <div className="info">
              <strong>{prise.nom_medicament} {prise.dosage}</strong>
              <span><Clock size={13} /> {formatHeurePrise(prise.heure_prevue)}</span>
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
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: '#64748B', textAlign: 'center' }}>
            {t('patientHome.prises_more', { count: pending.length - 3 })}
          </p>
        )}
      </Body>

      <AiRow type="button" onClick={() => openAiAssistant({ message: t('patientHome.ai_prises_prompt') })}>
        <Bot size={18} />
        <span><strong>{t('patientHome.prises_ai_label')}</strong> — {t('patientHome.prises_ai_desc')}</span>
      </AiRow>
    </Wrap>
  );
}
