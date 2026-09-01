import React, { useState } from 'react';
import { FileText, Pill, Search, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import {
  useOrdonnancesElecPatient,
  useDisponibiliteOrdonnance,
  useReserverDepuisOrdonnance,
} from '../hooks/useReservations';
import { useOrdonnanceDocument } from '../hooks/useCarnetMedical';
import { useEtablissements } from '../hooks/useEtablissements';
import { authenticatedFileUrl } from '../utils/fileUrl';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function PatientOrdonnancesElecPage() {
  const { data: ordonnances, isLoading } = useOrdonnancesElecPatient();
  const [selectedOrdo, setSelectedOrdo] = useState(null);
  const [etabId, setEtabId] = useState('');
  const { data: etabs } = useEtablissements({});
  const { data: dispo, isLoading: dispoLoading } = useDisponibiliteOrdonnance(selectedOrdo, etabId);
  const { data: docOrdo, isLoading: docLoading } = useOrdonnanceDocument(selectedOrdo);
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
            <h3 style={{ marginBottom: 12 }}><Search size={18} /> Détail & disponibilité</h3>
            {!selectedOrdo ? (
              <Card style={{ padding: 24, color: '#94A3B8' }}>Sélectionnez une ordonnance</Card>
            ) : (
              <>
              {docLoading ? <Spinner /> : docOrdo && (
                <Card style={{ padding: 20, marginBottom: 16, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{docOrdo.numero_unique}</strong>
                      <p style={{ margin: '4px 0', color: '#64748B', fontSize: '0.85rem' }}>
                        Dr {docOrdo.medecin?.prenom} {docOrdo.medecin?.nom} — {docOrdo.medecin?.specialite}
                      </p>
                      {docOrdo.diagnostic && <p style={{ fontSize: '0.9rem' }}><em>{docOrdo.diagnostic}</em></p>}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>SIGNÉE</span>
                  </div>
                  <ul style={{ margin: '12px 0', paddingLeft: 18, fontSize: '0.9rem' }}>
                    {(docOrdo.medicaments || []).map((m, i) => (
                      <li key={i}>{m.nom || m} {m.posologie ? `— ${m.posologie}` : ''}</li>
                    ))}
                  </ul>
                  {docOrdo.instructions && <p style={{ fontSize: '0.85rem', color: '#64748B' }}>{docOrdo.instructions}</p>}
                  <div style={{ display: 'flex', gap: 24, marginTop: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    {docOrdo.cachet_url && docOrdo.fichier_cachet_id && (
                      <div>
                        <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '0 0 4px' }}>Cachet</p>
                        <img src={authenticatedFileUrl(docOrdo.fichier_cachet_id)} alt="Cachet" style={{ maxHeight: 64 }} />
                      </div>
                    )}
                    {docOrdo.signature_url && docOrdo.fichier_signature_id && (
                      <div>
                        <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '0 0 4px' }}>Signature</p>
                        <img src={authenticatedFileUrl(docOrdo.fichier_signature_id)} alt="Signature" style={{ maxHeight: 48 }} />
                      </div>
                    )}
                  </div>
                  <p style={{ marginTop: 12, fontSize: '0.75rem', color: '#94A3B8', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Shield size={12} /> {docOrdo.legal_notice}
                  </p>
                </Card>
              )}
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
              </>
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
