import React, { useState } from 'react';
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
import { useMesReservations, useAnnulerReservation } from '../hooks/useReservations';
import { getRecuUrl } from '../hooks/usePaiement';
import toast from 'react-hot-toast';

const STATUT = {
  en_attente: { label: 'En attente', color: '#F59E0B' },
  confirmee: { label: 'Confirmée', color: '#007A5E' },
  refusee: { label: 'Refusée', color: '#EF4444' },
  prete: { label: 'Prête au retrait', color: '#22C55E' },
  retiree: { label: 'Retirée', color: '#64748B' },
  annulee: { label: 'Annulée', color: '#94A3B8' },
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
      <PatientPageHeader
        title="Mes réservations"
        subtitle="Demandes de médicaments auprès des pharmacies et dispensaires"
      />

      {list.length === 0 ? (
        <EmptyCard>
          <Package />
          <p>Aucune réservation. Parcourez l&apos;annuaire santé et réservez vos médicaments en ligne.</p>
        </EmptyCard>
      ) : (
        <List>
          {list.map((r) => {
            const st = STATUT[r.statut] || STATUT.en_attente;
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
                  <StatusBadge $color={st.color}>{st.label}</StatusBadge>
                </ResTop>
                <ProductList>
                  {lignes.map((l, i) => (
                    <li key={i}>
                      {l.nom || l.medicament} × {l.quantite || 1}
                    </li>
                  ))}
                </ProductList>
                <Actions>
                  {r.transaction?.statut_paiement === 'en_attente' && r.transaction?.montant_brut_fcfa > 0 && (
                    <Button size="sm" onClick={() => setPaiement({
                      referenceType: 'reservation',
                      referenceId: r.id,
                      transaction: r.transaction,
                      titre: `Réservation ${r.numero_reference}`,
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
                    <Button size="sm" variant="secondary" onClick={() => handleAnnuler(r.id)}>
                      <X size={14} /> Annuler
                    </Button>
                  )}
                  {r.statut === 'prete' && (
                    <span style={{ fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={16} /> Prête au retrait
                    </span>
                  )}
                </Actions>
              </ResCard>
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
