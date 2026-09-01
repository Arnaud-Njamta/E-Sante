import React from 'react';
import styled from 'styled-components';
import { X, BookHeart, AlertTriangle } from 'lucide-react';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import CarnetMedicalView from '../carnet/CarnetMedicalView';
import { useCarnetPatient } from '../../hooks/useCarnetPatient';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Box = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ErrorBox = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg { color: #F59E0B; margin-bottom: 12px; }
`;

export default function MedecinCarnetPatientModal({ patientId, patientName, onClose }) {
  const { data, isLoading, error } = useCarnetPatient(patientId);

  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <CloseBtn type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></CloseBtn>
        <h2 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookHeart size={22} /> Carnet de {patientName || 'patient'}
        </h2>

        {isLoading && <Spinner text="Chargement du carnet..." />}
        {error && (
          <ErrorBox>
            <AlertTriangle size={40} />
            <p>{error.response?.data?.message || 'Accès au carnet refusé ou carnet non activé par le patient.'}</p>
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
          </ErrorBox>
        )}
        {data && !error && <CarnetMedicalView data={data} onEdit={null} />}
      </Box>
    </Overlay>
  );
}
