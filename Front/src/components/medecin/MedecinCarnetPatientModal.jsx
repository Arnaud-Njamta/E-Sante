import React, { useState } from 'react';
import styled from 'styled-components';
import { X, BookHeart, AlertTriangle, Save, Pencil } from 'lucide-react';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import CarnetMedicalView from '../carnet/CarnetMedicalView';
import { useCarnetPatient, useUpdateCarnetPatient } from '../../hooks/useCarnetPatient';
import toast from 'react-hot-toast';

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 16px;
`;

const Box = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 20px; width: 100%; max-width: 640px; max-height: 90vh;
  overflow-y: auto; padding: 24px; position: relative;
`;

const CloseBtn = styled.button`
  position: absolute; top: 16px; right: 16px; border: none;
  background: ${({ theme }) => theme.colors.neutral[100]}; border-radius: 50%;
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;
`;

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #E2E8F0', fontSize: '0.9rem', marginTop: 4,
};

export default function MedecinCarnetPatientModal({ patientId, patientName, editable, onClose }) {
  const { data, isLoading, error, refetch } = useCarnetPatient(patientId);
  const update = useUpdateCarnetPatient();
  const [mode, setMode] = useState('view');
  const [notes, setNotes] = useState('');
  const [traitements, setTraitements] = useState('');

  const save = async () => {
    try {
      await update.mutateAsync({
        patientId,
        payload: {
          notes_consultation: notes,
          traitements_habituelles: traitements.split(',').map((s) => s.trim()).filter(Boolean),
        },
      });
      toast.success('Carnet mis à jour');
      setNotes('');
      setTraitements('');
      setMode('view');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <CloseBtn type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></CloseBtn>
        <h2 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookHeart size={22} /> Carnet de {patientName || 'patient'}
        </h2>

        {isLoading && <Spinner text="Chargement du carnet..." />}
        {error && (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748B' }}>
            <AlertTriangle size={40} color="#F59E0B" style={{ marginBottom: 12 }} />
            <p>{error.response?.data?.message || 'Carnet inaccessible — validez d\'abord le rendez-vous.'}</p>
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
          </div>
        )}

        {data && !error && mode === 'view' && (
          <>
            <CarnetMedicalView data={data} onEdit={editable ? () => setMode('edit') : null} />
            {editable && (
              <Button variant="secondary" onClick={() => setMode('edit')} style={{ marginTop: 12 }}>
                <Pencil size={16} /> Compléter après consultation
              </Button>
            )}
          </>
        )}

        {data && !error && mode === 'edit' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 12 }}>
              Ajoutez vos observations — elles seront fusionnées au carnet du patient.
            </p>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notes de consultation</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100 }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex. Repos 3 jours, contrôle dans 15 jours..."
            />
            <label style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 12, display: 'block' }}>
              Traitements prescrits (séparés par des virgules)
            </label>
            <input
              style={inputStyle}
              value={traitements}
              onChange={(e) => setTraitements(e.target.value)}
              placeholder="Ex. Paracétamol 500mg, Amoxicilline 1g"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button onClick={save} disabled={update.isPending}><Save size={16} /> Enregistrer</Button>
              <Button variant="secondary" onClick={() => setMode('view')}>Annuler</Button>
            </div>
          </div>
        )}
      </Box>
    </Overlay>
  );
}
