import React, { useState } from 'react';
import { Package, X, CheckCircle, MapPin, CreditCard, CheckCircle2, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PaymentModal from '../components/ui/PaymentModal';
import { useMesReservations, useAnnulerReservation } from '../hooks/useReservations';
import { getRecuUrl } from '../hooks/usePaiement';
import toast from 'react-hot-toast';
const STATUT = {
  en_attente: { label: 'En attente', color: '#F59E0B' },
  confirmee: { label: 'Confirmée', color: '#3B82F6' },
  refusee: { label: 'Refusée', color: '#EF4444' },
  prete: { label: 'Prête au retrait', color: '#22C55E' },
  retiree: { label: 'Retirée', color: '#64748B' },
  annulee: { label: 'Annulée', color: '#94A3B8' },
};

const parseLignes = (lignes) => {
  if (Array.isArray(lignes)) return lignes;
  if (typeof lignes === 'string') {
    try { return JSON.parse(lignes); } catch { return []; }
  }
  return [];
};

export default function PatientReservationsPage() {
  const { data: reservations, isLoading, error, refetch } = useMesReservations();
  const annuler = useAnnulerReservation();
  const [paiement, setPaiement] = useState(null);

  const list = Array.isArray(reservations) ? reservations : [];

  const handleAnnuler = async (id) => {
    try {
      await annuler.mutateAsync(id);
      toast.success('Réservation annulée');
    } catch {
      toast.error('Impossible d\'annuler');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger vos réservations" onRetry={refetch} />;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Package size={24} style={{ verticalAlign: 'middle' }} /> Mes réservations</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Demandes de médicaments auprès des pharmacies et dispensaires</p>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Package size={40} style={{ marginBottom: 12 }} />
          <p>Aucune réservation. Parcourez l&apos;annuaire santé et réservez vos médicaments en ligne.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {list.map((r) => {
            const st = STATUT[r.statut] || STATUT.en_attente;
            const lignes = parseLignes(r.lignes);
            return (
              <Card key={r.id} style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <strong>{r.numero_reference}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                      <MapPin size={14} style={{ verticalAlign: 'middle' }} /> {r.etablissement?.nom} — {r.etablissement?.ville}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                    background: `${st.color}22`, color: st.color,
                  }}>
                    {st.label}
                  </span>
                </div>
                <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: '0.9rem' }}>
                  {lignes.map((l, i) => (
                    <li key={i}>
                      {l.nom} × {l.quantite} — {((Number(l.prix_fcfa_unitaire) || 0) * (Number(l.quantite) || 1)).toLocaleString()} FCFA
                    </li>
                  ))}
                </ul>
                <strong style={{ color: '#059669' }}>Total : {Number(r.montant_total_fcfa || 0).toLocaleString()} FCFA</strong>
                {r.transaction && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>
                    {r.transaction.statut_paiement === 'paye' ? (
                      <span style={{ color: '#047857' }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle' }} /> Payé</span>
                    ) : r.transaction.montant_brut_fcfa > 0 ? (
                      <span style={{ color: '#B45309' }}>Paiement en attente</span>
                    ) : null}
                  </p>
                )}
                {r.reponse_etablissement && (
                  <p style={{ margin: '12px 0 0', padding: 12, background: '#F8FAFC', borderRadius: 8, fontSize: '0.85rem' }}>
                    <strong>Réponse :</strong> {r.reponse_etablissement}
                  </p>
                )}
                {r.transaction?.statut_paiement === 'en_attente' && r.transaction.montant_brut_fcfa > 0 && (
                  <Button size="sm" onClick={() => setPaiement({
                    referenceType: 'reservation_dispensaire',
                    referenceId: r.id,
                    transaction: r.transaction,
                    titre: `Réservation ${r.etablissement?.nom}`,
                  })}
                  >
                    <CreditCard size={14} /> Payer
                  </Button>
                )}
                {r.transaction?.statut_paiement === 'paye' && r.transaction?.id && (
                  <Button size="sm" variant="secondary" onClick={() => window.open(getRecuUrl(r.transaction.id), '_blank')}>
                    <Download size={14} /> Reçu
                  </Button>
                )}
                {['en_attente', 'confirmee'].includes(r.statut) && (
                  <Button variant="secondary" size="sm" onClick={() => handleAnnuler(r.id)} style={{ marginTop: 12 }}>
                    <X size={14} /> Annuler
                  </Button>
                )}
                {r.statut === 'prete' && (
                  <p style={{ margin: '12px 0 0', color: '#22C55E', fontSize: '0.85rem' }}>
                    <CheckCircle size={14} style={{ verticalAlign: 'middle' }} /> Votre commande est prête — présentez-vous au dispensaire avec cette référence.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <PaymentModal
        open={!!paiement}
        onClose={() => setPaiement(null)}
        referenceType={paiement?.referenceType}
        referenceId={paiement?.referenceId}
        transaction={paiement?.transaction}
        titre={paiement?.titre}
        onPaid={refetch}
      />
    </div>
  );
}
