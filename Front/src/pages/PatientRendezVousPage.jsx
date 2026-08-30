import React, { useState } from 'react';
import { Calendar, X, Video, MapPin, Check, RefreshCw, CreditCard, CheckCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PaymentModal from '../components/ui/PaymentModal';
import { useMesRendezVous, useAnnulerRdv, useRepondreContreProposition } from '../hooks/useRendezVous';
import { getRecuUrl } from '../hooks/usePaiement';
import toast from 'react-hot-toast';

const TYPE_LABELS = { presentiel: 'Présentiel', teleconsultation: 'Téléconsultation' };

const STATUT_LABELS = {
  en_attente: 'En attente de validation',
  confirme: 'Confirmé',
  contre_proposition: 'Contre-proposition reçue',
  annule: 'Annulé',
  termine: 'Terminé',
  absent: 'Absent',
};

export default function PatientRendezVousPage() {
  const navigate = useNavigate();
  const { data: rdvs, isLoading, error, refetch } = useMesRendezVous();
  const annuler = useAnnulerRdv();
  const repondre = useRepondreContreProposition();
  const [paiement, setPaiement] = useState(null);

  const handleAnnuler = async (id) => {
    try {
      await annuler.mutateAsync(id);
      toast.success('Rendez-vous annulé');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleReponse = async (id, accepter) => {
    try {
      await repondre.mutateAsync({ id, accepter });
      toast.success(accepter ? 'Nouveau créneau confirmé !' : 'Contre-proposition refusée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Erreur" onRetry={refetch} />;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Calendar size={24} style={{ verticalAlign: 'middle' }} /> Mes rendez-vous</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Consultations présentielles et téléconsultations</p>

      {!rdvs?.length ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          Aucun rendez-vous. Trouvez un médecin dans l&apos;annuaire santé.
        </Card>
      ) : rdvs.map((rdv) => (
        <Card key={rdv.id} style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</strong>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                {rdv.date_rdv} à {rdv.heure_debut} —{' '}
                {rdv.type_consultation === 'teleconsultation'
                  ? <><Video size={14} style={{ verticalAlign: 'middle' }} /> {TYPE_LABELS.teleconsultation}</>
                  : <><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {TYPE_LABELS.presentiel}</>}
              </p>
              <span style={{
                fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12,
                background: rdv.statut === 'contre_proposition' ? '#E0E7FF' : '#F1F5F9',
                color: rdv.statut === 'contre_proposition' ? '#3730A3' : '#475569',
              }}>
                {STATUT_LABELS[rdv.statut] || rdv.statut}
              </span>
              {rdv.transaction && (
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>
                  {rdv.transaction.statut_paiement === 'paye' ? (
                    <span style={{ color: '#047857' }}><CheckCircle size={12} style={{ verticalAlign: 'middle' }} /> Payé — {Number(rdv.transaction.montant_brut_fcfa).toLocaleString()} FCFA</span>
                  ) : rdv.transaction.montant_brut_fcfa > 0 ? (
                    <span style={{ color: '#B45309' }}>Paiement en attente — {Number(rdv.transaction.montant_brut_fcfa).toLocaleString()} FCFA</span>
                  ) : null}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rdv.transaction?.statut_paiement === 'en_attente' && rdv.transaction.montant_brut_fcfa > 0 && (
                <Button size="sm" onClick={() => setPaiement({
                  referenceType: 'rendez_vous',
                  referenceId: rdv.id,
                  transaction: rdv.transaction,
                  titre: `Consultation Dr. ${rdv.medecin?.prenom} ${rdv.medecin?.nom}`,
                })}
                >
                  <CreditCard size={14} /> Payer
                </Button>
              )}
              {rdv.transaction?.statut_paiement === 'paye' && rdv.transaction?.id && (
                <Button size="sm" variant="secondary" onClick={() => window.open(getRecuUrl(rdv.transaction.id), '_blank')}>
                  <Download size={14} /> Reçu
                </Button>
              )}
              {rdv.statut === 'confirme' && rdv.type_consultation === 'teleconsultation' && rdv.lien_video && (
                <Button onClick={() => navigate(`/rendez-vous/${rdv.id}/video`)}>
                  <Video size={14} /> Rejoindre
                </Button>
              )}
              {['en_attente', 'confirme'].includes(rdv.statut) && (
                <Button variant="secondary" onClick={() => handleAnnuler(rdv.id)}><X size={14} /> Annuler</Button>
              )}
            </div>
          </div>

          {rdv.statut === 'contre_proposition' && rdv.date_proposee && (
            <div style={{
              marginTop: 14, padding: 14, borderRadius: 10,
              background: '#EEF2FF', border: '1px solid #C7D2FE',
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#3730A3' }}>
                <RefreshCw size={14} style={{ verticalAlign: 'middle' }} /> Le médecin propose un autre créneau
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>
                <strong>Nouveau créneau :</strong> {rdv.date_proposee} à {rdv.heure_debut_proposee}
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#64748B' }}>
                Créneau demandé initialement : {rdv.date_rdv} à {rdv.heure_debut}
              </p>
              {rdv.message_contre_proposition && (
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  « {rdv.message_contre_proposition} »
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Button size="sm" onClick={() => handleReponse(rdv.id, true)}>
                  <Check size={14} /> Accepter le nouveau créneau
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleReponse(rdv.id, false)}>
                  <X size={14} /> Refuser
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
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
