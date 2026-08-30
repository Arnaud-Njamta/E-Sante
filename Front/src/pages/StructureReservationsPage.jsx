import React, { useState } from 'react';
import { Package, Check, X, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useReservationsEtablissement, useUpdateReservationStatut } from '../hooks/useReservations';
import toast from 'react-hot-toast';

const STATUT_FILTERS = ['', 'en_attente', 'confirmee', 'prete', 'retiree', 'refusee'];

const STATUT_LABELS = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  refusee: 'Refusée',
  prete: 'Prête',
  retiree: 'Retirée',
  annulee: 'Annulée',
};

const parseLignes = (lignes) => {
  if (Array.isArray(lignes)) return lignes;
  if (typeof lignes === 'string') {
    try { return JSON.parse(lignes); } catch { return []; }
  }
  return [];
};

export default function StructureReservationsPage() {
  const [filtre, setFiltre] = useState('en_attente');
  const { data: reservations, isLoading } = useReservationsEtablissement(filtre ? { statut: filtre } : {});
  const updateStatut = useUpdateReservationStatut();
  const [reponse, setReponse] = useState({});

  const changerStatut = async (id, statut) => {
    try {
      await updateStatut.mutateAsync({ id, statut, reponse_etablissement: reponse[id] || undefined });
      toast.success(`Réservation ${STATUT_LABELS[statut]}`);
      setReponse((r) => ({ ...r, [id]: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Package size={24} style={{ verticalAlign: 'middle' }} /> Réservations patients</h1>
      <p style={{ color: '#64748B', marginBottom: 20 }}>Confirmez, préparez et marquez les retraits au comptoir</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUT_FILTERS.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setFiltre(s)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid #E2E8F0', cursor: 'pointer',
              background: filtre === s ? '#FFF7ED' : '#fff',
              color: filtre === s ? '#EA580C' : '#64748B',
              fontWeight: filtre === s ? 600 : 400,
            }}
          >
            {s ? STATUT_LABELS[s] : 'Toutes'}
          </button>
        ))}
      </div>

      {(reservations || []).length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Clock size={36} style={{ marginBottom: 8 }} />
          <p>Aucune réservation pour ce filtre.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reservations.map((r) => (
            <Card key={r.id} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <strong>{r.numero_reference}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    {r.patient?.prenom} {r.patient?.nom} — {r.patient?.telephone || r.patient?.email}
                  </p>
                  {r.ordonnance && <p style={{ margin: 0, fontSize: '0.75rem', color: '#8B5CF6' }}>Ordonnance : {r.ordonnance.numero_unique}</p>}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{STATUT_LABELS[r.statut]}</span>
              </div>
              <ul style={{ margin: '0 0 8px', paddingLeft: 18, fontSize: '0.9rem' }}>
                {parseLignes(r.lignes).map((l, i) => <li key={i}>{l.nom} × {l.quantite}</li>)}
              </ul>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#059669' }}>{Number(r.montant_total_fcfa).toLocaleString()} FCFA</p>
              {r.message_patient && <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 12 }}>Patient : {r.message_patient}</p>}
              <textarea
                placeholder="Message au patient (optionnel)"
                value={reponse[r.id] || ''}
                onChange={(e) => setReponse({ ...reponse, [r.id]: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.statut === 'en_attente' && (
                  <>
                    <Button size="sm" onClick={() => changerStatut(r.id, 'confirmee')}><Check size={14} /> Confirmer</Button>
                    <Button size="sm" variant="secondary" onClick={() => changerStatut(r.id, 'refusee')}><X size={14} /> Refuser</Button>
                  </>
                )}
                {r.statut === 'confirmee' && (
                  <Button size="sm" onClick={() => changerStatut(r.id, 'prete')}><Package size={14} /> Marquer prête</Button>
                )}
                {r.statut === 'prete' && (
                  <Button size="sm" variant="success" onClick={() => changerStatut(r.id, 'retiree')}><Check size={14} /> Retirée (comptoir)</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
