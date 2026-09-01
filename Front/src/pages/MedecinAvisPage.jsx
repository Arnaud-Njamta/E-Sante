import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useMedecinDashboard } from '../hooks/useDashboards';

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
  p { color: ${({ theme }) => theme.colors.textSecondary }; margin: 0; }
`;

export default function MedecinAvisPage() {
  const { data, isLoading, error, refetch } = useMedecinDashboard();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger vos avis" onRetry={refetch} />;

  const { stats, avis_recents, repartition_notes } = data;

  return (
    <div>
      <PageHeader>
        <h1><Star size={26} /> Mes avis patients</h1>
        <p>Note moyenne : {stats?.note_moyenne ?? '—'} / 5 — {stats?.nombre_avis ?? 0} avis</p>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Répartition</h3>
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 20 }}>{n}★</span>
              <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${stats?.nombre_avis ? (repartition_notes[n] / stats.nombre_avis) * 100 : 0}%`,
                  height: '100%',
                  background: '#F59E0B',
                  borderRadius: 4,
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', width: 24 }}>{repartition_notes[n] || 0}</span>
            </div>
          ))}
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 8px' }}>Synthèse</h3>
          <StarRating rating={stats?.note_moyenne} count={stats?.nombre_avis} size={22} />
          <p style={{ marginTop: 12, fontSize: '0.9rem', color: '#64748B' }}>
            Les patients peuvent noter après un rendez-vous confirmé ou terminé.
          </p>
        </Card>
      </div>

      <Card style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Tous les avis</h3>
        {avis_recents?.length > 0 ? avis_recents.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '14px 0' }}>
            <StarRating rating={a.note} showCount={false} size={16} />
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem' }}>{a.commentaire || 'Sans commentaire'}</p>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : ''}
            </span>
          </div>
        )) : (
          <p style={{ color: '#94A3B8' }}>Aucun avis pour le moment.</p>
        )}
      </Card>
    </div>
  );
}
