import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Pill, Building2, Hospital, CheckCircle, AlertCircle } from 'lucide-react';
import { useInscriptionProfessionnel, fetchDocumentsRequis } from '../hooks/useInscription';
import { getBranding } from '../config/branding';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldSelect, SelectWrap, AuthSubmit, Footnotes, Notice, SubSection,
  TypeGrid, TypeCard, FormGrid, DocZone, OperateurGrid, OperateurOption,
} from '../components/auth/AuthShell';
import BrandLogo from '../components/brand/BrandLogo';

const SuccessWrap = styled.div`
  text-align: center;
  padding: 20px 0 40px;

  h2 {
    margin: 20px 0 8px;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 500;
    color: #1C1917;
  }

  p { color: #6B6560; line-height: 1.6; font-size: 0.92rem; }

  .warn {
    margin-top: 12px;
    color: #B45309;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.85rem;
  }
`;

const TYPES = [
  { id: 'medecin', label: 'Médecin', icon: Stethoscope, desc: 'Ordre des médecins, diplôme' },
  { id: 'pharmacie', label: 'Pharmacie', icon: Pill, desc: 'Agrément officine' },
  { id: 'clinique', label: 'Clinique', icon: Building2, desc: 'Structure privée agréée' },
  { id: 'hopital', label: 'Hôpital', icon: Hospital, desc: 'Autorisation MINSANTE' },
];

const REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord', 'Adamaoua',
  'Est', 'Sud', 'Sud-Ouest', 'Nord-Ouest',
];

export default function RegisterProfessionnelPage() {
  const navigate = useNavigate();
  const mutation = useInscriptionProfessionnel();
  const branding = getBranding('medecin');
  const [type, setType] = useState('medecin');
  const [docsRequis, setDocsRequis] = useState({ documents: {}, operateurs_mobile_money: [], note_paiement: '' });
  const [files, setFiles] = useState({});
  const [form, setForm] = useState({
    email: '', password: '', nom: '', prenom: '', nom_structure: '',
    telephone: '', ville: 'Yaoundé', region: 'Centre', numero_ordre: '', numero_agrement: '', specialite: '',
    operateur_mobile: 'orange_money', numero_mobile_money: '', titulaire_compte: '', numero_marchand: '',
  });
  const [success, setSuccess] = useState(null);
  const [acceptCgu, setAcceptCgu] = useState(false);

  useEffect(() => {
    fetchDocumentsRequis().then(setDocsRequis).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptCgu) {
      toast.error('Veuillez accepter les Conditions Générales d\'Utilisation');
      return;
    }
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
          accept_cgu: true,
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
      <AuthShell wide>
        <SuccessWrap>
          <CheckCircle size={48} color="#0B3D30" strokeWidth={1.5} />
          <h2>Compte créé</h2>
          <p>{success.message}</p>
          {success.documents_manquants?.length > 0 && (
            <p className="warn">
              <AlertCircle size={16} />
              Documents à compléter ensuite : {success.documents_manquants.join(', ')}
            </p>
          )}
          <p style={{ marginTop: 16 }}>
            Vous pouvez vous connecter immédiatement. La validation MINSANTE finalisera votre visibilité publique.
          </p>
          <AuthSubmit type="button" onClick={() => navigate('/login')} style={{ marginTop: 28, maxWidth: 280 }}>
            Se connecter
          </AuthSubmit>
        </SuccessWrap>
      </AuthShell>
    );
  }

  const requiredDocs = docsRequis.documents?.[type] || docsRequis[type] || [];
  const operateurs = docsRequis.operateurs_mobile_money || [
    { id: 'orange_money', label: 'Orange Money' },
    { id: 'mtn_momo', label: 'MTN MoMo' },
    { id: 'wave', label: 'Wave' },
  ];

  return (
    <AuthShell wide>
      <Wordmark>
        <BrandLogo variant="compact" tagline="Inscription professionnelle" emblemSize={52} />
      </Wordmark>

      <SectionTitle>Créer mon compte pro</SectionTitle>
      <SectionHint>
        Compte créé tout de suite. Les documents (diplôme, carte d&apos;ordre, agréments…) se complètent ensuite pour la validation.
      </SectionHint>

      <Notice>
        <strong>Contexte Cameroun :</strong> traçabilité MINSANTE, données hébergées localement,
        conformité DPN en cours de déploiement.
      </Notice>

      <TypeGrid>
        {TYPES.map((t) => (
          <TypeCard key={t.id} type="button" $active={type === t.id} onClick={() => setType(t.id)}>
            <t.icon size={20} strokeWidth={1.75} />
            <h3>{t.label}</h3>
            <p>{t.desc}</p>
          </TypeCard>
        ))}
      </TypeGrid>

      <AuthForm onSubmit={handleSubmit}>
        <SubSection>Identité</SubSection>
        <FormGrid>
          {type === 'medecin' ? (
            <>
              <Field>
                <FieldLabel>Prénom</FieldLabel>
                <FieldInput value={form.prenom} onChange={set('prenom')} required />
              </Field>
              <Field>
                <FieldLabel>Nom</FieldLabel>
                <FieldInput value={form.nom} onChange={set('nom')} required />
              </Field>
              <Field>
                <FieldLabel>Spécialité</FieldLabel>
                <FieldInput value={form.specialite} onChange={set('specialite')} placeholder="Ex. Cardiologie" />
              </Field>
              <Field>
                <FieldLabel>N° Ordre des médecins</FieldLabel>
                <FieldInput value={form.numero_ordre} onChange={set('numero_ordre')} required />
              </Field>
            </>
          ) : (
            <>
              <Field className="full">
                <FieldLabel>Nom de la structure</FieldLabel>
                <FieldInput value={form.nom_structure} onChange={set('nom_structure')} required />
              </Field>
              <Field className="full">
                <FieldLabel>N° Agrément</FieldLabel>
                <FieldInput value={form.numero_agrement} onChange={set('numero_agrement')} required />
              </Field>
            </>
          )}
          <Field>
            <FieldLabel>Email professionnel</FieldLabel>
            <FieldInput type="email" value={form.email} onChange={set('email')} required />
          </Field>
          <Field>
            <FieldLabel>Mot de passe</FieldLabel>
            <FieldInput type="password" value={form.password} onChange={set('password')} required />
          </Field>
          <Field>
            <FieldLabel>Téléphone</FieldLabel>
            <FieldInput value={form.telephone} onChange={set('telephone')} placeholder="+237 6XX XX XX XX" />
          </Field>
          <Field>
            <FieldLabel>Ville</FieldLabel>
            <FieldInput value={form.ville} onChange={set('ville')} />
          </Field>
          <Field>
            <FieldLabel>Région</FieldLabel>
            <SelectWrap>
              <FieldSelect value={form.region} onChange={set('region')}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </FieldSelect>
            </SelectWrap>
          </Field>
        </FormGrid>

        <SubSection>Paiement Mobile Money</SubSection>
        <Notice style={{ marginBottom: 16 }}>
          {docsRequis.note_paiement || 'Obligatoire pour recevoir les paiements patients sur DjamSanté.'}
        </Notice>
        <FormGrid>
          <Field className="full">
            <FieldLabel>Opérateur Mobile Money</FieldLabel>
            <OperateurGrid>
              {operateurs.map((o) => (
                <OperateurOption
                  key={o.id}
                  type="button"
                  $active={form.operateur_mobile === o.id}
                  onClick={() => setForm({ ...form, operateur_mobile: o.id })}
                >
                  {o.label}
                </OperateurOption>
              ))}
            </OperateurGrid>
          </Field>
          <Field>
            <FieldLabel>Numéro Mobile Money</FieldLabel>
            <FieldInput
              value={form.numero_mobile_money}
              onChange={set('numero_mobile_money')}
              placeholder="+237 6XX XX XX XX"
              required
            />
          </Field>
          <Field className={type === 'medecin' ? '' : 'full'}>
            <FieldLabel>Titulaire du compte</FieldLabel>
            <FieldInput
              value={form.titulaire_compte}
              onChange={set('titulaire_compte')}
              placeholder={type === 'medecin' ? 'Dr. Prénom Nom' : 'Nom de la structure'}
              required
            />
          </Field>
          {type !== 'medecin' && (
            <Field>
              <FieldLabel>N° marchand (optionnel)</FieldLabel>
              <FieldInput
                value={form.numero_marchand}
                onChange={set('numero_marchand')}
                placeholder="Compte marchand Orange / MTN"
              />
            </Field>
          )}
        </FormGrid>

        <SubSection>Documents justificatifs (optionnel maintenant)</SubSection>
        <Notice style={{ marginBottom: 16 }}>
          Vous pourrez les ajouter après connexion. Requis pour la validation finale : diplôme + carte d&apos;ordre (médecin) ou agrément + autorisation (structure).
        </Notice>
        {requiredDocs.map((doc) => (
          <DocZone key={doc}>
            <label>{doc.replace(/_/g, ' ')}</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFiles({ ...files, [doc]: e.target.files[0] })}
            />
          </DocZone>
        ))}

        <Field style={{ marginTop: 20 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.84rem', color: '#6B6560', lineHeight: 1.45 }}>
            <input
              type="checkbox"
              checked={acceptCgu}
              onChange={(e) => setAcceptCgu(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              J&apos;accepte les{' '}
              <Link to="/cgu" target="_blank">Conditions Générales d&apos;Utilisation</Link>
              {' '}et la{' '}
              <Link to="/confidentialite" target="_blank">Politique de confidentialité</Link>.
            </span>
          </label>
        </Field>

        <AuthSubmit type="submit" disabled={mutation.isPending || !acceptCgu}>
          {mutation.isPending ? 'Création du compte…' : 'Créer mon compte'}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        <p><Link to="/cgu">CGU</Link> · <Link to="/confidentialite">Confidentialité</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
