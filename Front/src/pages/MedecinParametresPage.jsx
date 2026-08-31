import React, { useState } from 'react';
import { Stamp, Clock, Save, Video } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PhotoUploadCard from '../components/ui/PhotoUploadCard';
import { authenticatedFileUrl } from '../utils/fileUrl';
import { useMedecinDashboard } from '../hooks/useDashboards';
import { useUploadMedecinPhoto, useUploadMedecinCachet, useUpdateMedecinHoraires, useUpdateMedecinProfil } from '../hooks/useProfessionnel';
import toast from 'react-hot-toast';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const defaultHoraires = () => Object.fromEntries(JOURS.map((j) => [
  j,
  ['samedi', 'dimanche'].includes(j)
    ? { actif: false, creneaux: [] }
    : { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
]));

export default function MedecinParametresPage() {
  const { data, isLoading, refetch } = useMedecinDashboard();
  const uploadPhoto = useUploadMedecinPhoto();
  const uploadCachet = useUploadMedecinCachet();
  const updateHoraires = useUpdateMedecinHoraires();
  const updateProfil = useUpdateMedecinProfil();
  const [horaires, setHoraires] = useState(null);
  const [teleconsult, setTeleconsult] = useState(false);
  const [tarif, setTarif] = useState('');
  const [photoKey, setPhotoKey] = useState(0);

  React.useEffect(() => {
    if (data?.profil?.horaires_consultation) {
      setHoraires(data.profil.horaires_consultation);
    }
    if (data?.profil) {
      setTeleconsult(!!data.profil.accepte_teleconsultation);
      setTarif(data.profil.tarif_consultation_fcfa || '');
    }
  }, [data]);

  if (isLoading) return <Spinner />;
  const profil = data?.profil;

  const cachetUrl = profil?.fichier_cachet_id
    ? authenticatedFileUrl(profil.fichier_cachet_id, photoKey)
    : null;

  const handlePhoto = async (file) => {
    try {
      await uploadPhoto.mutateAsync(file);
      setPhotoKey((k) => k + 1);
      await refetch();
      toast.success('Photo mise à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'upload de la photo');
    }
  };

  const handleCachet = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadCachet.mutateAsync(file);
      setPhotoKey((k) => k + 1);
      await refetch();
      toast.success('Cachet électronique enregistré');
    } catch {
      toast.error('Erreur upload');
    }
  };

  const saveHoraires = async () => {
    try {
      await updateHoraires.mutateAsync(horaires || defaultHoraires());
      toast.success('Disponibilités enregistrées');
    } catch {
      toast.error('Erreur');
    }
  };

  const saveTeleconsult = async () => {
    try {
      await updateProfil.mutateAsync({
        accepte_teleconsultation: teleconsult,
        tarif_consultation_fcfa: tarif ? parseInt(tarif, 10) : null,
      });
      toast.success('Téléconsultation mise à jour');
    } catch {
      toast.error('Erreur');
    }
  };

  const h = horaires || defaultHoraires();

  return (
    <div>
      <h1 style={{ margin: '0 0 24px' }}>Paramètres professionnels</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <PhotoUploadCard
          title="Photo de profil"
          subtitle="Visible dans l'annuaire santé et sur votre fiche publique"
          photoUrl={profil?.photo_url}
          fichierId={profil?.fichier_photo_id}
          onUpload={handlePhoto}
          isUploading={uploadPhoto.isPending}
        />

        <Card style={{ padding: 24 }}>
          <h3><Stamp size={18} /> Cachet électronique</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Obligatoire pour signer des ordonnances électroniques (Ordre des Médecins du Cameroun).
          </p>
          {cachetUrl && <img src={cachetUrl} alt="Cachet" style={{ maxWidth: 120, marginBottom: 12 }} />}
          <input type="file" accept="image/*" onChange={handleCachet} />
        </Card>
      </div>

      <Card style={{ padding: 24, marginTop: 24 }}>
        <h3><Video size={18} /> Téléconsultation</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
          Proposez des consultations vidéo à distance (Jitsi Meet — sans frais API).
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input type="checkbox" checked={teleconsult} onChange={(e) => setTeleconsult(e.target.checked)} />
          J'accepte les téléconsultations
        </label>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.85rem' }}>Tarif consultation (FCFA)</label>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '4px 0 6px' }}>
            Privé — visible uniquement par vos patients, pas par les établissements où vous exercez.
          </p>
          <input type="number" value={tarif} onChange={(e) => setTarif(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }} />
        </div>
        <Button onClick={saveTeleconsult} disabled={updateProfil.isPending}><Save size={16} /> Enregistrer</Button>
      </Card>

      <Card style={{ padding: 24, marginTop: 24 }}>
        <h3><Clock size={18} /> Disponibilités de consultation</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
          Les patients verront ces créneaux pour prendre rendez-vous.
        </p>
        {JOURS.map((jour) => (
          <div key={jour} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <label style={{ width: 100, textTransform: 'capitalize' }}>
              <input type="checkbox" checked={h[jour]?.actif} onChange={(e) => setHoraires({ ...h, [jour]: { ...h[jour], actif: e.target.checked } })} />
              {' '}{jour}
            </label>
            {h[jour]?.actif && (
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                {h[jour].creneaux?.map((c) => `${c.debut}-${c.fin}`).join(', ') || '08:00-18:00'}
              </span>
            )}
          </div>
        ))}
        <Button onClick={saveHoraires} style={{ marginTop: 16 }}><Save size={16} /> Enregistrer</Button>
      </Card>
    </div>
  );
}
