import React from 'react';
import { Wallet, Download, CheckCircle, Clock, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useMesPaiements, getRecuUrl } from '../hooks/usePaiement';
import { CAMEROON_COLORS } from '../config/cameroonHealth';

const TYPE_LABELS = { consultation: 'Consultation', pharmacie: 'Pharmacie' };

export default function PatientPaiementsPage() {
  const { data: paiements, isLoading, error, refetch } = useMesPaiements();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger vos paiements" onRetry={refetch} />;

  const list = paiements || [];

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Wallet size={24} style={{ verticalAlign: 'middle' }} /> Mes paiements</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Historique des règlements Mobile Money (consultations & pharmacie)</p>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <FileText size={40} style={{ marginBottom: 12 }} />
          <p>Aucun paiement enregistré pour le moment.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((p) => (
            <Card key={p.id} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: CAMEROON_COLORS.green, textTransform: 'uppercase' }}>
                    {TYPE_LABELS[p.type] || p.type}
                  </span>
                  <h3 style={{ margin: '4px 0' }}>{p.libelle || 'Paiement DjamSanté'}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                    {p.beneficiaire?.label || 'Prestataire'}
                    {p.createdAt && ` — ${new Date(p.createdAt).toLocaleDateString('fr-FR')}`}
                  </p>
                  {p.reference_paiement && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Réf. {p.reference_paiement}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: CAMEROON_COLORS.greenDark }}>
                    {Number(p.montant_brut_fcfa).toLocaleString('fr-FR')} FCFA
                  </p>
                  {p.statut_paiement === 'paye' ? (
                    <span style={{ fontSize: '0.8rem', color: '#047857' }}><CheckCircle size={12} /> Payé</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#B45309' }}><Clock size={12} /> En attente</span>
                  )}
                </div>
              </div>
              {p.statut_paiement === 'paye' && (
                <Button
                  size="sm"
                  variant="secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => window.open(getRecuUrl(p.id), '_blank')}
                >
                  <Download size={14} /> Télécharger le reçu (PDF)
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
