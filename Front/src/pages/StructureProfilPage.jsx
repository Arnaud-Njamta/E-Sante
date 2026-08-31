import React from 'react';
import { Building2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { useStructureDashboard } from '../hooks/useDashboards';
import PhotoUploadCard from '../components/ui/PhotoUploadCard';
import { useUploadEtabPhoto, useUpdateEtabLocalisation } from '../hooks/useProfessionnel';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';

export default function StructureProfilPage() {
  const { user, role } = useAuth();
  const { data, isLoading, refetch } = useStructureDashboard();
  const uploadPhoto = useUploadEtabPhoto();
  const [form, setForm] = React.useState({ nom: '', description: '', telephone: '' });

  React.useEffect(() => {
    if (data?.profil) {
      setForm({
        nom: data.profil.nom || '',
        description: data.profil.description || '',
        telephone: data.profil.telephone || '',
      });
    }
  }, [data]);

  if (isLoading) return <Spinner />;

  const profil = data?.profil || user;

  const typeLabel = { pharmacie: 'Pharmacie', hopital: 'Hôpital', clinique: 'Clinique' }[role] || 'Structure';

  const handlePhoto = async (file) => {
    try {
      await uploadPhoto.mutateAsync(file);
      toast.success('Photo de la structure mise à jour');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'upload');
    }
  };

  const saveProfil = async () => {
    try {
      await client.put(ENDPOINTS.etablissements.meProfil, form);
      toast.success('Profil mis à jour');
      refetch();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Building2 size={24} style={{ verticalAlign: 'middle' }} /> Profil {typeLabel}</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Photo et informations visibles dans l'annuaire santé et le fil d'actualités.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <PhotoUploadCard
          title="Photo de la structure"
          subtitle="Visible dans l'annuaire santé et les actualités"
          photoUrl={profil?.image_url}
          fichierId={profil?.fichier_photo_id}
          onUpload={handlePhoto}
          isUploading={uploadPhoto.isPending}
          round={false}
          size={160}
        />

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Informations publiques</h3>
          <Input label="Nom de la structure" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
              placeholder="Présentez votre établissement aux patients..."
            />
          </div>
          <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} style={{ marginTop: 12 }} />
          <Button onClick={saveProfil} style={{ marginTop: 16 }}>Enregistrer</Button>
        </Card>
      </div>
    </div>
  );
}
