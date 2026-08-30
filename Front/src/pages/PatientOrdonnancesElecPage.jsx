import React, { useState } from 'react';
import { FileText, Pill, Search, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import {
  useOrdonnancesElecPatient,
  useDisponibiliteOrdonnance,
  useReserverDepuisOrdonnance,
} from '../hooks/useReservations';
import { useEtablissements } from '../hooks/useEtablissements';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function PatientOrdonnancesElecPage() {
  const { data: ordonnances, isLoading } = useOrdonnancesElecPatient();
  const [selectedOrdo, setSelectedOrdo] = useState(null);
  const [etabId, setEtabId] = useState('');
  const { data: etabs } = useEtablissements({});
  const { data: dispo, isLoading: dispoLoading } = useDisponibiliteOrdonnance(selectedOrdo, etabId);
  const reserver = useReserverDepuisOrdonnance();

  const structures = (etabs?.etablissements || []).filter((e) => ['pharmacie', 'hopital', 'clinique'].includes(e.type));

  const handleReserver = async () => {
    try {
      await reserver.mutateAsync({ ordonnanceId: selectedOrdo, etablissement_id: etabId });
      toast.success('Réservation créée — l\'établissement va confirmer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><FileText size={24} style={{ verticalAlign: 'middle' }} /> Ordonnances électroniques</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Vérifiez la disponibilité des médicaments et réservez au dispensaire</p>

      {(ordonnances || []).length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <FileText size={40} style={{ marginBottom: 12 }} />
          <p>Aucune ordonnance électronique signée. Elles apparaîtront ici après consultation chez un médecin DjamSanté.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h3 style={{ marginBottom: 12 }}>Vos ordonnances</h3>
            {(ordonnances || []).map((o) => (
              <Card
                key={o.id}
                style={{
                  padding: 16, marginBottom: 12, cursor: 'pointer',
                  border: selectedOrdo === o.id ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                }}
                onClick={() => setSelectedOrdo(o.id)}
              >
                <strong>{o.numero_unique}</strong>
                <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                  Dr {o.medecin?.prenom} {o.medecin?.nom} — {o.medecin?.specialite}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>
                  {(o.medicaments || []).map((m) => m.nom || m).join(', ')}
                </p>
              </Card>
            ))}
          </div>

          <div>
            <h3 style={{ marginBottom: 12 }}><Search size={18} /> Vérifier disponibilité</h3>
            {!selectedOrdo ? (
              <Card style={{ padding: 24, color: '#94A3B8' }}>Sélectionnez une ordonnance</Card>
            ) : (
              <Card style={{ padding: 20 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Établissement (pharmacie / clinique / hôpital)</label>
                <select
                  value={etabId}
                  onChange={(e) => setEtabId(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4, marginBottom: 16 }}
                >
                  <option value="">Choisir...</option>
                  {structures.map((e) => (
                    <option key={e.id} value={e.id}>{e.nom} ({e.type}) — {e.ville}</option>
                  ))}
                </select>

                {dispoLoading && <Spinner />}
                {dispo && (
                  <>
                    <div style={{
                      padding: 12, borderRadius: 8, marginBottom: 16,
                      background: dispo.resume?.complet ? '#ECFDF5' : dispo.resume?.partiel ? '#FFFBEB' : '#FEF2F2',
                    }}>
                      {dispo.resume?.complet && <><CheckCircle size={16} color="#22C55E" /> Tous les médicaments disponibles</>}
                      {dispo.resume?.partiel && <><AlertCircle size={16} color="#F59E0B" /> Disponibilité partielle ({dispo.resume.disponibles}/{dispo.resume.total})</>}
                      {!dispo.resume?.disponibles && <><AlertCircle size={16} color="#EF4444" /> Aucun médicament en stock</>}
                    </div>
                    {(dispo.lignes || []).map((l, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem' }}>
                        <span>{l.nom_recherche}</span>
                        {l.disponible ? (
                          <span style={{ color: '#22C55E' }}>{l.produit?.prix_fcfa?.toLocaleString()} FCFA — stock {l.produit?.stock_disponible}</span>
                        ) : (
                          <span style={{ color: '#EF4444' }}>Indisponible</span>
                        )}
                      </div>
                    ))}
                    {dispo.resume?.disponibles > 0 && (
                      <Button onClick={handleReserver} disabled={reserver.isPending} style={{ marginTop: 16, width: '100%' }}>
                        <Pill size={16} /> Réserver les médicaments disponibles
                      </Button>
                    )}
                  </>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: '0.85rem', color: '#64748B' }}>
        <Link to="/reservations">Voir mes réservations →</Link>
      </p>
    </div>
  );
}
