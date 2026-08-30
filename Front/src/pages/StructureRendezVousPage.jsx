import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { useStructureRendezVous } from '../hooks/useStructureManagement';

const STATUT_COLORS = {
  en_attente: '#F59E0B',
  confirme: '#22C55E',
  annule: '#EF4444',
  termine: '#64748B',
  absent: '#94A3B8',
};

const STATUT_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
  termine: 'Terminé',
  absent: 'Absent',
};

export default function StructureRendezVousPage() {
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreDate, setFiltreDate] = useState('');
  const { data: rdv, isLoading } = useStructureRendezVous({
    ...(filtreStatut && { statut: filtreStatut }),
    ...(filtreDate && { date: filtreDate }),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Calendar size={24} style={{ verticalAlign: 'middle' }} /> Rendez-vous</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>
        Tous les rendez-vous pris via DjamSanté pour votre établissement et vos médecins affiliés.
      </p>

      <Card style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={18} color="#64748B" />
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input
          type="date"
          value={filtreDate}
          onChange={(e) => setFiltreDate(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
        />
        <span style={{ fontSize: '0.85rem', color: '#64748B', marginLeft: 'auto' }}>
          {(rdv || []).length} rendez-vous
        </span>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>
              <th style={{ padding: '12px 16px' }}>Date & heure</th>
              <th style={{ padding: '12px 16px' }}>Patient</th>
              <th style={{ padding: '12px 16px' }}>Téléphone</th>
              <th style={{ padding: '12px 16px' }}>Médecin</th>
              <th style={{ padding: '12px 16px' }}>Motif</th>
              <th style={{ padding: '12px 16px' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {(rdv || []).length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                  Aucun rendez-vous pour ces critères.
                </td>
              </tr>
            ) : (
              rdv.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <strong>{r.date_rdv}</strong><br />
                    <span style={{ color: '#64748B' }}>{r.heure_debut} — {r.heure_fin}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{r.patient?.prenom} {r.patient?.nom}</td>
                  <td style={{ padding: '12px 16px' }}>{r.patient?.telephone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    Dr {r.medecin?.prenom} {r.medecin?.nom}
                    <br /><span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{r.medecin?.specialite}</span>
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: 180 }}>{r.motif || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 500,
                      background: `${STATUT_COLORS[r.statut] || '#94A3B8'}22`,
                      color: STATUT_COLORS[r.statut] || '#64748B',
                    }}>
                      {STATUT_LABELS[r.statut] || r.statut}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
