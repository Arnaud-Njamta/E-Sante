import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Calendar, X, Video, MapPin, Check, RefreshCw, CreditCard, CheckCircle, Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PaymentModal from '../components/ui/PaymentModal';
import PatientPageHeader from '../components/patient/PatientPageHeader';
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

const STATUT_COLORS = {
  en_attente: { bg: '#FEF3C7', color: '#B45309' },
  confirme: { bg: '#ECFDF5', color: '#047857' },
  contre_proposition: { bg: '#E0E7FF', color: '#3730A3' },
  annule: { bg: '#F1F5F9', color: '#64748B' },
  termine: { bg: '#F1F5F9', color: '#475569' },
  absent: { bg: '#FEE2E2', color: '#B91C1C' },
};

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const RdvCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: box-shadow ${({ theme }) => theme.transitions.fast};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.radii.xl};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const RdvTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const RdvInfo = styled.div`
  min-width: 0;
  flex: 1;

  strong {
    display: block;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const RdvMeta = styled.p`
  margin: 6px 0 8px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const PaymentNote = styled.p`
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: ${({ $paid }) => ($paid ? '#047857' : '#B45309')};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: ${({ theme }) => theme.spacing[2]};
  }
`;

const CounterOffer = styled.div`
  margin-top: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primary[50]};
  border: 1px solid ${({ theme }) => theme.colors.primary[200]};

  h4 {
    margin: 0 0 8px;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary[800]};
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    margin: 0 0 4px;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  blockquote {
    margin: 8px 0 0;
    font-size: 0.82rem;
    font-style: italic;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const EmptyCard = styled(Card)`
  padding: 48px 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.xl};

  svg {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
    opacity: 0.4;
  }
`;

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
      <PatientPageHeader
        title="Mes rendez-vous"
        subtitle="Consultations présentielles et téléconsultations"
      />

      {!rdvs?.length ? (
        <EmptyCard>
          <Calendar />
          <p>Aucun rendez-vous. Trouvez un médecin dans l&apos;annuaire santé.</p>
          <Button size="sm" style={{ marginTop: 16 }} onClick={() => navigate('/sante?tab=medecins')}>
            Trouver un médecin
          </Button>
        </EmptyCard>
      ) : (
        <List>
          {rdvs.map((rdv) => {
            const st = STATUT_COLORS[rdv.statut] || STATUT_COLORS.en_attente;
            return (
              <RdvCard key={rdv.id}>
                <RdvTop>
                  <RdvInfo>
                    <strong>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</strong>
                    <RdvMeta>
                      {rdv.date_rdv} à {rdv.heure_debut} —{' '}
                      {rdv.type_consultation === 'teleconsultation'
                        ? <><Video size={14} /> {TYPE_LABELS.teleconsultation}</>
                        : <><MapPin size={14} /> {TYPE_LABELS.presentiel}</>}
                    </RdvMeta>
                    <StatusBadge $bg={st.bg} $color={st.color}>
                      {STATUT_LABELS[rdv.statut] || rdv.statut}
                    </StatusBadge>
                    {rdv.transaction && (
                      <PaymentNote $paid={rdv.transaction.statut_paiement === 'paye'}>
                        {rdv.transaction.statut_paiement === 'paye' ? (
                          <><CheckCircle size={12} style={{ verticalAlign: 'middle' }} /> Payé — {Number(rdv.transaction.montant_brut_fcfa).toLocaleString()} FCFA</>
                        ) : rdv.transaction.montant_brut_fcfa > 0 ? (
                          <>Paiement en attente — {Number(rdv.transaction.montant_brut_fcfa).toLocaleString()} FCFA</>
                        ) : null}
                      </PaymentNote>
                    )}
                  </RdvInfo>

                  <Actions>
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
                      <Button variant="secondary" onClick={() => handleAnnuler(rdv.id)}>
                        <X size={14} /> Annuler
                      </Button>
                    )}
                  </Actions>
                </RdvTop>

                {rdv.statut === 'contre_proposition' && rdv.date_proposee && (
                  <CounterOffer>
                    <h4><RefreshCw size={14} /> Le médecin propose un autre créneau</h4>
                    <p><strong>Nouveau créneau :</strong> {rdv.date_proposee} à {rdv.heure_debut_proposee}</p>
                    <p>Créneau demandé initialement : {rdv.date_rdv} à {rdv.heure_debut}</p>
                    {rdv.message_contre_proposition && (
                      <blockquote>« {rdv.message_contre_proposition} »</blockquote>
                    )}
                    <Actions style={{ marginTop: 12 }}>
                      <Button size="sm" onClick={() => handleReponse(rdv.id, true)}>
                        <Check size={14} /> Accepter
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleReponse(rdv.id, false)}>
                        <X size={14} /> Refuser
                      </Button>
                    </Actions>
                  </CounterOffer>
                )}
              </RdvCard>
            );
          })}
        </List>
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
