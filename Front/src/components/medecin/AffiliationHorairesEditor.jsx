import React, { useState } from 'react';
import styled from 'styled-components';
import { Clock, Save } from 'lucide-react';
import Button from '../ui/Button';
import { JOURS } from '../../utils/horairesDefaults';

const defaultHoraires = () => Object.fromEntries(JOURS.map((j) => [
  j,
  ['samedi', 'dimanche'].includes(j)
    ? { actif: false, creneaux: [] }
    : { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
]));

const Wrap = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  font-size: 0.82rem;
  text-transform: capitalize;
`;

export default function AffiliationHorairesEditor({ horaires: initial, onSave, isSaving }) {
  const [horaires, setHoraires] = useState(initial || defaultHoraires());
  const h = horaires || defaultHoraires();

  return (
    <Wrap>
      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={14} /> Horaires pour ce lieu
      </p>
      {JOURS.map((jour) => (
        <Row key={jour}>
          <label style={{ width: 90 }}>
            <input
              type="checkbox"
              checked={h[jour]?.actif}
              onChange={(e) => setHoraires({ ...h, [jour]: { ...h[jour], actif: e.target.checked } })}
            />
            {' '}{jour}
          </label>
          {h[jour]?.actif && (
            <span style={{ color: '#64748B' }}>
              {h[jour].creneaux?.map((c) => `${c.debut}-${c.fin}`).join(', ') || '08:00-18:00'}
            </span>
          )}
        </Row>
      ))}
      <Button size="sm" style={{ marginTop: 8 }} disabled={isSaving} onClick={() => onSave(horaires)}>
        <Save size={14} /> Enregistrer horaires
      </Button>
    </Wrap>
  );
}
