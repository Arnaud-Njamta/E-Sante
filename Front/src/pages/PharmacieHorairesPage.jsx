import React, { useState } from 'react';
import { Clock, Save } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { usePharmacieDashboard, useEtabHorairesMe } from '../hooks/useDashboards';
import { useAuth } from '../context/AuthContext';
import { parseJsonObject } from '../utils/helpers';
import { useUpdateEtabHoraires, useUpdateEtabGarde } from '../hooks/useProfessionnel';
import toast from 'react-hot-toast';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function PharmacieHorairesPage() {
  const { isPharmacie } = useAuth();
  const pharmaQuery = usePharmacieDashboard({ enabled: isPharmacie });
  const structureQuery = useEtabHorairesMe({ enabled: !isPharmacie });
  const data = isPharmacie ? pharmaQuery.data : { horaires: structureQuery.data };
  const isLoading = isPharmacie ? pharmaQuery.isLoading : structureQuery.isLoading;
  const error = isPharmacie ? pharmaQuery.error : structureQuery.error;
  const refetch = isPharmacie ? pharmaQuery.refetch : structureQuery.refetch;
  const updateHoraires = useUpdateEtabHoraires();
  const updateGarde = useUpdateEtabGarde();
  const [horaires, setHoraires] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deGarde, setDeGarde] = useState(false);

  React.useEffect(() => {
    const raw = isPharmacie ? data?.horaires : data?.horaires;
    if (raw) setHoraires(JSON.parse(JSON.stringify(parseJsonObject(raw, {}))));
    if (isPharmacie && data?.profil) {
      setDeGarde(!!data.profil.de_garde);
    }
  }, [data, isPharmacie]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Erreur" onRetry={refetch} />;

  const h = horaires || parseJsonObject(data?.horaires, {});

  const updateJour = (jour, field, value) => {
    setHoraires({ ...h, [jour]: { ...h[jour], [field]: value } });
  };

  const toggleGarde = async () => {
    if (!isPharmacie) return;
    try {
      const next = !deGarde;
      await updateGarde.mutateAsync({ de_garde: next });
      setDeGarde(next);
      toast.success(next ? 'Pharmacie signalée de garde' : 'Mode garde désactivé');
      refetch();
    } catch {
      toast.error('Impossible de mettre à jour le statut de garde');
    }
  };

  const save = async () => {
    try {
      await updateHoraires.mutateAsync(h);
      toast.success('Horaires mis à jour');
      setEditMode(false);
      refetch();
    } catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}><Clock size={24} style={{ verticalAlign: 'middle' }} /> Horaires d'ouverture</h1>
          <p style={{ color: '#64748B' }}>Visibles par les patients dans l&apos;annuaire santé</p>
        </div>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)}>Modifier</Button>
        ) : (
          <Button onClick={save}><Save size={16} /> Enregistrer</Button>
        )}
      </div>

      <Card style={{ padding: 24, maxWidth: 520, marginBottom: 16 }}>
        {isPharmacie && (
          <div style={{ marginBottom: 20, padding: 14, borderRadius: 10, background: deGarde ? '#FEF3C7' : '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={deGarde}
                onChange={toggleGarde}
                disabled={updateGarde.isPending}
              />
              Pharmacie de garde (visible en priorité dans l&apos;annuaire)
            </label>
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Activez ce statut lorsque vous assurez la garde pharmaceutique. Les patients vous trouveront en premier via GPS.
            </p>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <input type="checkbox" checked={!!h.h24} disabled={!editMode} onChange={(e) => setHoraires({ ...h, h24: e.target.checked })} />
          Ouvert 24h/24
        </label>

        {!h.h24 && JOURS.map((jour) => (
          <div key={jour} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <label style={{ width: 100, textTransform: 'capitalize' }}>
              <input type="checkbox" checked={h[jour]?.ouvert} disabled={!editMode} onChange={(e) => updateJour(jour, 'ouvert', e.target.checked)} />
              {' '}{jour}
            </label>
            {h[jour]?.ouvert && editMode ? (
              <>
                <input type="time" value={h[jour]?.debut || '08:00'} onChange={(e) => updateJour(jour, 'debut', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #E2E8F0' }} />
                <span>—</span>
                <input type="time" value={h[jour]?.fin || '20:00'} onChange={(e) => updateJour(jour, 'fin', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #E2E8F0' }} />
              </>
            ) : h[jour]?.ouvert ? (
              <span style={{ color: '#22C55E' }}>{h[jour].debut} — {h[jour].fin}</span>
            ) : (
              <span style={{ color: '#EF4444' }}>Fermé</span>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
