import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star, Clock, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import { usePharmacieDashboard } from '../hooks/useDashboards';
import { useAuth } from '../context/AuthContext';

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

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function PharmacieDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = usePharmacieDashboard();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger le dashboard" onRetry={refetch} />;

  const { stats, conversations_recentes, horaires } = data;

  return (
    <div>
      <PageHeader>
        <h1>{user?.nom}</h1>
        <p>{user?.ville} — Tableau de bord officine</p>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon><MessageCircle size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Conversations ouvertes</p>
            <strong style={{ fontSize: '1.5rem' }}>{stats.conversations_ouvertes}</strong>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon><Users size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Messages non lus</p>
            <strong style={{ fontSize: '1.5rem' }}>{stats.messages_non_lus}</strong>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon><Star size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Note moyenne</p>
            <strong style={{ fontSize: '1.5rem' }}>{Number(stats?.note_moyenne ?? 5).toFixed(1)}</strong>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon><Clock size={22} /></StatIcon>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Chat H24</p>
            <strong style={{ fontSize: '1rem', color: stats.chat_actif ? '#22C55E' : '#EF4444' }}>
              {stats.chat_actif ? 'Actif' : 'Inactif'}
            </strong>
          </div>
        </StatCard>
      </StatsGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Conversations récentes</h3>
          {conversations_recentes?.length > 0 ? conversations_recentes.map((c) => (
            <div key={c.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
              <strong style={{ fontSize: '0.9rem' }}>{c.sujet}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                {c.messages?.[0]?.contenu?.slice(0, 80) || 'Nouvelle conversation'}
              </p>
            </div>
          )) : (
            <p style={{ color: '#94A3B8' }}>Aucune conversation pour le moment.</p>
          )}
          <Button style={{ marginTop: 16 }} onClick={() => navigate('/pharmacie/messages')}>
            Voir toutes les conversations
          </Button>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}><Clock size={18} style={{ verticalAlign: 'middle' }} /> Horaires</h3>
          {horaires?.h24 ? (
            <p style={{ color: '#22C55E', fontWeight: 600 }}>Ouvert 24h/24</p>
          ) : (
            JOURS.map((jour) => {
              const h = horaires?.[jour];
              return (
                <div key={jour} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ textTransform: 'capitalize' }}>{jour}</span>
                  <span style={{ color: h?.ouvert ? '#22C55E' : '#EF4444' }}>
                    {h?.ouvert ? `${h.debut} - ${h.fin}` : 'Fermé'}
                  </span>
                </div>
              );
            })
          )}
          <div style={{ marginTop: 16 }}>
            <StarRating rating={stats.note_moyenne} count={stats.nombre_avis} />
          </div>
        </Card>
      </div>
    </div>
  );
}
