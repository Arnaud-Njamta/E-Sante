import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Calendar, X, Video, MapPin, Check, RefreshCw, CreditCard, CheckCircle, Download, Star, MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PaymentModal from '../components/ui/PaymentModal';
import PatientPageHeader from '../components/patient/PatientPageHeader';
import CancelConfirmModal from '../components/patient/CancelConfirmModal';
import { useMesRendezVous, useAnnulerRdv, useRepondreContreProposition, usePreviewAnnulationRdv } from '../hooks/useRendezVous';
import { useCreerAvis } from '../hooks/useMessagerie';
import { getRecuUrl } from '../hooks/usePaiement';
import { joinTeleconsultation } from '../utils/teleconsultation';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rdvs, isLoading, error, refetch } = useMesRendezVous();
  const annuler = useAnnulerRdv();
  const repondre = useRepondreContreProposition();
  const creerAvis = useCreerAvis();
  const [paiement, setPaiement] = useState(null);
  const [rateRdv, setRateRdv] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { data: cancelPreview, isLoading: previewLoading } = usePreviewAnnulationRdv(cancelTarget, !!cancelTarget);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');

  const TYPE_LABELS = {
    presentiel: t('rdv.type_presentiel'),
    teleconsultation: t('rdv.type_tele'),
  };

  const STATUT_LABELS = {
    en_attente: t('rdv.status_en_attente'),
    confirme: t('rdv.status_confirme'),
    contre_proposition: t('rdv.status_contre'),
    annule: t('rdv.status_annule'),
    termine: t('rdv.status_termine'),
    absent: t('rdv.status_absent'),
  };

  const handleConfirmAnnuler = async () => {
    if (!cancelTarget) return;
    try {
      const res = await annuler.mutateAsync(cancelTarget);
      toast.success(res.message || t('rdv.cancelled'));
      setCancelTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || t('rdv.error'));
    }
  };

  const handleReponse = async (id, accepter) => {
    try {
      await repondre.mutateAsync({ id, accepter });
      toast.success(accepter ? t('rdv.slot_confirmed') : t('rdv.slot_refused'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('rdv.error'));
    }
  };

  const handleRate = async () => {
    if (!rateRdv?.medecin?.id) return;
    try {
      await creerAvis.mutateAsync({
        cible_type: 'medecin',
        cible_id: rateRdv.medecin.id,
        note,
        commentaire,
      });
      toast.success(t('rdv.thanks_review'));
      setRateRdv(null);
      setCommentaire('');
      setNote(5);
    } catch (err) {
      toast.error(err.response?.data?.message || t('rdv.review_error'));
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message={t('rdv.error')} onRetry={refetch} />;

  return (
    <div>
      <PatientPageHeader
        title={t('rdv.title')}
        subtitle={t('rdv.subtitle')}
      />

      {!rdvs?.length ? (
        <EmptyCard>
          <Calendar />
          <p>{t('rdv.empty')}</p>
          <Button size="sm" style={{ marginTop: 16 }} onClick={() => navigate('/sante?tab=medecins')}>
            {t('rdv.find_doctor')}
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
                      {t('rdv.at_time', { date: rdv.date_rdv, time: rdv.heure_debut })} —{' '}
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
                          <><CheckCircle size={12} style={{ verticalAlign: 'middle' }} /> {t('rdv.paid', { amount: Number(rdv.transaction.montant_brut_fcfa).toLocaleString() })}</>
                        ) : rdv.transaction.montant_brut_fcfa > 0 ? (
                          <>{t('rdv.payment_pending', { amount: Number(rdv.transaction.montant_brut_fcfa).toLocaleString() })}</>
                        ) : null}
                      </PaymentNote>
                    )}
                    {rdv.notes_medecin && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.82rem', padding: '8px 10px', background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                        <MessageSquare size={12} style={{ verticalAlign: 'middle' }} /> {rdv.notes_medecin}
                      </p>
                    )}
                  </RdvInfo>

                  <Actions>
                    {rdv.transaction?.statut_paiement === 'en_attente' && rdv.transaction.montant_brut_fcfa > 0 && (
                      <Button size="sm" onClick={() => setPaiement({
                        referenceType: 'rendez_vous',
                        referenceId: rdv.id,
                        transaction: rdv.transaction,
                        titre: t('rdv.consultation_title', { name: `${rdv.medecin?.prenom} ${rdv.medecin?.nom}` }),
                      })}
                      >
                        <CreditCard size={14} /> {t('rdv.pay')}
                      </Button>
                    )}
                    {rdv.transaction?.statut_paiement === 'paye' && rdv.transaction?.id && (
                      <Button size="sm" variant="secondary" onClick={() => window.open(getRecuUrl(rdv.transaction.id), '_blank')}>
                        <Download size={14} /> {t('rdv.receipt')}
                      </Button>
                    )}
                    {rdv.statut === 'confirme' && rdv.type_consultation === 'teleconsultation' && rdv.lien_video && (
                      <Button onClick={() => joinTeleconsultation({
                        lienVideo: rdv.lien_video,
                        displayName: `${user?.prenom || 'Patient'} ${user?.nom || ''}`.trim(),
                        navigate,
                        route: `/rendez-vous/${rdv.id}/video`,
                      })}
                      >
                        <Video size={14} /> {t('rdv.join')}
                      </Button>
                    )}
                    {['confirme', 'termine'].includes(rdv.statut) && rdv.medecin?.id && (
                      <Button size="sm" variant="secondary" onClick={() => setRateRdv(rdv)}>
                        <Star size={14} /> {t('rdv.rate')}
                      </Button>
                    )}
                    {['en_attente', 'confirme', 'contre_proposition'].includes(rdv.statut) && (
                      <Button variant="secondary" onClick={() => setCancelTarget(rdv.id)}>
                        <X size={14} /> {t('rdv.cancel')}
                      </Button>
                    )}
                  </Actions>
                </RdvTop>

                {rdv.statut === 'contre_proposition' && rdv.date_proposee && (
                  <CounterOffer>
                    <h4><RefreshCw size={14} /> {t('rdv.counter_title')}</h4>
                    <p><strong>{t('rdv.new_slot')}</strong> {t('rdv.at_time', { date: rdv.date_proposee, time: rdv.heure_debut_proposee })}</p>
                    <p>{t('rdv.initial_slot')} {t('rdv.at_time', { date: rdv.date_rdv, time: rdv.heure_debut })}</p>
                    {rdv.message_contre_proposition && (
                      <blockquote>« {rdv.message_contre_proposition} »</blockquote>
                    )}
                    <Actions style={{ marginTop: 12 }}>
                      <Button size="sm" onClick={() => handleReponse(rdv.id, true)}>
                        <Check size={14} /> {t('rdv.accept')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleReponse(rdv.id, false)}>
                        <X size={14} /> {t('rdv.refuse')}
                      </Button>
                    </Actions>
                  </CounterOffer>
                )}
              </RdvCard>
            );
          })}
        </List>
      )}

      <CancelConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmAnnuler}
        loading={annuler.isPending}
        previewLoading={previewLoading}
        preview={cancelPreview}
        title={t('rdv.cancel_title')}
        confirmLabel={t('rdv.cancel_confirm')}
      />

      <PaymentModal
        open={!!paiement}
        onClose={() => setPaiement(null)}
        referenceType={paiement?.referenceType}
        referenceId={paiement?.referenceId}
        transaction={paiement?.transaction}
        titre={paiement?.titre}
        onPaid={refetch}
      />

      {rateRdv && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        >
          <Card style={{ padding: 24, maxWidth: 400, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px' }}>{t('rdv.rate_title', { name: `${rateRdv.medecin?.prenom} ${rateRdv.medecin?.nom}` })}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 12 }}>{t('rdv.rate_hint')}</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNote(s)}
                  style={{
                    background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer',
                    color: s <= note ? '#F59E0B' : '#D1D5DB',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={t('rdv.comment_placeholder')}
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setRateRdv(null)}>{t('rdv.cancel')}</Button>
              <Button onClick={handleRate} disabled={creerAvis.isPending}>{t('rdv.publish')}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
