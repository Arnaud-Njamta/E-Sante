import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, Footnotes, Notice,
} from '../components/auth/AuthShell';
import BrandLogo from '../components/brand/BrandLogo';
import PasswordStrengthMeter, { scorePassword } from '../components/ui/PasswordStrengthMeter';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const passwordValue = watch('password') || '';

  const onSubmit = async ({ password }) => {
    if (!token) {
      toast.error('Lien invalide — demandez un nouvel e-mail.');
      return;
    }
    setSubmitting(true);
    try {
      await client.post(ENDPOINTS.auth.resetPassword, { token, password });
      toast.success('Mot de passe mis à jour !');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lien expiré ou invalide');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <Wordmark>
          <BrandLogo variant="compact" emblemSize={52} />
        </Wordmark>
        <SectionTitle>Lien invalide</SectionTitle>
        <Notice>
          Ce lien de réinitialisation est incomplet ou a expiré.
          Demandez un nouvel e-mail depuis la page « Mot de passe oublié ».
        </Notice>
        <Footnotes>
          <p><Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link></p>
        </Footnotes>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" emblemSize={52} />
      </Wordmark>

      <SectionTitle>Nouveau mot de passe</SectionTitle>
      <SectionHint>Choisissez un mot de passe sécurisé pour votre compte DjamSanté.</SectionHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
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
                return s.isAcceptable || 'Mot de passe trop faible';
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
            $error={!!errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Confirmez le mot de passe',
              validate: (val) => val === watch('password') || 'Les mots de passe ne correspondent pas',
            })}
          />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
        </Field>

        <AuthSubmit type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p><Link to="/login">← Retour à la connexion</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
