import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Modal = styled(Card)`
  width: 100%;
  max-width: 440px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.1rem;
`;

const Message = styled.p`
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const RefundBox = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: ${({ $eligible }) => ($eligible ? '#ECFDF5' : '#FEF2F2')};
  border: 1px solid ${({ $eligible }) => ($eligible ? '#A7F3D0' : '#FECACA')};

  strong {
    display: block;
    font-size: 1.05rem;
    color: ${({ $eligible }) => ($eligible ? '#047857' : '#B91C1C')};
    margin-bottom: 4px;
  }

  span {
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Conditions = styled.ul`
  margin: 0 0 16px;
  padding-left: 18px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export default function CancelConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  previewLoading,
  preview,
  title = 'Confirmer l\'annulation',
  confirmLabel = 'Confirmer l\'annulation',
}) {
  if (!open) return null;

  const eligible = preview?.eligible;
  const refundFcfa = preview?.refund_fcfa || 0;
  const refundPercent = preview?.refund_percent ?? 0;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>{title}</Title>

        {previewLoading ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner /></div>
        ) : preview ? (
          <>
            <Message>{preview.message}</Message>

            <RefundBox $eligible={eligible}>
              {eligible ? (
                <>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={18} />
                    {refundFcfa > 0
                      ? `Remboursement : ${refundFcfa.toLocaleString('fr-FR')} FCFA (${refundPercent} %)`
                      : 'Annulation sans frais'}
                  </strong>
                  <span>{preview.message_paiement}</span>
                </>
              ) : (
                <>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={18} />
                    Annulation impossible
                  </strong>
                  <span>{preview.message}</span>
                </>
              )}
            </RefundBox>

            {preview.conditions?.length > 0 && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Info size={14} /> Conditions d&apos;annulation
                </p>
                <Conditions>
                  {preview.conditions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </Conditions>
              </>
            )}

            {!eligible && (
              <p style={{ fontSize: '0.78rem', color: '#B45309', display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 16 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                Contactez l&apos;établissement si vous avez un cas urgent.
              </p>
            )}
          </>
        ) : (
          <Message>Impossible de charger les conditions d&apos;annulation.</Message>
        )}

        <Actions>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Retour
          </Button>
          {preview?.eligible && (
            <Button
              onClick={onConfirm}
              disabled={loading || previewLoading}
              style={{ background: '#DC2626', borderColor: '#DC2626' }}
            >
              {loading ? 'Annulation…' : confirmLabel}
            </Button>
          )}
        </Actions>
      </Modal>
    </Overlay>
  );
}
