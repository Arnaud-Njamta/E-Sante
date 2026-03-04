import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useObservanceStats, useRisques, useTendances } from '../hooks/useStats';
import {
  TrendingUp, TrendingDown, BarChart3, Pill, CalendarDays,
  AlertTriangle, Lightbulb, CheckCircle, XCircle, Shield,
  FileDown,
} from 'lucide-react';

/* ─── Styles ─── */
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: fadeIn 0.4s ease both;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  h1 { font-size: 1.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin: 0; display: flex; align-items: center; gap: 10px; }
`;

const MonthPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  svg { width: 16px; height: 16px; color: ${({ theme }) => theme.colors.primary[500]}; }
`;

/* Stats Row */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const StatInfo = styled.div`
  .label { font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 8px; }
  .value { font-size: 2rem; font-weight: 800; color: ${({ theme }) => theme.colors.text}; line-height: 1; }
  .trend { margin-top: 6px; font-size: 0.8rem; font-weight: 500; color: ${({ theme }) => theme.colors.textMuted}; display: flex; align-items: center; gap: 4px; }
  .trend svg { width: 14px; height: 14px; }
  .trend.up { color: #22C55E; }
  .trend.down { color: #EF4444; }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  svg { width: 20px; height: 20px; }
`;

/* Main Grid */
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

/* Risk col */
const RiskCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

/* Risk Gauge */
const GaugeCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  text-align: center;
`;

const GaugeWrap = styled.div`
  width: 160px;
  height: 80px;
  margin: 0 auto 12px;
  position: relative;
  overflow: hidden;
`;

const GaugeSVG = styled.svg`
  width: 160px;
  height: 80px;
`;

const GaugeLabel = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ $c }) => $c};
  margin-bottom: 4px;
`;

const GaugeScore = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const GaugeLegend = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 8px;
`;

/* Observation / Recommendation cards */
const TipCard = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $bg }) => $bg};
  border-left: 3px solid ${({ $border }) => $border};
`;

const TipTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ $c }) => $c};
  margin-bottom: 6px;
  svg { width: 16px; height: 16px; }
`;

const TipBody = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  margin: 0;
`;

/* Trend section */
const TrendSection = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

const TrendHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  h3 { margin: 0; font-weight: 700; font-size: 1rem; }
`;

const TrendValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  .big { font-size: 2rem; font-weight: 800; color: ${({ theme }) => theme.colors.text}; }
  .up  { font-size: 0.9rem; font-weight: 600; color: #22C55E; }
`;

const ChartWrap = styled.div`
  height: 200px;
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

/* Med Performance */
const PerfCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
`;

const PerfTitle = styled.h3`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 ${({ theme }) => theme.spacing[3]};
`;

const PerfItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
`;

const PerfName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  width: 120px;
  flex-shrink: 0;
`;

const PerfBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
`;

const PerfFill = styled.div`
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $c }) => $c};
  width: ${({ $w }) => $w}%;
  transition: width 1s ease;
`;

const PerfValue = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ $c }) => $c};
  width: 40px;
  text-align: right;
`;

/* ─── Helpers ─── */
function getRiskInfo(risqueData) {
  if (!risqueData) return { score: 0, color: '#94A3B8', label: '—' };
  const score = risqueData.score_observance ?? 0;
  let color = '#F59E0B', label = 'Moyen';
  if (score >= 90) { color = '#22C55E'; label = 'Faible'; }
  else if (score < 70) { color = '#EF4444'; label = 'Élevé'; }
  return { score, color, label };
}

function getMedPerfColor(taux) {
  if (taux >= 90) return '#22C55E';
  if (taux >= 70) return '#F59E0B';
  return '#EF4444';
}

/* ─── Component ─── */
export default function AnalyticsPage() {
  const { data: obsData, isLoading: obsLoading, error: obsError } = useObservanceStats({ jours: 30 });
  const { data: risqueData, isLoading: risqueLoading } = useRisques();
  const { data: tendancesData, isLoading: tendancesLoading } = useTendances();

  const riskInfo = getRiskInfo(risqueData);

  // Build stats cards from observance data
  const totalPrises = obsData?.total_prises ?? 0;
  const prisesConfirmees = obsData?.prises_confirmees ?? 0;
  const prisesOubliees = obsData?.prises_oubliees ?? 0;
  const score = obsData?.score ?? 0;

  const statsCards = [
    { label: 'Doses confirmées', value: prisesConfirmees, Icon: CheckCircle, iconBg: '#EFF6FF', iconColor: '#2D7FF9' },
    { label: 'Doses manquées', value: prisesOubliees, Icon: XCircle, iconBg: '#FEF2F2', iconColor: '#EF4444' },
    { label: "Taux d'adhérence", value: `${score}%`, Icon: Shield, iconBg: '#F0FDF4', iconColor: '#22C55E' },
  ];

  // Trend chart data
  const trendData = (tendancesData?.hebdomadaire || []).map((d) => ({
    jour: d.jour || d.date,
    taux: d.score ?? 0,
  }));

  // Patterns from risque data
  const patterns = risqueData?.patterns_oubli || {};
  const recommendations = risqueData?.actions_recommandees || [];

  if (obsLoading && risqueLoading && tendancesLoading) {
    return <Spinner text="Chargement des statistiques…" />;
  }

  if (obsError) {
    return <ErrorState title="Erreur" message="Impossible de charger les statistiques." onRetry={() => window.location.reload()} />;
  }

  const now = new Date();
  const currentMonth = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <>
      <PageHeader>
        <h1>Statistiques d'adhérence</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <MonthPicker><CalendarDays /> {currentMonth}</MonthPicker>
        </div>
      </PageHeader>

      {/* Stats Row */}
      <StatsRow>
        {statsCards.map((s, i) => (
          <StatCard key={s.label} delay={`${0.05 * (i + 1)}s`}>
            <StatInfo>
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
            </StatInfo>
            <StatIcon $bg={s.iconBg} $color={s.iconColor}><s.Icon /></StatIcon>
          </StatCard>
        ))}
      </StatsRow>

      {/* Risk Gauge + Tips */}
      <MainGrid>
        <GaugeCard delay="0.2s">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 12px' }}>Classification de risque</h3>
          <GaugeWrap>
            <GaugeSVG viewBox="0 0 160 80">
              <path d="M 10 75 A 70 70 0 0 1 150 75" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 75 A 70 70 0 0 1 150 75" fill="none" stroke={riskInfo.color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={220 - (riskInfo.score / 100) * 220}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </GaugeSVG>
          </GaugeWrap>
          <GaugeLabel $c={riskInfo.color}>{riskInfo.label}</GaugeLabel>
          <GaugeScore>SCORE: {riskInfo.score}/100</GaugeScore>
          <GaugeLegend>
            <span style={{ color: '#22C55E' }}>FAIBLE</span>
            <span style={{ color: '#F59E0B' }}>MOYEN</span>
            <span style={{ color: '#EF4444' }}>ÉLEVÉ</span>
          </GaugeLegend>
        </GaugeCard>

        <RiskCol>
          {patterns.heure_critique && (
            <TipCard $bg="#FEF3C7" $border="#F59E0B">
              <TipTitle $c="#D97706"><AlertTriangle /> Observation</TipTitle>
              <TipBody>
                Vos doses manquées surviennent principalement autour de {patterns.heure_critique}.
                {patterns.jour_critique && ` Le ${patterns.jour_critique} est le jour le plus à risque.`}
              </TipBody>
            </TipCard>
          )}

          {!patterns.heure_critique && (
            <TipCard $bg="#FEF3C7" $border="#F59E0B">
              <TipTitle $c="#D97706"><AlertTriangle /> Observation</TipTitle>
              <TipBody>Pas encore assez de données pour identifier des patterns d'oubli.</TipBody>
            </TipCard>
          )}

          {recommendations.length > 0 ? (
            <TipCard $bg="#EFF6FF" $border="#2D7FF9">
              <TipTitle $c="#2D7FF9"><Lightbulb /> Recommandation</TipTitle>
              <TipBody>{recommendations[0]}</TipBody>
            </TipCard>
          ) : (
            <TipCard $bg="#EFF6FF" $border="#2D7FF9">
              <TipTitle $c="#2D7FF9"><Lightbulb /> Recommandation</TipTitle>
              <TipBody>Continuez à prendre vos médicaments régulièrement et à programmer des rappels.</TipBody>
            </TipCard>
          )}
        </RiskCol>
      </MainGrid>

      {/* Trend Chart */}
      <TrendSection>
        <Card delay="0.3s" style={{ padding: '1.5rem' }}>
          <TrendHeader>
            <h3>Tendance d'adhérence</h3>
            <TrendValue>
              <span className="big">{score}%</span>
            </TrendValue>
          </TrendHeader>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 8px' }}>Progression sur {obsData?.periode_jours || 30} jours</p>
          <ChartWrap>
            {tendancesLoading ? (
              <Spinner size={24} />
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D7FF9" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2D7FF9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px' }} formatter={(v) => [`${v}%`, 'Adhérence']} />
                  <Area type="monotone" dataKey="taux" stroke="#2D7FF9" strokeWidth={2.5} fill="url(#gradA)"
                    dot={{ r: 4, fill: '#2D7FF9', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', paddingTop: '60px' }}>Pas encore de données de tendance</p>
            )}
          </ChartWrap>
        </Card>

        <PerfCard delay="0.35s">
          <PerfTitle>Résumé</PerfTitle>
          <PerfItem>
            <PerfName>Confirmées</PerfName>
            <PerfBar><PerfFill $c="#22C55E" $w={totalPrises > 0 ? (prisesConfirmees / totalPrises * 100) : 0} /></PerfBar>
            <PerfValue $c="#22C55E">{prisesConfirmees}</PerfValue>
          </PerfItem>
          <PerfItem>
            <PerfName>Oubliées</PerfName>
            <PerfBar><PerfFill $c="#EF4444" $w={totalPrises > 0 ? (prisesOubliees / totalPrises * 100) : 0} /></PerfBar>
            <PerfValue $c="#EF4444">{prisesOubliees}</PerfValue>
          </PerfItem>
          <PerfItem>
            <PerfName>En retard</PerfName>
            <PerfBar><PerfFill $c="#F59E0B" $w={totalPrises > 0 ? ((obsData?.prises_retard ?? 0) / totalPrises * 100) : 0} /></PerfBar>
            <PerfValue $c="#F59E0B">{obsData?.prises_retard ?? 0}</PerfValue>
          </PerfItem>
        </PerfCard>
      </TrendSection>
    </>
  );
}
