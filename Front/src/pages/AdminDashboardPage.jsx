import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Users, Stethoscope, Building2, Pill, Hospital, Shield, ScrollText, LogIn,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import { useAdminOverview } from '../hooks/useAdminOverview';
import { Link } from 'react-router-dom';
import { CAMEROON_COLORS } from '../config/cameroonHealth';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const Kpi = styled(Card)`
  padding: 16px;
  h4 {
    margin: 0 0 6px;
    font-size: 0.72rem;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  p { margin: 0; font-size: 1.45rem; font-weight: 700; color: ${CAMEROON_COLORS.greenDark}; }
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Tab = styled.button`
  padding: 8px 14px;
  border-radius: 99px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : theme.colors.surface)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary[700] : theme.colors.textSecondary)};
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
`;

const TableWrap = styled(Card)`
  overflow-x: auto;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  th {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 600;
  background: ${({ $c }) => `${$c}22`};
  color: ${({ $c }) => $c};
`;

const QuickLinks = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  a {
    font-size: 0.84rem;
    color: ${CAMEROON_COLORS.greenDark};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const TYPE_COLORS = {
  patient: '#3B82F6',
  medecin: '#0D9488',
  pharmacie: '#8B5CF6',
  hopital: '#DC2626',
  clinique: '#EC4899',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminOverview();
  const [tab, setTab] = useState('comptes');

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger le tableau de bord admin" onRetry={refetch} />;

  const { stats, recent } = data;
  const comptes = [...(recent.patients || []), ...(recent.medecins || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const etabs = recent.etablissements || [];
  const connexions = recent.connexions || [];

  return (
    <div>
      <PageHeader
        title={<> <Shield size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Tableau de bord admin</>}
        subtitle="Vue d'ensemble des comptes, établissements et connexions sur la plateforme."
      />

      <QuickLinks>
        <Link to="/admin/inscriptions">Validations MINSANTE ({stats.inscriptions_en_attente})</Link>
        <Link to="/admin/audit">Journal complet</Link>
        <Link to="/admin/commissions">Finances</Link>
      </QuickLinks>

      <Grid>
        <Kpi><h4><Users size={14} /> Patients</h4><p>{stats.patients}</p></Kpi>
        <Kpi><h4><Stethoscope size={14} /> Soignants</h4><p>{stats.medecins}</p></Kpi>
        <Kpi><h4><Pill size={14} /> Pharmacies</h4><p>{stats.pharmacies}</p></Kpi>
        <Kpi><h4><Hospital size={14} /> Hôpitaux</h4><p>{stats.hopitaux}</p></Kpi>
        <Kpi><h4><Building2 size={14} /> Cliniques</h4><p>{stats.cliniques}</p></Kpi>
        <Kpi><h4><Shield size={14} /> Dossiers à valider</h4><p>{stats.inscriptions_en_attente}</p></Kpi>
      </Grid>

      <Tabs>
        <Tab $active={tab === 'comptes'} onClick={() => setTab('comptes')}>Comptes récents</Tab>
        <Tab $active={tab === 'etablissements'} onClick={() => setTab('etablissements')}>Établissements</Tab>
        <Tab $active={tab === 'connexions'} onClick={() => setTab('connexions')}>Connexions</Tab>
      </Tabs>

      <TableWrap>
        {tab === 'comptes' && (
          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Créé</th>
              </tr>
            </thead>
            <tbody>
              {comptes.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: '#94A3B8' }}>Aucun compte pour le moment</td></tr>
              ) : comptes.map((c) => (
                <tr key={`${c.type}-${c.id}`}>
                  <td><Badge $c={TYPE_COLORS[c.type] || '#64748B'}>{c.type}</Badge></td>
                  <td>{c.type === 'patient' || c.type === 'medecin' ? `${c.prenom || ''} ${c.nom || ''}`.trim() : c.nom}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.telephone || '—'}</td>
                  <td>{c.statut_validation || 'actif'}</td>
                  <td>{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {tab === 'etablissements' && (
          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Ville</th>
                <th>Email</th>
                <th>Validation</th>
                <th>GPS</th>
              </tr>
            </thead>
            <tbody>
              {etabs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: '#94A3B8' }}>Aucun établissement enregistré</td></tr>
              ) : etabs.map((e) => (
                <tr key={e.id}>
                  <td><Badge $c={TYPE_COLORS[e.type] || '#64748B'}>{e.type}</Badge></td>
                  <td>{e.nom}</td>
                  <td>{e.ville || '—'}{e.region ? ` (${e.region})` : ''}</td>
                  <td>{e.email || '—'}</td>
                  <td>{e.statut_validation}</td>
                  <td>{e.latitude && e.longitude ? 'Oui' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {tab === 'connexions' && (
          <Table>
            <thead>
              <tr>
                <th><LogIn size={12} style={{ verticalAlign: 'middle' }} /> Date</th>
                <th>Email / acteur</th>
                <th>Rôle</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {connexions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 28, color: '#94A3B8' }}>
                    Aucune connexion enregistrée — reconnectez-vous ou demandez à un utilisateur de se connecter.
                  </td>
                </tr>
              ) : connexions.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td>{log.details?.email || log.acteur_label || '—'}</td>
                  <td><Badge $c="#0D9488">{log.details?.role || '—'}</Badge></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrap>

      {tab === 'connexions' && connexions.length > 0 && (
        <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#64748B' }}>
          <ScrollText size={14} style={{ verticalAlign: 'middle' }} />
          {' '}Historique détaillé dans le <Link to="/admin/audit">journal de contrôle</Link> (filtre « Authentification »).
        </p>
      )}
    </div>
  );
}
