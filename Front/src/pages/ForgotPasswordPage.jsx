import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, Footnotes, Notice,
} from '../components/auth/AuthShell';
import BrandLogo from '../components/brand/BrandLogo';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      await client.post(ENDPOINTS.auth.forgotPassword, { email });
      setSent(true);
      toast.success('Si un compte existe, un e-mail vient d\'être envoyé.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d\'envoyer l\'e-mail');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" emblemSize={52} />
      </Wordmark>

      <SectionTitle>Mot de passe oublié</SectionTitle>
      <SectionHint>
        Saisissez votre e-mail. Nous vous enverrons un lien pour choisir un nouveau mot de passe.
      </SectionHint>

      {sent ? (
        <Notice>
          Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé.
          Vérifiez aussi vos spams. Le lien est valable 1 heure.
        </Notice>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
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

          <AuthSubmit type="submit" disabled={submitting}>
            {submitting ? 'Envoi…' : 'Envoyer le lien'}
          </AuthSubmit>
        </AuthForm>
      )}

      <Footnotes>
        <p><Link to="/login">← Retour à la connexion</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
