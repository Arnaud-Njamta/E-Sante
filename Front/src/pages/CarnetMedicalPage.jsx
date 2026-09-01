import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookHeart } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import CarnetNotebook from '../components/carnet/CarnetNotebook';
import CarnetSuccessAnimation from '../components/carnet/CarnetSuccessAnimation';
import Card from '../components/ui/Card';
import { useCarnetMedical, useTextesConsentement, useUpdateCarnetMedical } from '../hooks/useCarnetMedical';
import { useCarnetOfflineCache, useHydrateCarnetFromCache } from '../hooks/useCarnetOffline';
import toast from 'react-hot-toast';

const emptyForm = {
  groupe_sanguin: '', allergies: [], pathologies: [],
  antecedents_familiaux: [], antecedents_chirurgicaux: [],
  traitements_habituelles: [], vaccinations: [], notes_medicales: '',
  observations_carnet: [],
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
    observations_carnet: data.observations_carnet || [],
    activer_carnet: !!data.actif,
    consentement_carnet: !!data.actif,
  };
}

export default function CarnetMedicalPage() {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useCarnetMedical();
  useHydrateCarnetFromCache();
  useCarnetOfflineCache(data);
  const { data: textes } = useTextesConsentement();
  const update = useUpdateCarnetMedical();

  const [form, setForm] = useState(emptyForm);
  const [showSuccess, setShowSuccess] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm(dataToForm(data));
    setNeedsConsent(!data.actif);
  }, [data]);

  const save = async () => {
    if (needsConsent && form.activer_carnet && !form.consentement_carnet) {
      toast.error(t('carnet.consent_required'));
      return;
    }

    try {
      const saved = await update.mutateAsync({
        ...form,
        activer_carnet: needsConsent ? form.activer_carnet : true,
        consentement_carnet: needsConsent ? form.consentement_carnet : true,
        politique_version: textes?.version,
      });

      if (needsConsent && saved?.actif) {
        setShowSuccess(true);
        setNeedsConsent(false);
      } else {
        toast.success(t('toasts.carnet_saved'));
      }
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic'));
    }
  };

  const handleSuccessDone = async () => {
    setShowSuccess(false);
    await refetch();
    toast.success(t('toasts.carnet_ready'));
  };

  if (isLoading) return <Spinner text={t('common.loading')} />;

  return (
    <div>
      {showSuccess && <CarnetSuccessAnimation onDone={handleSuccessDone} />}

      <PageHeader
        title={(
          <>
            <BookHeart size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {t('carnet.my_title')}
          </>
        )}
        subtitle={t('carnet.page_subtitle')}
      />

      {needsConsent && (
        <Card style={{ padding: 16, marginBottom: 16, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.consentement_carnet}
              onChange={(e) => setForm((f) => ({ ...f, consentement_carnet: e.target.checked, activer_carnet: e.target.checked }))}
              style={{ marginTop: 3 }}
            />
            <span>{textes?.consentement_carnet || t('carnet.consent_default')}</span>
          </label>
        </Card>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{t('carnet.blood_group')}</label>
        <select
          value={form.groupe_sanguin}
          onChange={(e) => setForm((f) => ({ ...f, groupe_sanguin: e.target.value }))}
          style={{ display: 'block', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', width: 160 }}
        >
          <option value="">{t('carnet.choose')}</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <CarnetNotebook
        data={{ ...data, ...form }}
        form={form}
        setForm={setForm}
        onSave={save}
        saving={update.isPending}
        readOnly={needsConsent && !form.consentement_carnet}
      />
    </div>
  );
}
