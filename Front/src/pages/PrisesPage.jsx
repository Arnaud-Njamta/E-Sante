import React from 'react';
import styled from 'styled-components';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { usePrisesToday, useConfirmerPrise, useSkipPrise } from '../hooks/usePrises';
import toast from 'react-hot-toast';
import {
  Check, SkipForward, Sunrise, Sun, Sunset, Moon,
  Clock, Pill, Timer, CheckCircle2,
} from 'lucide-react';

/* ─── Helpers ─── */
function getMoment(heure) {
  if (!heure) return { label: 'Autre', Icon: Sun, color: '#94A3B8' };
  const h = parseInt(heure.split(':')[0], 10);
  if (h < 12) return { label: 'Matin', Icon: Sunrise, color: '#F59E0B' };
  if (h < 17) return { label: 'Midi', Icon: Sun, color: '#F59E0B' };
  if (h < 21) return { label: 'Soir', Icon: Sunset, color: '#EF4444' };
  return { label: 'Coucher', Icon: Moon, color: '#6366F1' };
}

function groupPrisesByMoment(prises) {
  const groups = {};
  for (const prise of prises) {
    const moment = getMoment(prise.heure_prevue);
    const key = moment.label;
    if (!groups[key]) {
      groups[key] = { moment: key, Icon: moment.Icon, heure: prise.heure_prevue, color: moment.color, prises: [] };
    }
    groups[key].prises.push(prise);
  }
  return Object.values(groups);
}

/* ─── Styles ─── */
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
  background: ${({ $done, $color, theme }) =>
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
  const { data: prisesData, isLoading, error } = usePrisesToday();
  const confirmerMutation = useConfirmerPrise();
  const skipMutation = useSkipPrise();

  const allPrises = Array.isArray(prisesData) ? prisesData : [];
  const groups = groupPrisesByMoment(allPrises);

  const totalPrises = allPrises.length;
  const takenPrises = allPrises.filter((p) => p.statut === 'pris' || p.statut === 'retard').length;
  const percent = totalPrises > 0 ? Math.round((takenPrises / totalPrises) * 100) : 0;

  const handleConfirm = (id) => {
    confirmerMutation.mutate({ id, statut: 'pris' }, {
      onSuccess: () => toast.success('Prise confirmée avec succès'),
      onError: () => toast.error('Erreur lors de la confirmation'),
    });
  };

  const handleSkip = (id) => {
    skipMutation.mutate(id, {
      onSuccess: () => toast('Prise reportée', { icon: '⏭️' }),
      onError: () => toast.error('Erreur lors du report'),
    });
  };

  if (isLoading) return <Spinner text="Chargement des prises du jour…" />;
  if (error) return <ErrorState title="Erreur" message="Impossible de charger les prises." onRetry={() => window.location.reload()} />;

  if (allPrises.length === 0) {
    return (
      <>
        <PageHeader>
          <TitleIcon><Timer /></TitleIcon>
          <TitleText>
            <h1>Prises du jour</h1>
            <p>Suivez et confirmez vos prises médicamenteuses</p>
          </TitleText>
        </PageHeader>
        <EmptyState
          icon={Pill}
          title="Aucune prise aujourd'hui"
          description="Vous n'avez aucun traitement actif programmé pour aujourd'hui. Ajoutez un traitement pour commencer."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <TitleIcon><Timer /></TitleIcon>
        <TitleText>
          <h1>Prises du jour</h1>
          <p>Suivez et confirmez vos prises médicamenteuses</p>
        </TitleText>
      </PageHeader>

      <ProgressText>
        <strong>{takenPrises}</strong> / {totalPrises} prises confirmées
      </ProgressText>
      <ProgressBarContainer>
        <ProgressBarFill $percent={percent} />
      </ProgressBarContainer>

      {groups.map((group, index) => {
        const allDone = group.prises.every((p) => p.statut === 'pris' || p.statut === 'retard');
        const GroupIcon = group.Icon;

        return (
          <TimelineGroup key={group.moment} $delay={`${0.1 * (index + 1)}s`}>
            <GroupHeader>
              <TimelineDot $done={allDone} $color={group.color}>
                {allDone ? <CheckCircle2 /> : <GroupIcon />}
              </TimelineDot>
              <GroupTitle>
                <h3>{group.moment}</h3>
                <span>{group.heure ? group.heure.replace(':', 'h') : ''}</span>
              </GroupTitle>
              {allDone && <Badge color="success" dot>Complété</Badge>}
            </GroupHeader>

            <PriseCards>
              {group.prises.map((prise) => {
                const isDone = prise.statut === 'pris' || prise.statut === 'retard';
                return (
                  <PriseCard key={prise.prise_programmee_id} $done={isDone}>
                    <PriseMedName>
                      <Pill />
                      {prise.nom_medicament} {prise.dosage}
                    </PriseMedName>
                    <PriseActions>
                      {isDone ? (
                        <Badge color="success" dot>Prise</Badge>
                      ) : prise.statut === 'oublie' ? (
                        <Badge color="danger" dot>Oubliée</Badge>
                      ) : prise.statut === 'reporte' ? (
                        <Badge color="warning" dot>Reportée</Badge>
                      ) : (
                        <>
                          <Button size="sm" variant="success" icon={Check} onClick={() => handleConfirm(prise.prise_programmee_id)} disabled={confirmerMutation.isPending}>
                            Confirmer
                          </Button>
                          <Button size="sm" variant="ghost" icon={SkipForward} onClick={() => handleSkip(prise.prise_programmee_id)} disabled={skipMutation.isPending}>
                            Sauter
                          </Button>
                        </>
                      )}
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
