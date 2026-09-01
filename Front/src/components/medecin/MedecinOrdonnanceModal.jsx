import React, { useState } from 'react';
import styled from 'styled-components';
import { X, FileText, PenLine, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useCreerOrdonnanceElec, useSignerOrdonnance } from '../../hooks/useProfessionnel';
import toast from 'react-hot-toast';

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;
`;

const Box = styled(Card)`
  width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; padding: 24px; position: relative;
`;

const CloseBtn = styled.button`
  position: absolute; top: 16px; right: 16px; border: none; background: #F1F5F9;
  border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;
`;

export default function MedecinOrdonnanceModal({ rdv, onClose, onSuccess }) {
  const creer = useCreerOrdonnanceElec();
  const signer = useSignerOrdonnance();
  const [form, setForm] = useState({
    patient_id: rdv.patient?.id || '',
    rendez_vous_id: rdv.id,
    diagnostic: rdv.motif || '',
    instructions: '',
    medicaments: [{ nom: '', dosage: '', duree: '', instructions: '' }],
  });

  const patientName = `${rdv.patient?.prenom || ''} ${rdv.patient?.nom || ''}`.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const meds = form.medicaments.filter((m) => m.nom?.trim());
    if (!meds.length) {
      toast.error('Ajoutez au moins un médicament');
      return;
    }
    try {
      const result = await creer.mutateAsync({ ...form, medicaments: meds });
      await signer.mutateAsync(result.data.id);
      toast.success(`Ordonnance ${result.data.numero_unique} envoyée au patient`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur — vérifiez cachet et signature dans Paramètres');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <CloseBtn type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></CloseBtn>
        <h2 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={22} /> Ordonnance — {patientName}
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B' }}>
          RDV du {rdv.date_rdv} à {rdv.heure_debut} — visible immédiatement côté patient et en pharmacie.
        </p>

        <form onSubmit={handleSubmit}>
          <Input label="Diagnostic" value={form.diagnostic} onChange={(e) => setForm({ ...form, diagnostic: e.target.value })} />
          {form.medicaments.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginTop: 8 }}>
              <Input placeholder="Médicament" value={m.nom} onChange={(e) => {
                const meds = [...form.medicaments]; meds[i].nom = e.target.value; setForm({ ...form, medicaments: meds });
              }} />
              <Input placeholder="Dosage" value={m.dosage} onChange={(e) => {
                const meds = [...form.medicaments]; meds[i].dosage = e.target.value; setForm({ ...form, medicaments: meds });
              }} />
              <Input placeholder="Durée" value={m.duree} onChange={(e) => {
                const meds = [...form.medicaments]; meds[i].duree = e.target.value; setForm({ ...form, medicaments: meds });
              }} />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setForm({ ...form, medicaments: [...form.medicaments, { nom: '', dosage: '', duree: '' }] })}
            style={{ marginTop: 8 }}
          >
            <Plus size={14} /> Médicament
          </Button>
          <Input
            label="Instructions générales"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            style={{ marginTop: 12 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={creer.isPending || signer.isPending}>
              <PenLine size={16} /> Signer et envoyer au patient
            </Button>
          </div>
        </form>
      </Box>
    </Overlay>
  );
}
