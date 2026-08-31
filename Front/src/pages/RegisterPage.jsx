import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getBranding } from '../config/branding';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, Footnotes, FormGrid,
} from '../components/auth/AuthShell';
import BrandLogo from '../components/brand/BrandLogo';
import PasswordStrengthMeter, { scorePassword } from '../components/ui/PasswordStrengthMeter';

const Steps = styled.div`
  display: flex;
  gap: 8px;
  margin: 0 0 20px;
`;

const StepDot = styled.span`
  flex: 1;
  height: 4px;
  border-radius: 99px;
  background: ${({ $active }) => ($active ? '#2F6B4F' : '#E4DED4')};
`;

const StepHint = styled.p`
  margin: 0 0 16px;
  font-size: 0.82rem;
  color: #6B6560;
`;

/**
 * Inscription patient allégée :
 * Étape 1 — compte (email, mdp, CGU)
 * Étape 2 — identité (nom, prénom, téléphone)
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const branding = getBranding('patient');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, formState: { errors }, watch, trigger,
  } = useForm({
    defaultValues: { acceptCgu: false },
  });

  const acceptCgu = watch('acceptCgu');
  const passwordValue = watch('password') || '';

  const goNext = async () => {
    const ok = await trigger(['email', 'password', 'confirmPassword', 'acceptCgu']);
    if (!ok) return;
    if (!acceptCgu) {
      toast.error('Acceptez les CGU pour continuer');
      return;
    }
    setStep(2);
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await registerUser({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
      });
      toast.success('Bienvenue sur DjamSanté !');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" tagline={branding.tagline} emblemSize={52} />
      </Wordmark>

      <SectionTitle>Créer un compte</SectionTitle>
      <SectionHint>Deux étapes rapides — vous êtes soigné ensuite dans l&apos;app.</SectionHint>

      <Steps aria-hidden>
        <StepDot $active={step >= 1} />
        <StepDot $active={step >= 2} />
      </Steps>
      <StepHint>{step === 1 ? 'Étape 1/2 — Identifiants' : 'Étape 2/2 — Qui êtes-vous ?'}</StepHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <FieldInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                $error={!!errors.email}
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' },
                })}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <FieldInput
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                $error={!!errors.password}
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 8, message: 'Minimum 8 caractères' },
                  validate: (val) => {
                    const s = scorePassword(val);
                    return s.isAcceptable || 'Mot de passe trop faible (ajoutez majuscules, chiffres…)';
                  },
                })}
              />
              <PasswordStrengthMeter password={passwordValue} />
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirmer</FieldLabel>
              <FieldInput
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Retapez le mot de passe"
                $error={!!errors.confirmPassword}
                {...register('confirmPassword', {
                  required: 'Confirmez le mot de passe',
                  validate: (val) => val === watch('password') || 'Les mots de passe ne correspondent pas',
                })}
              />
              {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
            </Field>

            <Field>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.84rem', color: '#6B6560', lineHeight: 1.45 }}>
                <input type="checkbox" {...register('acceptCgu', { required: 'Acceptation des CGU obligatoire' })} style={{ marginTop: 3 }} />
                <span>
                  J&apos;accepte les{' '}
                  <Link to="/cgu" target="_blank">CGU</Link>
                  {' '}et la{' '}
                  <Link to="/confidentialite" target="_blank">confidentialité</Link>.
                </span>
              </label>
              {errors.acceptCgu && <FieldError>{errors.acceptCgu.message}</FieldError>}
            </Field>

            <AuthSubmit type="button" onClick={goNext}>
              Continuer
            </AuthSubmit>
          </>
        )}

        {step === 2 && (
          <>
            <FormGrid>
              <Field>
                <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
                <FieldInput
                  id="prenom"
                  autoComplete="given-name"
                  $error={!!errors.prenom}
                  {...register('prenom', { required: 'Le prénom est requis' })}
                />
                {errors.prenom && <FieldError>{errors.prenom.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="nom">Nom</FieldLabel>
                <FieldInput
                  id="nom"
                  autoComplete="family-name"
                  $error={!!errors.nom}
                  {...register('nom', { required: 'Le nom est requis' })}
                />
                {errors.nom && <FieldError>{errors.nom.message}</FieldError>}
              </Field>
            </FormGrid>

            <Field>
              <FieldLabel htmlFor="telephone">Téléphone (optionnel)</FieldLabel>
              <FieldInput
                id="telephone"
                type="tel"
                autoComplete="tel"
                placeholder="+237 6XX XX XX XX"
                $error={!!errors.telephone}
                {...register('telephone', {
                  minLength: { value: 9, message: 'Numéro invalide' },
                })}
              />
              {errors.telephone && <FieldError>{errors.telephone.message}</FieldError>}
            </Field>

            <div style={{ display: 'flex', gap: 10 }}>
              <AuthSubmit type="button" onClick={() => setStep(1)} style={{ flex: 1, background: '#E8E4DC', color: '#1C1917' }}>
                Retour
              </AuthSubmit>
              <AuthSubmit type="submit" disabled={submitting} style={{ flex: 1.4 }}>
                {submitting ? 'Création…' : 'Créer mon compte'}
              </AuthSubmit>
            </div>
          </>
        )}
      </AuthForm>

      <Footnotes>
        <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        <p>
          <Link to="/register-professionnel">Compte professionnel</Link>
          {' · '}
          <Link to="/cgu">CGU</Link>
        </p>
      </Footnotes>
    </AuthShell>
  );
}
