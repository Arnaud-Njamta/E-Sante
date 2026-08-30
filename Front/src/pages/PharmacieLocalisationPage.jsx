import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { useStructureDashboard } from '../hooks/useDashboards';
import { useUpdateEtabLocalisation } from '../hooks/useProfessionnel';
import toast from 'react-hot-toast';

export default function PharmacieLocalisationPage() {
  const { data, isLoading } = useStructureDashboard();
  const updateLoc = useUpdateEtabLocalisation();
  const [form, setForm] = useState({ adresse: '', ville: '', region: 'Centre', latitude: '', longitude: '' });

  React.useEffect(() => {
    if (data?.profil) {
      setForm({
        adresse: data.profil.adresse || '',
        ville: data.profil.ville || '',
        region: data.profil.region || 'Centre',
        latitude: data.profil.latitude || '',
        longitude: data.profil.longitude || '',
      });
    }
  }, [data]);

  const detecterPosition = () => {
    if (!navigator.geolocation) { toast.error('Géolocalisation non supportée'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm({ ...form, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }),
      () => toast.error('Impossible d\'obtenir la position'),
    );
  };

  const save = async () => {
    try {
      await updateLoc.mutateAsync({
        ...form,
        latitude: parseFloat(form.latitude) || null,
        longitude: parseFloat(form.longitude) || null,
      });
      toast.success('Localisation enregistrée');
    } catch { toast.error('Erreur'); }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><MapPin size={24} style={{ verticalAlign: 'middle' }} /> Localisation</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Permettez aux patients de vous trouver sur la carte (Yaoundé, Douala, régions du Cameroun…).</p>

      <Card style={{ padding: 24, maxWidth: 500 }}>
        <Input label="Adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
        <Input label="Ville" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} style={{ marginTop: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Input label="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          <Input label="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        </div>
        <Button variant="secondary" onClick={detecterPosition} style={{ marginTop: 12 }}>
          <Navigation size={16} /> Détecter ma position GPS
        </Button>
        {form.latitude && form.longitude && (
          <p style={{ fontSize: '0.85rem', color: '#22C55E', marginTop: 8 }}>
            Position : {form.latitude}, {form.longitude}
          </p>
        )}
        <Button onClick={save} style={{ marginTop: 16, width: '100%' }}>Enregistrer</Button>
      </Card>
    </div>
  );
}
