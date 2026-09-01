import React, { useState, useEffect } from 'react';
import { BookHeart } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import CarnetMedicalForm from '../components/carnet/CarnetMedicalForm';
import CarnetMedicalView from '../components/carnet/CarnetMedicalView';
import CarnetSuccessAnimation from '../components/carnet/CarnetSuccessAnimation';
import { useCarnetMedical, useTextesConsentement, useUpdateCarnetMedical } from '../hooks/useCarnetMedical';
import toast from 'react-hot-toast';

const emptyForm = {
  groupe_sanguin: '', allergies: [], pathologies: [],
  antecedents_familiaux: [], antecedents_chirurgicaux: [],
  traitements_habituelles: [], vaccinations: [], notes_medicales: '',
  activer_carnet: false, consentement_carnet: false,
};

function dataToForm(data) {
  return {
    groupe_sanguin: data.groupe_sanguin || '',
    allergies: data.allergies || [],
    pathologies: data.pathologies || [],
    antecedents_familiaux: data.antecedents_familiaux || [],
    antecedents_chirurgicaux: data.antecedents_chirurgicaux || [],
    traitements_habituelles: data.traitements_habituelles || [],
    vaccinations: data.vaccinations || [],
    notes_medicales: data.notes_medicales || '',
    activer_carnet: !!data.actif,
    consentement_carnet: !!data.actif,
  };
}

export default function CarnetMedicalPage() {
  const { data, isLoading, refetch } = useCarnetMedical();
  const { data: textes } = useTextesConsentement();
  const update = useUpdateCarnetMedical();

  const [mode, setMode] = useState('loading');
  const [form, setForm] = useState(emptyForm);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm(dataToForm(data));
    setMode((prev) => {
      if (prev === 'edit') return prev;
      return data.actif ? 'view' : 'create';
    });
  }, [data]);

  const save = async () => {
    const wasInactive = !data?.actif;

    if (wasInactive && form.activer_carnet && !form.consentement_carnet) {
      toast.error('Acceptez l\'activation du carnet médical pour enregistrer');
      return;
    }

    try {
      const saved = await update.mutateAsync({
        ...form,
        activer_carnet: wasInactive ? form.activer_carnet : true,
        consentement_carnet: wasInactive ? form.consentement_carnet : true,
        politique_version: textes?.version,
      });

      if (wasInactive && saved?.actif) {
        setShowSuccess(true);
      } else {
        toast.success('Carnet médical mis à jour');
        setMode('view');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleSuccessDone = async () => {
    setShowSuccess(false);
    await refetch();
    setMode('view');
    toast.success('Votre carnet médical est prêt');
  };

  if (isLoading || mode === 'loading') return <Spinner />;

  const isFirstSetup = !data?.actif;

  return (
    <div>
      {showSuccess && <CarnetSuccessAnimation onDone={handleSuccessDone} />}

      <PageHeader
        title={(
          <>
            <BookHeart size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {mode === 'view' ? 'Mon carnet médical' : 'Carnet médical électronique'}
          </>
        )}
        subtitle={
          mode === 'view'
            ? 'Vos informations de santé — modifiables à tout moment.'
            : 'Renseignez vos antécédents, allergies et traitements — partagés uniquement avec votre consentement.'
        }
      />

      {mode === 'view' && data?.actif ? (
        <CarnetMedicalView data={data} onEdit={() => setMode('edit')} />
      ) : (
        <CarnetMedicalForm
          form={form}
          setForm={setForm}
          textes={textes}
          onSave={save}
          saving={update.isPending}
          isFirstSetup={isFirstSetup}
          onCancel={data?.actif ? () => { setForm(dataToForm(data)); setMode('view'); } : undefined}
        />
      )}
    </div>
  );
}
