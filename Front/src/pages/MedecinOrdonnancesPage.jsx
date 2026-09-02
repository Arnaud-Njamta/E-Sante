import React, { useState } from 'react';
import { FileText, Plus, PenLine } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { useOrdonnancesMedecin, useCreerOrdonnanceElec, useSignerOrdonnance } from '../hooks/useProfessionnel';
import toast from 'react-hot-toast';

export default function MedecinOrdonnancesPage() {
  const { data: ordonnances, isLoading } = useOrdonnancesMedecin();
  const creer = useCreerOrdonnanceElec();
  const signer = useSignerOrdonnance();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patient_id: '', diagnostic: '', instructions: '',
    medicaments: [{ nom: '', dosage: '', duree: '', instructions: '' }],
  });

  const handleCreer = async (e) => {
    e.preventDefault();
    try {
      const result = await creer.mutateAsync(form);
      await signer.mutateAsync(result.data.id);
      toast.success(`Ordonnance ${result.data.numero_unique} signée`);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur — chargez votre cachet dans Paramètres');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}><FileText size={24} style={{ verticalAlign: 'middle' }} /> Ordonnances électroniques</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0' }}>Ordonnances traçables — le patient retrouve ses rappels de prise sur son accueil DjamSanté</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> Nouvelle ordonnance</Button>
      </div>

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleCreer}>
            <Input label="ID Patient (UUID)" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required />
            <Input label="Diagnostic" value={form.diagnostic} onChange={(e) => setForm({ ...form, diagnostic: e.target.value })} />
            {form.medicaments.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                <Input placeholder="Médicament" value={m.nom} onChange={(e) => {
                  const meds = [...form.medicaments]; meds[i].nom = e.target.value; setForm({ ...form, medicaments: meds });
                }} />
                <Input placeholder="Dosage" value={m.dosage} onChange={(e) => {
                  const meds = [...form.medicaments]; meds[i].dosage = e.target.value; setForm({ ...form, medicaments: meds });
                }} />
                <Input placeholder="Durée" value={m.duree} onChange={(e) => {
                  const meds = [...form.medicaments]; meds[i].duree = e.target.value; setForm({ ...form, medicaments: meds });
                }} />
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => setForm({ ...form, medicaments: [...form.medicaments, { nom: '', dosage: '', duree: '' }] })} style={{ marginTop: 8 }}>+ Médicament</Button>
            <Input label="Instructions générales" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} style={{ marginTop: 12 }} />
            <Button type="submit" style={{ marginTop: 16 }}><PenLine size={16} /> Signer et émettre</Button>
          </form>
        </Card>
      )}

      {(ordonnances || []).map((o) => (
        <Card key={o.id} style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{o.numero_unique}</strong>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                Patient : {o.patient?.prenom} {o.patient?.nom} — {o.statut}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Code vérification pharmacie : <code>{o.code_verification}</code></p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
