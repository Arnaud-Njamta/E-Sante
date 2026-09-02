import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Pill, Building2, Hospital, HeartPulse, UserRound, Baby, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useInscriptionProfessionnel, fetchDocumentsRequis } from '../hooks/useInscription';
import { getBranding } from '../config/branding';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldSelect, SelectWrap, AuthSubmit, Footnotes, Notice, SubSection,
  TypeGrid, TypeCard, FormGrid, DocZone, OperateurGrid, OperateurOption,
} from '../components/auth/AuthShell';
import AuthPasswordInput from '../components/auth/AuthPasswordInput';
import BrandLogo from '../components/brand/BrandLogo';
import { SPECIALITES_BY_PROFIL } from '../config/cameroonSpecialties';
import PasswordStrengthMeter, { scorePassword } from '../components/ui/PasswordStrengthMeter';

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
  { id: 'medecin', label: 'Médecin', icon: Stethoscope, desc: 'Ordre des médecins', soignant: true },
  { id: 'infirmier', label: 'Infirmier(ère)', icon: HeartPulse, desc: 'Diplôme + inscription', soignant: true },
  { id: 'aide_soignant', label: 'Aide-soignant(e)', icon: UserRound, desc: 'Attestation / diplôme', soignant: true },
  { id: 'sage_femme', label: 'Sage-femme', icon: Baby, desc: 'Ordre des sages-femmes', soignant: true },
  { id: 'kinesitherapeute', label: 'Kinésithérapeute', icon: Activity, desc: 'Diplôme + ordre', soignant: true },
  { id: 'pharmacie', label: 'Pharmacie', icon: Pill, desc: 'Agrément officine', soignant: false },
  { id: 'clinique', label: 'Clinique', icon: Building2, desc: 'Structure privée', soignant: false },
  { id: 'hopital', label: 'Hôpital', icon: Hospital, desc: 'Autorisation MINSANTE', soignant: false },
];

const isSoignantType = (t) => TYPES.find((x) => x.id === t)?.soignant;

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
  const [declarationCasierVierge, setDeclarationCasierVierge] = useState(false);

  useEffect(() => {
    fetchDocumentsRequis().then(setDocsRequis).catch(() => {});
  }, []);

  useEffect(() => {
    setForm((f) => ({ ...f, specialite: '' }));
    setDeclarationCasierVierge(false);
  }, [type]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptCgu) {
      toast.error('Veuillez accepter les Conditions Générales d\'Utilisation');
      return;
    }
    const pwdScore = scorePassword(form.password);
    if (!pwdScore.isAcceptable) {
      toast.error('Mot de passe trop faible — renforcez-le avant de continuer');
      return;
    }
    if (!form.numero_mobile_money?.trim() || !form.titulaire_compte?.trim()) {
      toast.error('Renseignez le numéro Mobile Money et le titulaire du compte');
      return;
    }
    if (!files.piece_identite) {
      toast.error(
        isSoignantType(type)
          ? 'La pièce d\'identité est obligatoire (CNI, passeport ou carte de séjour)'
          : 'La pièce d\'identité du représentant légal est obligatoire',
      );
      return;
    }
    if (isSoignantType(type) && !files.casier_judiciaire && !declarationCasierVierge) {
      toast.error('Joignez votre casier judiciaire ou cochez la déclaration sur l\'honneur');
      return;
    }
    if (isSoignantType(type) && !form.specialite?.trim()) {
      toast.error('Sélectionnez votre spécialité ou domaine d\'exercice');
      return;
    }
    try {
      const { operateur_mobile, numero_mobile_money, titulaire_compte, numero_marchand, ...rest } = form;
      const result = await mutation.mutateAsync({
        payload: {
          ...rest,
          type_profil: type,
          accept_cgu: true,
          declaration_casier_vierge: isSoignantType(type) ? declarationCasierVierge : false,
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
  const optionalDocs = docsRequis.documents_optionnels?.[type] || [];
  const docLabels = {
    ...(docsRequis.labels || {}),
    ...(docsRequis.labels_by_profil?.[type] || {}),
  };
  const specialtyOptions = docsRequis.specialites?.[type] || SPECIALITES_BY_PROFIL[type] || [];
  const documentsNotice = isSoignantType(type)
    ? (docsRequis.notes_documents?.soignant || docsRequis.note_documents)
    : (docsRequis.notes_documents?.structure || docsRequis.note_documents);
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
        {isSoignantType(type)
          ? 'Compte créé tout de suite. CNI et casier judiciaire obligatoires pour les soignants.'
          : 'Compte créé tout de suite. CNI du représentant légal + agréments MINSANTE pour la structure.'}
        {' '}Diplôme, carte d&apos;ordre et autres pièces complètent la validation.
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
          {isSoignantType(type) ? (
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
                <FieldLabel>{type === 'medecin' ? 'Spécialité' : 'Domaine / service'}</FieldLabel>
                <SelectWrap>
                  <FieldSelect value={form.specialite} onChange={set('specialite')} required>
                    <option value="">— Choisir —</option>
                    {specialtyOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </FieldSelect>
                </SelectWrap>
              </Field>
              <Field>
                <FieldLabel>
                  {type === 'aide_soignant' ? 'N° attestation (si disponible)' : 'N° Ordre / inscription'}
                </FieldLabel>
                <FieldInput
                  value={form.numero_ordre}
                  onChange={set('numero_ordre')}
                  required={type !== 'aide_soignant'}
                />
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
            <AuthPasswordInput
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
            <PasswordStrengthMeter password={form.password} />
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
          <Field className={isSoignantType(type) ? '' : 'full'}>
            <FieldLabel>Titulaire du compte</FieldLabel>
            <FieldInput
              value={form.titulaire_compte}
              onChange={set('titulaire_compte')}
              placeholder={isSoignantType(type) ? 'Prénom Nom' : 'Nom de la structure'}
              required
            />
          </Field>
          {!isSoignantType(type) && (
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

        <SubSection>Documents justificatifs</SubSection>
        <Notice style={{ marginBottom: 16 }}>
          {documentsNotice}
        </Notice>
        {requiredDocs.map((doc) => (
          <DocZone key={doc}>
            <label>
              {docLabels[doc] || doc.replace(/_/g, ' ')}
              {doc === 'piece_identite' && ' *'}
              {isSoignantType(type) && doc === 'casier_judiciaire' && ' *'}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              required={doc === 'piece_identite' || (isSoignantType(type) && doc === 'casier_judiciaire')}
              onChange={(e) => setFiles({ ...files, [doc]: e.target.files[0] })}
            />
          </DocZone>
        ))}

        {optionalDocs.map((doc) => (
          <DocZone key={doc}>
            <label>
              {docLabels[doc] || doc.replace(/_/g, ' ')}
              {' '}(optionnel)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFiles({ ...files, [doc]: e.target.files[0] })}
            />
          </DocZone>
        ))}

        {isSoignantType(type) && (
        <Field style={{ marginTop: 12 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.84rem', color: '#6B6560', lineHeight: 1.45 }}>
            <input
              type="checkbox"
              checked={declarationCasierVierge}
              onChange={(e) => setDeclarationCasierVierge(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              Je déclare sur l&apos;honneur ne pas avoir de condamnation figurant au casier judiciaire
              (à la place de l&apos;extrait bulletin n°3, si non disponible immédiatement).
            </span>
          </label>
        </Field>
        )}

        {docsRequis.sources_verification?.length > 0 && (
          <Notice style={{ marginTop: 12, fontSize: '0.78rem' }}>
            <strong>Vérification officielle :</strong>{' '}
            {docsRequis.sources_verification.map((s) => s.nom).join(' · ')}
          </Notice>
        )}

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
          {mutation.isPending
            ? 'Création du compte…'
            : acceptCgu
              ? 'Créer mon compte'
              : 'Acceptez d’abord les CGU'}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        <p><Link to="/cgu">CGU</Link> · <Link to="/confidentialite">Confidentialité</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
