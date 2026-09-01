import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, X, Clock, Video, MapPin, RefreshCw, BookHeart, MessageSquare, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import MedecinCarnetPatientModal from '../components/medecin/MedecinCarnetPatientModal';
import MedecinOrdonnanceModal from '../components/medecin/MedecinOrdonnanceModal';
import {
  useRendezVousMedecin, useUpdateRdvStatut, useProposerContreProposition, useCreneaux,
} from '../hooks/useRendezVous';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RdvCard = styled(Card)`
  padding: 16px; margin-bottom: 12px;
  display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;
  background: ${({ $s }) => ({
    en_attente: '#FEF3C7',
    confirme: '#D1FAE5',
    contre_proposition: '#E0E7FF',
    annule: '#FEE2E2',
    termine: '#E0E7FF',
  }[$s] || '#F1F5F9')};
  color: ${({ $s }) => ({
    en_attente: '#92400E',
    confirme: '#065F46',
    contre_proposition: '#3730A3',
    annule: '#991B1B',
    termine: '#3730A3',
  }[$s] || '#64748B')};
`;

const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
`;

const ModalBox = styled(Card)`
  width: 100%; max-width: 480px; padding: 24px;
`;

const SlotGrid = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;
`;

const SlotBtn = styled.button`
  padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; cursor: pointer;
  border: 1.5px solid ${({ $active }) => ($active ? '#059669' : '#E2E8F0')};
  background: ${({ $active }) => ($active ? '#ECFDF5' : '#fff')};
  color: ${({ $active }) => ($active ? '#047857' : '#334155')};
`;

const STATUT_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  contre_proposition: 'Contre-proposition envoyée',
  annule: 'Annulé',
  termine: 'Terminé',
  absent: 'Absent',
};

export default function MedecinRendezVousPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filtre, setFiltre] = useState('');
  const { data, isLoading, error, refetch } = useRendezVousMedecin({ statut: filtre || undefined });
  const updateStatut = useUpdateRdvStatut();
  const proposerContre = useProposerContreProposition();

  const [modalRdv, setModalRdv] = useState(null);
  const [dateProposee, setDateProposee] = useState('');
  const [heureProposee, setHeureProposee] = useState('');
  const [messageProposition, setMessageProposition] = useState('');

  const [confirmAction, setConfirmAction] = useState(null);
  const [notesPatient, setNotesPatient] = useState('');

  const [carnetPatient, setCarnetPatient] = useState(null);
  const [ordonnanceRdv, setOrdonnanceRdv] = useState(null);

  const { data: creneauxData, isLoading: creneauxLoading } = useCreneaux(user?.id, dateProposee);

  useEffect(() => {
    setHeureProposee('');
  }, [dateProposee]);

  const submitStatut = async (id, statut, notes) => {
    try {
      await updateStatut.mutateAsync({ id, statut, notes_medecin: notes || undefined });
      toast.success(
        statut === 'confirme' ? 'RDV validé — le patient est notifié par e-mail'
          : statut === 'termine' ? 'Consultation terminée'
            : 'Demande refusée',
      );
      setConfirmAction(null);
      setNotesPatient('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const openContreProposition = (rdv) => {
    setModalRdv(rdv);
    setDateProposee('');
    setHeureProposee('');
    setMessageProposition('');
  };

  const submitContreProposition = async () => {
    if (!dateProposee || !heureProposee) {
      toast.error('Choisissez une date et un créneau');
      return;
    }
    try {
      await proposerContre.mutateAsync({
        id: modalRdv.id,
        date_proposee: dateProposee,
        heure_debut_proposee: heureProposee,
        message_contre_proposition: messageProposition || undefined,
      });
      toast.success('Contre-proposition envoyée — le patient est notifié');
      setModalRdv(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger les RDV" onRetry={refetch} />;

  const rdvs = data?.rendez_vous || [];

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Calendar size={24} style={{ verticalAlign: 'middle' }} /> Mes rendez-vous</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>
        Validez, consultez le carnet patient (avec consentement) et communiquez par message.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'en_attente', 'contre_proposition', 'confirme', 'termine', 'annule'].map((s) => (
          <Button key={s || 'all'} variant={filtre === s ? 'primary' : 'secondary'} onClick={() => setFiltre(s)}>
            {s ? (STATUT_LABELS[s] || s) : 'Tous'}
          </Button>
        ))}
      </div>

      {rdvs.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Aucun rendez-vous pour le moment.</Card>
      ) : rdvs.map((rdv) => (
        <RdvCard key={rdv.id}>
          <div>
            <strong>{rdv.patient?.prenom} {rdv.patient?.nom}</strong>
            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
              <Clock size={14} style={{ verticalAlign: 'middle' }} /> {rdv.date_rdv} à {rdv.heure_debut}
              {rdv.type_consultation === 'teleconsultation'
                ? <><Video size={14} /> Téléconsultation</>
                : <><MapPin size={14} /> Présentiel</>}
            </p>
            {rdv.motif && <p style={{ margin: 0, fontSize: '0.8rem' }}>Motif : {rdv.motif}</p>}
            {rdv.statut === 'contre_proposition' && rdv.date_proposee && (
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#4338CA' }}>
                Proposition : {rdv.date_proposee} à {rdv.heure_debut_proposee}
                {rdv.message_contre_proposition && ` — ${rdv.message_contre_proposition}`}
              </p>
            )}
            {rdv.patient?.telephone && <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>📞 {rdv.patient.telephone}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Badge $s={rdv.statut}>{STATUT_LABELS[rdv.statut] || rdv.statut}</Badge>

            {rdv.patient?.id && ['confirme', 'termine'].includes(rdv.statut) && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCarnetPatient({
                    id: rdv.patient.id,
                    name: `${rdv.patient.prenom} ${rdv.patient.nom}`,
                    editable: true,
                  })}
                >
                  <BookHeart size={14} /> Carnet
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setOrdonnanceRdv(rdv)}>
                  <FileText size={14} /> Ordonnance
                </Button>
              </>
            )}

            {rdv.statut === 'en_attente' && (
              <>
                <Button size="sm" onClick={() => setConfirmAction({ rdv, statut: 'confirme' })}>
                  <Check size={14} /> Valider
                </Button>
                <Button size="sm" variant="secondary" onClick={() => openContreProposition(rdv)}>
                  <RefreshCw size={14} /> Contre-proposer
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setConfirmAction({ rdv, statut: 'annule' })}>
                  <X size={14} /> Refuser
                </Button>
              </>
            )}
            {rdv.statut === 'confirme' && (
              <>
                {rdv.type_consultation === 'teleconsultation' && rdv.lien_video && (
                  <Button size="sm" onClick={() => navigate(`/medecin/rendez-vous/${rdv.id}/video`)}>
                    <Video size={14} /> Rejoindre
                  </Button>
                )}
                <Button size="sm" onClick={() => submitStatut(rdv.id, 'termine')}>Terminer</Button>
              </>
            )}
          </div>
        </RdvCard>
      ))}

      {confirmAction && (
        <Modal onClick={() => setConfirmAction(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px' }}>
              {confirmAction.statut === 'confirme' ? 'Confirmer le rendez-vous' : 'Refuser le rendez-vous'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 12 }}>
              {confirmAction.rdv.patient?.prenom} {confirmAction.rdv.patient?.nom} — {confirmAction.rdv.date_rdv} {confirmAction.rdv.heure_debut}
            </p>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <MessageSquare size={14} /> Message au patient (e-mail + notification)
            </label>
            <textarea
              value={notesPatient}
              onChange={(e) => setNotesPatient(e.target.value)}
              placeholder="Ex. Préparez vos derniers examens, arrivez 10 min avant..."
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setConfirmAction(null)}>Annuler</Button>
              <Button
                onClick={() => submitStatut(confirmAction.rdv.id, confirmAction.statut, notesPatient)}
                disabled={updateStatut.isPending}
              >
                Confirmer
              </Button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {modalRdv && (
        <Modal onClick={() => setModalRdv(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px' }}>Contre-proposer un créneau</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B' }}>
              Demande initiale : {modalRdv.date_rdv} à {modalRdv.heure_debut} — {modalRdv.patient?.prenom} {modalRdv.patient?.nom}
            </p>
            <label style={{ fontSize: '0.85rem' }}>Nouvelle date</label>
            <input
              type="date"
              value={dateProposee}
              onChange={(e) => setDateProposee(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }}
            />
            {dateProposee && (
              <>
                <label style={{ fontSize: '0.85rem' }}>Créneau proposé</label>
                {creneauxLoading && <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Chargement...</p>}
                {!creneauxLoading && (creneauxData?.creneaux || []).length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#B45309' }}>Aucun créneau disponible ce jour.</p>
                )}
                <SlotGrid>
                  {(creneauxData?.creneaux || []).map((c) => (
                    <SlotBtn
                      key={c.debut}
                      type="button"
                      $active={heureProposee === c.debut}
                      onClick={() => setHeureProposee(c.debut)}
                    >
                      {c.debut}
                    </SlotBtn>
                  ))}
                </SlotGrid>
              </>
            )}
            <textarea
              placeholder="Message au patient (optionnel)"
              value={messageProposition}
              onChange={(e) => setMessageProposition(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setModalRdv(null)}>Annuler</Button>
              <Button onClick={submitContreProposition} disabled={proposerContre.isPending}>
                Envoyer la proposition
              </Button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {carnetPatient && (
        <MedecinCarnetPatientModal
          patientId={carnetPatient.id}
          patientName={carnetPatient.name}
          editable={carnetPatient.editable}
          onClose={() => setCarnetPatient(null)}
        />
      )}

      {ordonnanceRdv && (
        <MedecinOrdonnanceModal
          rdv={ordonnanceRdv}
          onClose={() => setOrdonnanceRdv(null)}
        />
      )}
    </div>
  );
}
