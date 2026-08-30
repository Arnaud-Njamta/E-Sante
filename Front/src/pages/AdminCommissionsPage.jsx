import React from 'react';
import styled from 'styled-components';
import { BarChart3, Wallet, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useAdminFinance, useAdminTransactions, useTraiterReversements } from '../hooks/usePaiement';
import toast from 'react-hot-toast';
import { CAMEROON_COLORS } from '../config/cameroonHealth';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const Kpi = styled(Card)`
  padding: 20px;
  h4 { margin: 0 0 4px; font-size: 0.8rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; }
  p { margin: 0; font-size: 1.5rem; font-weight: 700; color: ${CAMEROON_COLORS.greenDark}; }
`;

const Badge = styled.span`
  padding: 3px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 600;
  background: ${({ $c }) => `${$c}22`};
  color: ${({ $c }) => $c};
`;

const STATUT_PAY = { en_attente: '#F59E0B', paye: '#22C55E', annule: '#94A3B8' };
const STATUT_REV = { reverse: '#22C55E', en_attente: '#F59E0B', echec: '#EF4444', non_applicable: '#94A3B8' };

export default function AdminCommissionsPage() {
  const { data: resume, isLoading, error, refetch } = useAdminFinance();
  const { data: txData, refetch: refetchTx } = useAdminTransactions({ limit: 40 });
  const traiter = useTraiterReversements();

  const handleReversements = async () => {
    try {
      const result = await traiter.mutateAsync();
      toast.success(result.message || 'Reversements traités');
      refetch();
      refetchTx();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger les finances" onRetry={refetch} />;

  const txs = txData?.transactions || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 8px' }}><BarChart3 size={24} style={{ verticalAlign: 'middle' }} /> Finances & commissions</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Volume, commissions DjamSanté et reversements Mobile Money</p>
        </div>
        <Button onClick={handleReversements} disabled={traiter.isPending}>
          <RefreshCw size={16} /> Lancer les reversements
        </Button>
      </div>

      <Grid>
        <Kpi>
          <h4><TrendingUp size={14} /> Volume total</h4>
          <p>{(resume?.total_volume_fcfa || 0).toLocaleString('fr-FR')} FCFA</p>
        </Kpi>
        <Kpi>
          <h4>Commissions DjamSanté</h4>
          <p>{(resume?.total_commissions_fcfa || 0).toLocaleString('fr-FR')} FCFA</p>
        </Kpi>
        <Kpi>
          <h4><Wallet size={14} /> Reversé aux pros</h4>
          <p>{(resume?.reversements?.total_reverse_fcfa || 0).toLocaleString('fr-FR')} FCFA</p>
        </Kpi>
        <Kpi>
          <h4>Paiements reçus</h4>
          <p>{resume?.paiements?.paye || 0}</p>
        </Kpi>
        <Kpi>
          <h4>En attente paiement</h4>
          <p style={{ color: '#B45309' }}>{resume?.paiements?.en_attente || 0}</p>
        </Kpi>
        <Kpi>
          <h4>Reversements en attente</h4>
          <p style={{ color: '#B45309' }}>{resume?.reversements?.en_attente || 0}</p>
        </Kpi>
      </Grid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Consultations</h3>
          <p style={{ margin: 0 }}>{resume?.par_type?.consultation?.count || 0} transactions</p>
          <p style={{ margin: '4px 0 0', color: '#64748B' }}>
            Volume : {(resume?.par_type?.consultation?.volume || 0).toLocaleString('fr-FR')} FCFA —
            Commission : {(resume?.par_type?.consultation?.commission || 0).toLocaleString('fr-FR')} FCFA
          </p>
        </Card>
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Pharmacie</h3>
          <p style={{ margin: 0 }}>{resume?.par_type?.pharmacie?.count || 0} transactions</p>
          <p style={{ margin: '4px 0 0', color: '#64748B' }}>
            Volume : {(resume?.par_type?.pharmacie?.volume || 0).toLocaleString('fr-FR')} FCFA —
            Commission : {(resume?.par_type?.pharmacie?.commission || 0).toLocaleString('fr-FR')} FCFA
          </p>
        </Card>
      </div>

      {(resume?.reversements?.echec || 0) > 0 && (
        <div style={{ padding: 12, background: '#FEF2F2', borderRadius: 10, marginBottom: 20, color: '#991B1B', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ verticalAlign: 'middle' }} /> {resume.reversements.echec} reversement(s) en échec — vérifiez les coordonnées Mobile Money des professionnels.
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 700 }}>Dernières transactions</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Date</th>
                <th style={{ padding: 12 }}>Patient</th>
                <th style={{ padding: 12 }}>Bénéficiaire</th>
                <th style={{ padding: 12 }}>Montant</th>
                <th style={{ padding: 12 }}>Commission</th>
                <th style={{ padding: 12 }}>Paiement</th>
                <th style={{ padding: 12 }}>Reversement</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>Aucune transaction</td></tr>
              ) : txs.map((t) => (
                <tr key={t.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 12 }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={{ padding: 12 }}>{t.patient?.prenom} {t.patient?.nom}</td>
                  <td style={{ padding: 12 }}>{t.beneficiaire_label}</td>
                  <td style={{ padding: 12 }}>{Number(t.montant_brut_fcfa).toLocaleString()} FCFA</td>
                  <td style={{ padding: 12, color: CAMEROON_COLORS.greenDark }}>{Number(t.commission_fcfa).toLocaleString()} FCFA</td>
                  <td style={{ padding: 12 }}>
                    <Badge $c={STATUT_PAY[t.statut_paiement] || '#64748B'}>{t.statut_paiement}</Badge>
                  </td>
                  <td style={{ padding: 12 }}>
                    <Badge $c={STATUT_REV[t.statut_reversement] || '#64748B'}>{t.statut_reversement || '—'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
