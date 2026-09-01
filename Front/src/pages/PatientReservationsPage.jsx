import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  Package, X, MapPin, CreditCard, CheckCircle2, Download,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PaymentModal from '../components/ui/PaymentModal';
import PatientPageHeader from '../components/patient/PatientPageHeader';
import CancelConfirmModal from '../components/patient/CancelConfirmModal';
import { useMesReservations, useAnnulerReservation, usePreviewAnnulationReservation } from '../hooks/useReservations';
import { getRecuUrl } from '../hooks/usePaiement';
import toast from 'react-hot-toast';

const STATUT_COLORS = {
  en_attente: { color: '#F59E0B' },
  confirmee: { color: '#007A5E' },
  refusee: { color: '#EF4444' },
  prete: { color: '#22C55E' },
  retiree: { color: '#64748B' },
  annulee: { color: '#94A3B8' },
};

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ResCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ResTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ResMeta = styled.p`
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${({ $color }) => `${$color}22`};
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const ProductList = styled.ul`
  margin: 0 0 12px;
  padding-left: 18px;
  font-size: 0.9rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyCard = styled(Card)`
  padding: 48px 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.xl};

  svg {
    width: 40px;
    height: 40px;
    margin: 0 auto 12px;
    opacity: 0.4;
  }
`;

const parseLignes = (lignes) => {
  if (Array.isArray(lignes)) return lignes;
  if (typeof lignes === 'string') {
    try {
      const parsed = JSON.parse(lignes);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch { /* ignore */ }
  }
  if (lignes && typeof lignes === 'object') {
    return Array.isArray(lignes) ? lignes : [lignes];
  }
  return [];
};

export default function PatientReservationsPage() {
  const { t } = useTranslation();
  const { data: reservations, isLoading, error, refetch } = useMesReservations();

  const STATUT_LABELS = {
    en_attente: t('reservations.status_en_attente'),
    confirmee: t('reservations.status_confirmee'),
    refusee: t('reservations.status_refusee'),
    prete: t('reservations.status_prete'),
    retiree: t('reservations.status_retiree'),
    annulee: t('reservations.status_annulee'),
  };
  const annuler = useAnnulerReservation();
  const [paiement, setPaiement] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { data: cancelPreview, isLoading: previewLoading } = usePreviewAnnulationReservation(cancelTarget, !!cancelTarget);

  const list = Array.isArray(reservations) ? reservations : [];

  const handleConfirmAnnuler = async () => {
    if (!cancelTarget) return;
    try {
      const res = await annuler.mutateAsync(cancelTarget);
      toast.success(res.message || t('reservations.cancelled'));
      setCancelTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || t('reservations.cancel_error'));
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message={t('reservations.load_error')} onRetry={refetch} />;

  return (
    <div>
      <PatientPageHeader
        title={t('reservations.title')}
        subtitle={t('reservations.subtitle')}
      />

      {list.length === 0 ? (
        <EmptyCard>
          <Package />
          <p>{t('reservations.empty')}</p>
        </EmptyCard>
      ) : (
        <List>
          {list.map((r) => {
            const st = STATUT_COLORS[r.statut] || STATUT_COLORS.en_attente;
            const lignes = parseLignes(r.lignes);
            return (
              <ResCard key={r.id}>
                <ResTop>
                  <div>
                    <strong>{r.numero_reference}</strong>
                    <ResMeta>
                      <MapPin size={14} style={{ verticalAlign: 'middle' }} /> {r.etablissement?.nom} — {r.etablissement?.ville}
                    </ResMeta>
                  </div>
                  <StatusBadge $color={st.color}>{STATUT_LABELS[r.statut] || STATUT_LABELS.en_attente}</StatusBadge>
                </ResTop>
                <ProductList>
                  {lignes.length > 0 ? lignes.map((l, i) => (
                    <li key={l.produit_id || i}>
                      <strong>{l.nom || l.medicament || t('reservations.medicine_default')}</strong>
                      {' '}× {l.quantite || 1}
                      {l.prix_fcfa_unitaire ? ` — ${(l.prix_fcfa_unitaire * (l.quantite || 1)).toLocaleString()} FCFA` : ''}
                    </li>
                  )) : (
                    <li style={{ color: '#94A3B8' }}>{t('reservations.product_detail_unavailable')}</li>
                  )}
                </ProductList>
                {r.montant_total_fcfa > 0 && (
                  <p style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>
                    {t('reservations.total', { amount: Number(r.montant_total_fcfa).toLocaleString() })}
                  </p>
                )}
                <Actions>
                  {r.transaction?.statut_paiement === 'en_attente' && r.transaction?.montant_brut_fcfa > 0 && (
                    <Button size="sm" onClick={() => setPaiement({
                      referenceType: 'reservation_dispensaire',
                      referenceId: r.id,
                      transaction: r.transaction,
                      titre: t('reservations.reservation_title', { ref: r.numero_reference }),
                    })}
                    >
                      <CreditCard size={14} /> {t('reservations.pay')}
                    </Button>
                  )}
                  {r.transaction?.statut_paiement === 'paye' && r.transaction?.id && (
                    <Button size="sm" variant="secondary" onClick={() => window.open(getRecuUrl(r.transaction.id), '_blank')}>
                      <Download size={14} /> {t('reservations.receipt')}
                    </Button>
                  )}
                  {['en_attente', 'confirmee'].includes(r.statut) && (
                    <Button size="sm" variant="secondary" onClick={() => setCancelTarget(r.id)}>
                      <X size={14} /> {t('reservations.cancel')}
                    </Button>
                  )}
                  {r.statut === 'prete' && (
                    <span style={{ fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={16} /> {t('reservations.ready_pickup')}
                    </span>
                  )}
                </Actions>
              </ResCard>
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
        title={t('reservations.cancel_title')}
        confirmLabel={t('reservations.cancel_confirm')}
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
    </div>
  );
}
