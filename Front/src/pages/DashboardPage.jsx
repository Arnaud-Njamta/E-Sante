import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useObservanceStats, useRisques, useTendances } from '../hooks/useStats';
import { usePrisesToday, useConfirmerPrise, useSkipPrise } from '../hooks/usePrises';
import { formatHeurePrise, isPrisePending, isPriseDone } from '../utils/priseHelpers';
import toast from 'react-hot-toast';
import {
  TrendingUp, Heart, Clock, AlertTriangle, ArrowRight,
  Activity, CheckCircle, Pill, Sun, Moon, Sunrise, Sunset,
  ShieldCheck, Camera, Lightbulb, ChevronRight, Zap,
} from 'lucide-react';

/* ─── Keyframes ─── */
const drawCircle = keyframes`
  from { stroke-dashoffset: 283; }
`;

/* ─── Layout ─── */
const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: fadeIn 0.4s ease both;
  h1 { font-size: 1.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin: 0 0 4px; }
  p  { font-size: 0.9rem; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; }
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

/* ── Adherence Ring Card ── */
const AdherenceCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[5]};
  padding: ${({ theme }) => theme.spacing[6]};
`;

const RingWrap = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  flex-shrink: 0;
`;

const RingSVG = styled.svg`
  width: 110px;
  height: 110px;
  transform: rotate(-90deg);
`;

const RingBg = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.colors.neutral[100]};
  stroke-width: 8;
`;

const RingFill = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.colors.primary[500]};
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  stroke-dashoffset: ${({ $offset }) => $offset};
  animation: ${drawCircle} 1.2s ease forwards;
`;

const RingCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary[500]};
  svg { width: 28px; height: 28px; }
`;

const AdherenceInfo = styled.div`
  flex: 1;
  .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${({ theme }) => theme.colors.primary[500]}; margin-bottom: 6px; }
  .value { font-size: 2.5rem; font-weight: 800; color: ${({ theme }) => theme.colors.text}; line-height: 1; }
  .trend  { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #22C55E; margin-top: 6px; font-weight: 500; }
  .trend svg { width: 14px; height: 14px; }
  .sub   { font-size: 0.8rem; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px; }
`;

/* ── Risk Card ── */
const RiskCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[6]};
`;

const RiskHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  h3 { font-size: 0.95rem; font-weight: 600; color: ${({ theme }) => theme.colors.text}; margin: 0; display: flex; align-items: center; gap: 8px; }
  h3 svg { width: 18px; height: 18px; }
`;

const RiskBody = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

/* ── Weekly Bar Chart Card ── */
const ChartCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[6]};
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing[4]};
`;

const ChartWrap = styled.div`
  height: 180px;
`;

/* ── Bottom Grid ── */
const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

/* ── Today's Medications ── */
const MedListTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  h3 { font-size: 1rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin: 0; }
`;

const ViewLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary[500]};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const MedItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]} 0;

  & + & { border-top: 1px solid ${({ theme }) => theme.colors.neutral[100]}; }
`;

const MedStatusDot = styled.div`
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${({ $status, theme }) =>
    $status === 'pris' || $status === 'retard' ? theme.colors.success[100] :
      $status === 'en_attente' ? theme.colors.primary[100] :
        theme.colors.neutral[100]};
  color: ${({ $status, theme }) =>
    $status === 'pris' || $status === 'retard' ? theme.colors.success[600] :
      $status === 'en_attente' ? theme.colors.primary[600] :
        theme.colors.textMuted};
  svg { width: 18px; height: 18px; }
`;

const MedInfo = styled.div`
  flex: 1;
  h4 { margin: 0; font-weight: 600; font-size: 0.9rem; color: ${({ theme }) => theme.colors.text}; }
  p  { margin: 2px 0 0; font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const MedTime = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MedActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
`;

/* ── CTA Cards ── */
const CTACard = styled.div`
  background: linear-gradient(135deg, #2D7FF9, #1A66D9);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  color: white;
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.3s;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const CTAIcon = styled.div`
  width: 44px; height: 44px; border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  svg { width: 22px; height: 22px; }
`;

const CTATitle = styled.h3`
  font-size: 1.1rem; font-weight: 700; margin: 0 0 6px;
`;

const CTADesc = styled.p`
  font-size: 0.85rem; opacity: 0.85; margin: 0 0 ${({ theme }) => theme.spacing[4]};
  line-height: 1.5;
`;

const InsightCard = styled(Card)`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  animation-delay: 0.35s;
`;

const InsightIcon = styled.div`
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: #FEF3C7;
  display: flex; align-items: center; justify-content: center;
  color: #F59E0B;
  svg { width: 20px; height: 20px; }
`;

const InsightText = styled.div`
  h4 { margin: 0; font-size: 0.9rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; }
  p  { margin: 4px 0 0; font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.5; }
`;

/* ─── Counter Hook ─── */
function useCounter(target, dur = 1000) {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!target || target <= 0) { setC(0); return; }
    let s = 0; const inc = target / (dur / 16);
    const t = setInterval(() => {
      s += inc;
      if (s >= target) { setC(target); clearInterval(t); }
      else setC(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [target, dur]);
  return c;
}

/* ─── Helpers ─── */
function getMomentIcon(heure) {
  if (!heure) return Sun;
  const h = parseInt(heure.split(':')[0], 10);
  if (h < 12) return Sunrise;
  if (h < 17) return Sun;
  if (h < 21) return Sunset;
  return Moon;
}

function getRiskBadge(risque) {
  if (!risque) return { color: 'neutral', label: '—' };
  const niveau = risque.niveau || '';
  if (niveau === 'faible') return { color: 'success', label: 'Faible' };
  if (niveau === 'modere') return { color: 'warning', label: 'Modéré' };
  return { color: 'danger', label: 'Élevé' };
}

function getRiskMessage(risque) {
  if (!risque) return 'Chargement des données de risque…';
  const niveau = risque.niveau || '';
  if (niveau === 'faible') return 'Votre risque de non-observance est faible. Continuez comme ça, vous êtes sur la bonne voie !';
  if (niveau === 'modere') return 'Votre risque de non-observance est modéré. Pensez à mettre en place des rappels supplémentaires.';
  return 'Votre risque de non-observance est élevé. Consultez les recommandations ci-dessous.';
}

/* ─── Component ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API hooks
  const { data: obsData, isLoading: obsLoading, error: obsError } = useObservanceStats({ jours: 30 });
  const { data: risqueData, isLoading: risqueLoading } = useRisques();
  const { data: tendancesData, isLoading: tendancesLoading } = useTendances();
  const { data: prisesData, isLoading: prisesLoading, error: prisesError } = usePrisesToday();
  const confirmerMutation = useConfirmerPrise();
  const skipMutation = useSkipPrise();

  // Derived values
  const observanceScore = obsData?.score ?? 0;
  const obs = useCounter(observanceScore);
  const ringOffset = 283 - (283 * observanceScore / 100);

  // Build bar chart data from tendances
  const barData = (tendancesData?.hebdomadaire || []).map((d) => ({
    jour: d.jour || d.date,
    taux: d.score ?? 0,
  }));

  // Today's prises (limit to first 5 for dashboard)
  const prisesToday = Array.isArray(prisesData) ? prisesData.slice(0, 5) : [];

  const handleConfirm = (priseId) => {
    confirmerMutation.mutate({ id: priseId, statut: 'pris' }, {
      onSuccess: () => toast.success('Prise confirmée avec succès'),
      onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la confirmation'),
    });
  };

  const handleSkip = (priseId) => {
    skipMutation.mutate(priseId, {
      onSuccess: () => toast('Prise reportée', { icon: '⏭️' }),
      onError: () => toast.error('Erreur lors du report'),
    });
  };

  const risqueBadge = getRiskBadge(risqueData);

  if (obsLoading && prisesLoading) {
    return <Spinner text="Chargement du tableau de bord…" />;
  }

  return (
    <>
      <PageHeader>
        <h1>Bonjour, {user?.prenom || 'Patient'}</h1>
        <p>Voici votre aperçu d'observance pour aujourd'hui.</p>
      </PageHeader>

      {/* ── Top row ── */}
      <TopGrid>
        <AdherenceCard delay="0.05s">
          <RingWrap>
            <RingSVG viewBox="0 0 100 100">
              <RingBg cx="50" cy="50" r="45" />
              <RingFill cx="50" cy="50" r="45" $offset={ringOffset} />
            </RingSVG>
            <RingCenter><Heart /></RingCenter>
          </RingWrap>
          <AdherenceInfo>
            <div className="label">Observance globale</div>
            <div className="value">{obs}%</div>
            {obsData?.total_prises > 0 && (
              <div className="sub">
                {obsData.prises_confirmees} / {obsData.total_prises} prises confirmées
              </div>
            )}
            <div className="sub">{obsData?.periode_jours || 30} derniers jours</div>
          </AdherenceInfo>
        </AdherenceCard>

        <RiskCard delay="0.1s">
          <RiskHeader>
            <h3><ShieldCheck /> Indicateur de risque</h3>
            <Badge color={risqueBadge.color}>{risqueBadge.label}</Badge>
          </RiskHeader>
          <RiskBody>
            {getRiskMessage(risqueData)}
          </RiskBody>
        </RiskCard>

        <ChartCard delay="0.15s">
          <ChartTitle>Tendance hebdomadaire</ChartTitle>
          <ChartWrap>
            {tendancesLoading ? (
              <Spinner size={24} />
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px' }} formatter={(v) => [`${v}%`, 'Observance']} />
                  <Bar dataKey="taux" fill="#2D7FF9" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', paddingTop: '40px' }}>Pas encore de données</p>
            )}
          </ChartWrap>
        </ChartCard>
      </TopGrid>

      {/* ── Bottom ── */}
      <BottomGrid>
        {/* Today's Medications */}
        <Card delay="0.2s" style={{ padding: '1.5rem' }}>
          <MedListTitle>
            <h3>Médicaments du jour</h3>
            <ViewLink onClick={() => navigate('/prises')}>Voir le planning</ViewLink>
          </MedListTitle>

          {prisesLoading ? (
            <Spinner size={24} text="Chargement des prises…" />
          ) : prisesToday.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', padding: '2rem 0' }}>Aucune prise programmée aujourd'hui</p>
          ) : (
            prisesToday.map((prise) => {
              const MomentIcon = getMomentIcon(prise.heure_prevue);
              const done = isPriseDone(prise.statut);
              const pending = isPrisePending(prise.statut);
              return (
                <MedItem key={prise.prise_programmee_id}>
                  <MedStatusDot $status={prise.statut}>
                    {done ? <CheckCircle /> : pending ? <Clock /> : <Moon />}
                  </MedStatusDot>
                  <MedInfo>
                    <h4>{prise.nom_medicament} {prise.dosage}</h4>
                    <p>
                      {prise.forme || ''}
                      {prise.statut === 'pris' && prise.date_heure_reelle && ` · Prise à ${new Date(prise.date_heure_reelle).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                      {prise.statut === 'en_attente' && ' · Prochaine dose'}
                      {prise.statut === 'oublie' && ' · Oubliée'}
                      {prise.statut === 'reporte' && ' · Reportée — à confirmer'}
                    </p>
                    {pending && (
                      <MedActionRow>
                        <Button size="sm" variant="success" icon={CheckCircle} onClick={() => handleConfirm(prise.prise_programmee_id)} disabled={confirmerMutation.isPending}>Confirmer</Button>
                        <Button size="sm" variant="outline" onClick={() => handleSkip(prise.prise_programmee_id)} disabled={skipMutation.isPending}>Reporter</Button>
                      </MedActionRow>
                    )}
                  </MedInfo>
                  <MedTime>{formatHeurePrise(prise.heure_prevue)}</MedTime>
                </MedItem>
              );
            })
          )}
        </Card>

        {/* Right column: CTA + Insight */}
        <div>
          <CTACard>
            <CTAIcon><Camera /></CTAIcon>
            <CTATitle>Scanner une ordonnance</CTATitle>
            <CTADesc>Ajoutez instantanément vos médicaments grâce à l'analyse de votre ordonnance.</CTADesc>
            <Button
              variant="secondary"
              size="sm"
              style={{ background: 'white', color: '#2D7FF9', fontWeight: 600 }}
              onClick={() => navigate('/ordonnances')}
            >
              Commencer le scan
            </Button>
          </CTACard>

          {risqueData?.actions_recommandees?.length > 0 && (
            <InsightCard delay="0.35s">
              <InsightIcon><Lightbulb /></InsightIcon>
              <InsightText>
                <h4>Recommandation</h4>
                <p>{risqueData.actions_recommandees[0]}</p>
              </InsightText>
            </InsightCard>
          )}

          {!risqueData?.actions_recommandees?.length && (
            <InsightCard delay="0.35s">
              <InsightIcon><Lightbulb /></InsightIcon>
              <InsightText>
                <h4>Conseil d'observance</h4>
                <p>Pensez à prendre vos médicaments à heure fixe et à programmer des rappels pour ne rien oublier !</p>
              </InsightText>
            </InsightCard>
          )}
        </div>
      </BottomGrid>
    </>
  );
}
