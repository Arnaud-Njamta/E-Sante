import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Pill, Building2, Hospital, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useInscriptionProfessionnel, fetchDocumentsRequis } from '../hooks/useInscription';
import toast from 'react-hot-toast';

const Page = styled.div` max-width: 720px; margin: 0 auto; `;
const TypeGrid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; `;
const TypeCard = styled.button`
  padding: 20px; border-radius: 12px; border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary[500] : '#E2E8F0')};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : 'white')};
  cursor: pointer; text-align: left;
  h3 { margin: 8px 0 4px; font-size: 1rem; }
  p { margin: 0; font-size: 0.8rem; color: #64748B; }
`;
const DocZone = styled.div`
  border: 2px dashed #CBD5E1; border-radius: 8px; padding: 16px; margin-bottom: 12px;
  label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 0.9rem; }
  input { font-size: 0.85rem; }
`;
const InfoBox = styled.div`
  background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 0.85rem; color: #0369A1;
`;

const TYPES = [
  { id: 'medecin', label: 'Médecin', icon: Stethoscope, desc: 'Ordre des médecins, diplôme' },
  { id: 'pharmacie', label: 'Pharmacie', icon: Pill, desc: 'Agrément officine, autorisation' },
  { id: 'clinique', label: 'Clinique', icon: Building2, desc: 'Agrément structure privée' },
  { id: 'hopital', label: 'Hôpital', icon: Hospital, desc: 'Autorisation ministère de la Santé' },
];

const REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord', 'Adamaoua',
  'Est', 'Sud', 'Sud-Ouest', 'Nord-Ouest',
];

export default function RegisterProfessionnelPage() {
  const navigate = useNavigate();
  const mutation = useInscriptionProfessionnel();
  const [type, setType] = useState('medecin');
  const [docsRequis, setDocsRequis] = useState({ documents: {}, operateurs_mobile_money: [], note_paiement: '' });
  const [files, setFiles] = useState({});
  const [form, setForm] = useState({
    email: '', password: '', nom: '', prenom: '', nom_structure: '',
    telephone: '', ville: 'Yaoundé', region: 'Centre', numero_ordre: '', numero_agrement: '', specialite: '',
    operateur_mobile: 'orange_money', numero_mobile_money: '', titulaire_compte: '', numero_marchand: '',
  });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDocumentsRequis().then(setDocsRequis).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numero_mobile_money?.trim() || !form.titulaire_compte?.trim()) {
      toast.error('Renseignez le numéro Mobile Money et le titulaire du compte');
      return;
    }
    try {
      const { operateur_mobile, numero_mobile_money, titulaire_compte, numero_marchand, ...rest } = form;
      const result = await mutation.mutateAsync({
        payload: {
          ...rest,
          type_profil: type,
          paiement: {
            operateur: operateur_mobile,
            numero: numero_mobile_money,
            titulaire: titulaire_compte,
            numero_marchand: numero_marchand || undefined,
          },
        },
        files,
      });
      setSuccess(result.data);
      toast.success(result.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  if (success) {
    return (
      <Page style={{ padding: 40, textAlign: 'center' }}>
        <CheckCircle size={48} color="#22C55E" />
        <h2>Demande enregistrée</h2>
        <p style={{ color: '#64748B' }}>{success.message}</p>
        {success.documents_manquants?.length > 0 && (
          <p style={{ color: '#F59E0B' }}><AlertCircle size={16} /> Documents manquants : {success.documents_manquants.join(', ')}</p>
        )}
        <p style={{ fontSize: '0.9rem' }}>Délai de validation : 24-72h ouvrées. Conformément au cadre MINSANTE / santé numérique au Cameroun.</p>
        <Button onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Retour connexion</Button>
      </Page>
    );
  }

  const requiredDocs = docsRequis.documents?.[type] || docsRequis[type] || [];
  const operateurs = docsRequis.operateurs_mobile_money || [
    { id: 'orange_money', label: 'Orange Money' },
    { id: 'mtn_momo', label: 'MTN MoMo' },
    { id: 'wave', label: 'Wave' },
  ];

  return (
    <Page>
      <h1 style={{ margin: '0 0 8px' }}>Inscription professionnelle</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Médecins, pharmacies, cliniques et hôpitaux — validation des documents obligatoire.</p>

      <InfoBox>
        <strong>Contexte Cameroun :</strong> remplacez WhatsApp pour les ordonnances et consultations, avec traçabilité MINSANTE.
        Vos données restent hébergées localement. Conformité DPN (Dossier Patient Numérique) en cours de déploiement.
      </InfoBox>

      <TypeGrid>
        {TYPES.map((t) => (
          <TypeCard key={t.id} type="button" $active={type === t.id} onClick={() => setType(t.id)}>
            <t.icon size={24} />
            <h3>{t.label}</h3>
            <p>{t.desc}</p>
          </TypeCard>
        ))}
      </TypeGrid>

      <Card style={{ padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {type === 'medecin' ? (
              <>
                <Input label="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                <Input label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                <Input label="Spécialité" value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} />
                <Input label="N° Ordre des médecins" value={form.numero_ordre} onChange={(e) => setForm({ ...form, numero_ordre: e.target.value })} required />
              </>
            ) : (
              <>
                <Input label="Nom de la structure" value={form.nom_structure} onChange={(e) => setForm({ ...form, nom_structure: e.target.value })} required style={{ gridColumn: '1 / -1' }} />
                <Input label="N° Agrément" value={form.numero_agrement} onChange={(e) => setForm({ ...form, numero_agrement: e.target.value })} required />
              </>
            )}
            <Input label="Email professionnel" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Mot de passe" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+237 6XX XX XX XX" />
            <Input label="Ville" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Région</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <h3 style={{ margin: '24px 0 12px' }}>Coordonnées de paiement (Mobile Money)</h3>
          <InfoBox style={{ background: '#F0FDF9', borderColor: '#A7F3D0', color: '#047857' }}>
            {docsRequis.note_paiement || 'Obligatoire pour recevoir les paiements des patients sur DjamSanté (consultations, réservations pharmacie).'}
          </InfoBox>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Opérateur *</label>
              <select
                value={form.operateur_mobile}
                onChange={(e) => setForm({ ...form, operateur_mobile: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0' }}
                required
              >
                {operateurs.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <Input
              label="Numéro Mobile Money *"
              value={form.numero_mobile_money}
              onChange={(e) => setForm({ ...form, numero_mobile_money: e.target.value })}
              placeholder="+237 6XX XX XX XX"
              required
            />
            <Input
              label="Titulaire du compte *"
              value={form.titulaire_compte}
              onChange={(e) => setForm({ ...form, titulaire_compte: e.target.value })}
              placeholder={type === 'medecin' ? 'Dr. Prénom Nom' : 'Nom de la structure'}
              required
              style={{ gridColumn: type === 'medecin' ? 'span 1' : '1 / -1' }}
            />
            {type !== 'medecin' && (
              <Input
                label="N° marchand (optionnel)"
                value={form.numero_marchand}
                onChange={(e) => setForm({ ...form, numero_marchand: e.target.value })}
                placeholder="Si vous avez un compte marchand Orange/MTN"
              />
            )}
          </div>

          <h3 style={{ margin: '24px 0 12px' }}><Upload size={18} style={{ verticalAlign: 'middle' }} /> Documents justificatifs</h3>
          {requiredDocs.map((doc) => (
            <DocZone key={doc}>
              <label>{doc.replace('_', ' ')} *</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFiles({ ...files, [doc]: e.target.files[0] })} />
            </DocZone>
          ))}

          <Button type="submit" disabled={mutation.isPending} style={{ width: '100%', marginTop: 16 }}>
            {mutation.isPending ? 'Envoi...' : 'Soumettre ma demande'}
          </Button>
        </form>
      </Card>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem' }}>
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </Page>
  );
}
