import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Star, Award, Users, TrendingUp, Stethoscope } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import { useMedecinDashboard } from '../hooks/useDashboards';
import { useAuth } from '../context/AuthContext';
import { parseJsonArray } from '../utils/helpers';

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 4px; }
  p { color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primary[50]};
  color: ${({ theme }) => theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompetenceTag = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.primary[50]};
  color: ${({ theme }) => theme.colors.primary[600]};
  font-size: 0.8rem;
  margin: 4px 4px 4px 0;
`;

export default function MedecinDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useMedecinDashboard();

  if (isLoading) return <Spinner text="Chargement du tableau de bord..." />;
  if (error || !data) return <ErrorState message="Impossible de charger le dashboard" onRetry={refetch} />;

  const { stats, avis_recents, repartition_notes, profil } = data;
  const competences = parseJsonArray(profil?.competences);

  return (
    <div>
      <PageHeader>
        <h1>Tableau de bord — Dr. {user?.prenom} {user?.nom}</h1>
        <p>{profil?.specialite} — {profil?.etablissement?.nom}</p>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon><Star size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Note moyenne</p>
            <strong style={{ fontSize: '1.5rem' }}>{Number(stats?.note_moyenne ?? 5).toFixed(1)}</strong>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon><Users size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Avis patients</p>
            <strong style={{ fontSize: '1.5rem' }}>{stats.nombre_avis}</strong>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon><Award size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Compétences</p>
            <strong style={{ fontSize: '1.5rem' }}>{stats.competences_count}</strong>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon><TrendingUp size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Expérience</p>
            <strong style={{ fontSize: '1.5rem' }}>{stats.annees_experience} ans</strong>
          </div>
        </StatCard>
      </StatsGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}><Stethoscope size={18} style={{ verticalAlign: 'middle' }} /> Mon profil public</h3>
          <p style={{ color: '#64748B', lineHeight: 1.6 }}>{profil?.bio}</p>
          <div style={{ marginTop: 12 }}>
            {(competences).map((c) => <CompetenceTag key={c}>{c}</CompetenceTag>)}
          </div>
          <Button style={{ marginTop: 16 }} onClick={() => navigate('/medecin/profil')}>
            Voir comme un patient
          </Button>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Répartition des notes</h3>
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 20 }}>{n}★</span>
              <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${stats.nombre_avis ? (repartition_notes[n] / stats.nombre_avis) * 100 : 0}%`,
                  height: '100%',
                  background: '#F59E0B',
                  borderRadius: 4,
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', width: 24 }}>{repartition_notes[n] || 0}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Derniers avis patients</h3>
        {avis_recents?.length > 0 ? avis_recents.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
            <StarRating rating={a.note} showCount={false} size={14} />
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>{a.commentaire || 'Sans commentaire'}</p>
          </div>
        )) : (
          <p style={{ color: '#94A3B8' }}>Aucun avis pour le moment — votre profil démarre avec 5 étoiles.</p>
        )}
      </Card>
    </div>
  );
}
