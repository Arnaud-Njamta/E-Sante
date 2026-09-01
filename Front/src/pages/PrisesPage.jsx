import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { usePrisesToday, useConfirmerPrise, useSkipPrise } from '../hooks/usePrises';
import { formatHeurePrise, isPrisePending, isPriseDone } from '../utils/priseHelpers';
import toast from 'react-hot-toast';
import {
  Check, SkipForward, Sunrise, Sun, Sunset, Moon,
  Pill, Timer, CheckCircle2,
} from 'lucide-react';

function getMoment(heure, t) {
  if (!heure) return { label: t('moments.other'), Icon: Sun, color: '#94A3B8' };
  const h = parseInt(heure.split(':')[0], 10);
  if (h < 12) return { label: t('moments.morning'), Icon: Sunrise, color: '#F59E0B' };
  if (h < 17) return { label: t('moments.noon'), Icon: Sun, color: '#F59E0B' };
  if (h < 21) return { label: t('moments.evening'), Icon: Sunset, color: '#EF4444' };
  return { label: t('moments.bedtime'), Icon: Moon, color: '#6366F1' };
}

function groupPrisesByMoment(prises, t) {
  const groups = {};
  for (const prise of prises) {
    const moment = getMoment(prise.heure_prevue, t);
    const key = moment.label;
    if (!groups[key]) {
      groups[key] = { moment: key, Icon: moment.Icon, heure: prise.heure_prevue, color: moment.color, prises: [] };
    }
    groups[key].prises.push(prise);
  }
  return Object.values(groups);
}

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: fadeIn 0.4s ease both;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TitleIcon = styled.span`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, #F59E0B, #D97706);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  svg { width: 20px; height: 20px; }
`;

const TitleText = styled.div`
  h1 { font-size: ${({ theme }) => theme.typography.sizes['2xl']}; font-weight: ${({ theme }) => theme.typography.weights.bold}; color: ${({ theme }) => theme.colors.text}; margin: 0 0 2px; }
  p { font-size: ${({ theme }) => theme.typography.sizes.sm}; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; }
`;

const ProgressBarContainer = styled.div`
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.radii.full};
  height: 10px;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  overflow: hidden;
  animation: fadeIn 0.5s ease both;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.full};
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary[400]}, ${({ theme }) => theme.colors.success[500]});
  width: ${({ $percent }) => $percent}%;
  transition: width 1s ease;
`;

const ProgressText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  text-align: right;
  strong { color: ${({ theme }) => theme.colors.text}; }
`;

const TimelineGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: fadeInUp 0.4s ease both;
  animation-delay: ${({ $delay }) => $delay};
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const TimelineDot = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $done, theme }) =>
    $done
      ? `linear-gradient(135deg, ${theme.colors.success[400]}, ${theme.colors.success[600]})`
      : theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ $done, theme }) => ($done ? 'white' : theme.colors.textMuted)};
  svg { width: 20px; height: 20px; }
`;

const GroupTitle = styled.div`
  h3 { font-size: ${({ theme }) => theme.typography.sizes.md}; font-weight: ${({ theme }) => theme.typography.weights.semibold}; color: ${({ theme }) => theme.colors.text}; margin: 0; }
  span { font-size: ${({ theme }) => theme.typography.sizes.xs}; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const PriseCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-left: 22px;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  margin-left: 22px;
`;

const PriseCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  ${({ $done, theme }) =>
    $done &&
    `background: ${theme.colors.success[50]}; border-color: ${theme.colors.success[200]};`}
  &:hover { box-shadow: ${({ theme }) => theme.shadows.sm}; }
`;

const PriseMedName = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text};
  svg { width: 16px; height: 16px; color: ${({ theme }) => theme.colors.primary[500]}; }
`;

const PriseActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

export default function PrisesPage() {
  const { t } = useTranslation();
  const { data: prisesData, isLoading, error } = usePrisesToday();
  const confirmerMutation = useConfirmerPrise();
  const skipMutation = useSkipPrise();

  const allPrises = Array.isArray(prisesData) ? prisesData : [];
  const groups = groupPrisesByMoment(allPrises, t);

  const totalPrises = allPrises.length;
  const takenPrises = allPrises.filter((p) => isPriseDone(p.statut)).length;
  const percent = totalPrises > 0 ? Math.round((takenPrises / totalPrises) * 100) : 0;

  const handleConfirm = (id) => {
    confirmerMutation.mutate({ id, statut: 'pris' }, {
      onSuccess: () => toast.success(t('prises.confirmed_toast')),
      onError: (err) => toast.error(err.response?.data?.message || t('prises.confirm_error')),
    });
  };

  const handleSkip = (id) => {
    skipMutation.mutate(id, {
      onSuccess: () => toast(t('prises.skipped_toast'), { icon: '⏭️' }),
      onError: () => toast.error(t('prises.skip_error')),
    });
  };

  if (isLoading) return <Spinner text={t('prises.loading')} />;
  if (error) {
    return (
      <ErrorState
        title={t('prises.error_title')}
        message={t('prises.error_load')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (allPrises.length === 0) {
    return (
      <>
        <PageHeader>
          <TitleIcon><Timer /></TitleIcon>
          <TitleText>
            <h1>{t('prises.title')}</h1>
            <p>{t('prises.subtitle')}</p>
          </TitleText>
        </PageHeader>
        <EmptyState
          icon={Pill}
          title={t('prises.empty_title')}
          description={t('prises.empty_desc')}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <TitleIcon><Timer /></TitleIcon>
        <TitleText>
          <h1>{t('prises.title')}</h1>
          <p>{t('prises.subtitle')}</p>
        </TitleText>
      </PageHeader>

      <ProgressText>
        {t('prises.progress', { taken: takenPrises, total: totalPrises })}
      </ProgressText>
      <ProgressBarContainer>
        <ProgressBarFill $percent={percent} />
      </ProgressBarContainer>

      {groups.map((group, index) => {
        const allDone = group.prises.every((p) => isPriseDone(p.statut));
        const GroupIcon = group.Icon;

        return (
          <TimelineGroup key={group.moment} $delay={`${0.1 * (index + 1)}s`}>
            <GroupHeader>
              <TimelineDot $done={allDone} $color={group.color}>
                {allDone ? <CheckCircle2 /> : <GroupIcon />}
              </TimelineDot>
              <GroupTitle>
                <h3>{group.moment}</h3>
                <span>{formatHeurePrise(group.heure)}</span>
              </GroupTitle>
              {allDone && <Badge color="success" dot>{t('prises.completed')}</Badge>}
            </GroupHeader>

            <PriseCards>
              {group.prises.map((prise) => {
                const isDone = isPriseDone(prise.statut);
                const isPending = isPrisePending(prise.statut);
                return (
                  <PriseCard key={prise.prise_programmee_id} $done={isDone}>
                    <PriseMedName>
                      <Pill />
                      {prise.nom_medicament} {prise.dosage}
                      <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 6 }}>
                        {formatHeurePrise(prise.heure_prevue)}
                      </span>
                    </PriseMedName>
                    <PriseActions>
                      {isDone ? (
                        <Badge color="success" dot>{t('prises.taken')}</Badge>
                      ) : prise.statut === 'oublie' ? (
                        <Badge color="danger" dot>{t('prises.forgotten')}</Badge>
                      ) : prise.statut === 'reporte' ? (
                        <>
                          <Badge color="warning" dot>{t('prises.postponed')}</Badge>
                          <Button size="sm" variant="success" icon={Check} onClick={() => handleConfirm(prise.prise_programmee_id)} disabled={confirmerMutation.isPending}>
                            {t('prises.confirm')}
                          </Button>
                        </>
                      ) : isPending ? (
                        <>
                          <Button size="sm" variant="success" icon={Check} onClick={() => handleConfirm(prise.prise_programmee_id)} disabled={confirmerMutation.isPending}>
                            {t('prises.confirm')}
                          </Button>
                          <Button size="sm" variant="ghost" icon={SkipForward} onClick={() => handleSkip(prise.prise_programmee_id)} disabled={skipMutation.isPending}>
                            {t('prises.skip')}
                          </Button>
                        </>
                      ) : null}
                    </PriseActions>
                  </PriseCard>
                );
              })}
            </PriseCards>
          </TimelineGroup>
        );
      })}
    </>
  );
}
