import React, { useState } from 'react';
import styled from 'styled-components';
import { CreditCard, Smartphone, X, CheckCircle } from 'lucide-react';
import Button from './Button';
import { usePaiementConfig, useInitierPaiement, useSimulerPaiement } from '../../hooks/usePaiement';
import toast from 'react-hot-toast';
import { CAMEROON_COLORS } from '../../config/cameroonHealth';

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
`;

const Box = styled.div`
  background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 420px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
`;

const OperatorBtn = styled.button`
  flex: 1; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 0.85rem; font-weight: 600;
  border: 2px solid ${({ $active }) => ($active ? CAMEROON_COLORS.green : '#E2E8F0')};
  background: ${({ $active }) => ($active ? '#ECFDF5' : '#fff')};
  color: ${({ $active }) => ($active ? CAMEROON_COLORS.greenDark : '#475569')};
`;

export default function PaymentModal({
  open, onClose, referenceType, referenceId, transaction, titre, onPaid,
}) {
  const { data: config } = usePaiementConfig();
  const initier = useInitierPaiement();
  const simuler = useSimulerPaiement();
  const [canal, setCanal] = useState('orange_money');
  const [step, setStep] = useState('choix');
  const [txCourante, setTxCourante] = useState(transaction);

  if (!open) return null;

  const montant = Number(transaction?.montant_brut_fcfa) || 0;
  const dejaPaye = transaction?.statut_paiement === 'paye';
  const modeSimulation = config?.mode === 'simulation';

  const handleInitier = async () => {
    try {
      const result = await initier.mutateAsync({
        reference_type: referenceType,
        reference_id: referenceId,
        canal,
      });
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      if (result.mode === 'simulation' || result.mode === 'gratuit') {
        setTxCourante(result.transaction);
        setStep('simuler');
      }
      if (result.mode === 'gratuit') {
        onPaid?.();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur paiement');
    }
  };

  const handleSimuler = async () => {
    const txId = txCourante?.id || transaction?.id;
    if (!txId) {
      toast.error('Transaction introuvable');
      return;
    }
    try {
      await simuler.mutateAsync({ id: txId, canal });
      toast.success('Paiement confirmé !');
      onPaid?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={20} /> Paiement Mobile Money
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {dejaPaye ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#047857' }}>
            <CheckCircle size={40} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>Déjà payé</p>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: '0.9rem' }}>{titre}</p>
            <p style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 700, color: CAMEROON_COLORS.greenDark }}>
              {montant.toLocaleString('fr-FR')} FCFA
            </p>

            {step === 'choix' && (
              <>
                <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><Smartphone size={14} style={{ verticalAlign: 'middle' }} /> Opérateur</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {(config?.operateurs || []).map((o) => (
                    <OperatorBtn key={o.id} type="button" $active={canal === o.id} onClick={() => setCanal(o.id)}>
                      {o.label}
                    </OperatorBtn>
                  ))}
                </div>
                {modeSimulation && (
                  <p style={{ fontSize: '0.75rem', color: '#B45309', marginBottom: 12, background: '#FFFBEB', padding: 10, borderRadius: 8 }}>
                    Mode démo : le paiement sera simulé (configurez CinetPay en production).
                  </p>
                )}
                <Button onClick={handleInitier} disabled={initier.isPending} style={{ width: '100%' }}>
                  {initier.isPending ? 'Redirection...' : `Payer avec ${canal === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}`}
                </Button>
              </>
            )}

            {step === 'simuler' && (
              <>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
                  Confirmez pour simuler le paiement Mobile Money sur votre téléphone.
                </p>
                <Button onClick={handleSimuler} disabled={simuler.isPending} style={{ width: '100%' }}>
                  {simuler.isPending ? 'Traitement...' : 'Confirmer le paiement (démo)'}
                </Button>
              </>
            )}
          </>
        )}
      </Box>
    </Overlay>
  );
}
