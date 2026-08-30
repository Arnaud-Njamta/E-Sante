import React from 'react';
import styled from 'styled-components';
import { Info } from 'lucide-react';
import { CAMEROON_COLORS } from '../../config/cameroonHealth';

const Box = styled.div`
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #F0FDF9;
  border: 1px solid ${CAMEROON_COLORS.green}30;
  font-size: 0.85rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  color: #475569;

  &.total {
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px dashed ${CAMEROON_COLORS.green}40;
    font-weight: 700;
    color: #0F172A;
    font-size: 0.92rem;
  }

  &.commission {
    color: ${CAMEROON_COLORS.greenDark};
    font-size: 0.8rem;
  }
`;

const Note = styled.p`
  margin: 10px 0 0;
  font-size: 0.75rem;
  color: #64748B;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.45;
`;

export default function CommissionSummary({ breakdown, label = 'Récapitulatif' }) {
  if (!breakdown || !breakdown.montant_brut_fcfa) return null;

  const brut = Number(breakdown.montant_brut_fcfa) || 0;
  const commission = Number(breakdown.commission_fcfa) || 0;
  const taux = Math.round((breakdown.taux_commission || 0) * 100);

  return (
    <Box>
      <div style={{ fontWeight: 700, marginBottom: 8, color: CAMEROON_COLORS.greenDark }}>{label}</div>
      <Row>
        <span>Montant service</span>
        <span>{brut.toLocaleString('fr-FR')} FCFA</span>
      </Row>
      <Row className="commission">
        <span>Frais plateforme DjamSanté ({taux} %)</span>
        <span>{commission.toLocaleString('fr-FR')} FCFA</span>
      </Row>
      <Row className="total">
        <span>Total à régler</span>
        <span>{brut.toLocaleString('fr-FR')} FCFA</span>
      </Row>
      <Note>
        <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        Paiement Mobile Money (Orange / MTN). Le professionnel reçoit {Number(breakdown.montant_net_fcfa || brut - commission).toLocaleString('fr-FR')} FCFA après commission DjamSanté.
      </Note>
    </Box>
  );
}
