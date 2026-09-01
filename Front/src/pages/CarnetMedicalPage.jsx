import React, { useState, useEffect } from 'react';
import { BookHeart, Shield, Save, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import { useCarnetMedical, useTextesConsentement, useUpdateCarnetMedical } from '../hooks/useCarnetMedical';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #E2E8F0', fontSize: '0.9rem', marginTop: 4,
};

const TagInput = ({ label, values, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input style={{ ...inputStyle, marginTop: 0, flex: 1 }} value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
        <Button type="button" size="sm" onClick={add}><Plus size={14} /></Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {values.map((v) => (
          <span key={v} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 99, background: '#ECFDF5', color: '#047857', fontSize: '0.8rem',
          }}>
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function CarnetMedicalPage() {
  const { data, isLoading } = useCarnetMedical();
  const { data: textes } = useTextesConsentement();
  const update = useUpdateCarnetMedical();
  const [form, setForm] = useState({
    groupe_sanguin: '', allergies: [], pathologies: [],
    antecedents_familiaux: [], antecedents_chirurgicaux: [],
    traitements_habituelles: [], vaccinations: [], notes_medicales: '',
    activer_carnet: false, consentement_carnet: false,
  });

  useEffect(() => {
    if (data) {
      setForm({
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
      });
    }
  }, [data]);

  const save = async () => {
    if (form.activer_carnet && !form.consentement_carnet) {
      toast.error('Acceptez l\'activation du carnet médical pour enregistrer');
      return;
    }
    try {
      await update.mutateAsync({
        ...form,
        politique_version: textes?.version,
      });
      toast.success('Carnet médical enregistré');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={<> <BookHeart size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Carnet médical électronique</>}
        subtitle="Vos antécédents, allergies et traitements — partagés uniquement avec votre consentement (secret médical, Cameroun)."
      />

      <Card style={{ padding: 16, marginBottom: 20, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <Shield size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        <strong>Confidentialité :</strong>{' '}
        {textes?.politique_confidentialite?.resume || 'Données protégées conformément au secret médical.'}
        {' '}<Link to="/confidentialite">Politique complète</Link>
      </Card>

      <Card style={{ padding: 24 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Groupe sanguin</label>
        <select style={inputStyle} value={form.groupe_sanguin} onChange={(e) => setForm({ ...form, groupe_sanguin: e.target.value })}>
          <option value="">Non renseigné</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <TagInput label="Allergies" values={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} placeholder="Ex. Pénicilline, Arachides…" />
        <TagInput label="Pathologies / maladies chroniques" values={form.pathologies} onChange={(v) => setForm({ ...form, pathologies: v })} placeholder="Ex. Diabète, Hypertension…" />
        <TagInput label="Antécédents familiaux" values={form.antecedents_familiaux} onChange={(v) => setForm({ ...form, antecedents_familiaux: v })} />
        <TagInput label="Antécédents chirurgicaux" values={form.antecedents_chirurgicaux} onChange={(v) => setForm({ ...form, antecedents_chirurgicaux: v })} />
        <TagInput label="Traitements habituels" values={form.traitements_habituelles} onChange={(v) => setForm({ ...form, traitements_habituelles: v })} />
        <TagInput label="Vaccinations" values={form.vaccinations} onChange={(v) => setForm({ ...form, vaccinations: v })} />

        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notes complémentaires</label>
        <textarea style={{ ...inputStyle, minHeight: 80 }} value={form.notes_medicales}
          onChange={(e) => setForm({ ...form, notes_medicales: e.target.value })} />

        <label style={{ display: 'flex', gap: 10, marginTop: 20, fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.activer_carnet} onChange={(e) => setForm({ ...form, activer_carnet: e.target.checked })} />
          Activer mon carnet médical sur DjamSanté
        </label>
        {form.activer_carnet && (
          <label style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.consentement_carnet} onChange={(e) => setForm({ ...form, consentement_carnet: e.target.checked })} />
            {textes?.carnet_activation?.resume || 'J\'accepte l\'activation de mon carnet médical personnel.'}
          </label>
        )}

        <Button onClick={save} disabled={update.isPending} style={{ marginTop: 24 }}>
          <Save size={16} /> Enregistrer le carnet
        </Button>
      </Card>
    </div>
  );
}
