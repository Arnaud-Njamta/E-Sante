import React, { useState } from 'react';
import styled from 'styled-components';
import { ScrollText, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import { useAdminAuditLogs } from '../hooks/useAdminAudit';

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.88rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
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
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
  }

  th {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.background};
    position: sticky;
    top: 0;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const ActionBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${({ $variant, theme }) => {
    if ($variant === 'ok') return '#DCFCE7';
    if ($variant === 'warn') return '#FEF3C7';
    if ($variant === 'info') return '#E0E7FF';
    return theme.colors.background;
  }};
  color: ${({ $variant }) => {
    if ($variant === 'ok') return '#166534';
    if ($variant === 'warn') return '#92400E';
    if ($variant === 'info') return '#3730A3';
    return '#44403C';
  }};
`;

const Details = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ACTION_META = {
  inscription_soumise: { label: 'Demande soumise', variant: 'info' },
  inscription_patient: { label: 'Nouveau patient', variant: 'info' },
  inscription_validee: { label: 'Inscription validée', variant: 'ok' },
  inscription_rejetee: { label: 'Inscription rejetée', variant: 'warn' },
  inscription_reinscription: { label: 'Réinscription (email déjà vu)', variant: 'warn' },
  compte_supprime: { label: 'Compte supprimé', variant: 'warn' },
  document_consulte: { label: 'Document consulté', variant: 'info' },
  connexion: { label: 'Connexion', variant: 'ok' },
};

const CATEGORIE_LABELS = {
  inscription: 'Inscription',
  document: 'Document',
  auth: 'Authentification',
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatDetails(log) {
  const d = log.details;
  if (!d) return null;
  const parts = [];
  if (d.type_profil) parts.push(`Profil : ${d.type_profil}`);
  if (d.email) parts.push(d.email);
  if (d.role) parts.push(`Rôle : ${d.role}`);
  if (d.motif_rejet) parts.push(`Motif : ${d.motif_rejet}`);
  if (d.nom_original) parts.push(`Fichier : ${d.nom_original}`);
  if (d.type_fichier) parts.push(`Type : ${d.type_fichier}`);
  if (d.tentatives_anterieures != null) parts.push(`Tentatives antérieures : ${d.tentatives_anterieures}`);
  if (d.reincription) parts.push('Réinscription');
  if (Array.isArray(d.comptes_archives) && d.comptes_archives.length) {
    parts.push(`Comptes archivés : ${d.comptes_archives.length}`);
  }
  if (d.note) parts.push(d.note);
  return parts.length ? parts.join(' · ') : JSON.stringify(d);
}

export default function AdminAuditPage() {
  const [categorie, setCategorie] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const params = { limit, offset };
  if (categorie) params.categorie = categorie;

  const { data, isLoading, error, refetch, isFetching } = useAdminAuditLogs(params);
  const logs = data?.logs || [];
  const total = data?.total || 0;

  if (isLoading && !data) return <Spinner />;
  if (error && !data) {
    const detail = error.response?.data?.message
      || (error.response ? `Erreur ${error.response.status}` : 'API injoignable');
    return (
      <ErrorState
        message={`Impossible de charger le journal. ${detail}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={<> <ScrollText size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Journal de contrôle</>}
        subtitle="Traçabilité des validations MINSANTE, consultations de documents et actions administrateur."
      />

      <Toolbar>
        <Filter size={16} />
        <Select value={categorie} onChange={(e) => { setCategorie(e.target.value); setOffset(0); }}>
          <option value="">Toutes les catégories</option>
          <option value="auth">Connexions</option>
          <option value="inscription">Inscriptions</option>
          <option value="document">Documents</option>
        </Select>
        <Button size="sm" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          Actualiser
        </Button>
        {isFetching && <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Actualisation…</span>}
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Acteur</th>
              <th>Cible</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                  Aucune entrée dans le journal pour le moment.
                </td>
              </tr>
            ) : logs.map((log) => {
              const meta = ACTION_META[log.action] || { label: log.action, variant: 'default' };
              return (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(log.created_at || log.createdAt)}</td>
                  <td>
                    <ActionBadge $variant={meta.variant}>{meta.label}</ActionBadge>
                    <Details>{formatDetails(log)}</Details>
                  </td>
                  <td>{log.acteur_label || '—'}</td>
                  <td>
                    {log.cible_type ? (
                      <>
                        {CATEGORIE_LABELS[log.cible_type] || log.cible_type}
                        <Details>#{log.cible_id?.slice?.(0, 8) || log.cible_id}</Details>
                      </>
                    ) : '—'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.ip || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Footer>
          <span>{total} entrée{total > 1 ? 's' : ''} au total</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
              Précédent
            </Button>
            <Button size="sm" variant="secondary" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
              Suivant
            </Button>
          </div>
        </Footer>
      </TableWrap>
    </div>
  );
}
