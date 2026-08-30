import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getBranding, getHomeRoute } from '../config/branding';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, Footnotes, DEEP,
} from '../components/auth/AuthShell';

const TextLink = styled(Link)`
  align-self: flex-end;
  font-size: 0.84rem;
  font-weight: 600;
  color: ${DEEP};
  text-decoration: none;
  margin-top: -6px;
  &:hover { text-decoration: underline; text-underline-offset: 3px; }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const branding = getBranding('patient');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      toast.success(`Bienvenue sur ${getBranding(result.role).appName} !`);
      navigate(getHomeRoute(result.role), { replace: true });
    } catch (err) {
      if (!err.response) {
        toast.error('Impossible de joindre le serveur. Vérifiez votre connexion ou que l\'API est démarrée.');
      } else if (err.response.status >= 500) {
        toast.error('Serveur indisponible (erreur 502/500). Réessayez dans quelques instants.');
      } else {
        toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Wordmark>
        <h2>{branding.appName}</h2>
        <p>{branding.tagline}</p>
      </Wordmark>

      <SectionTitle>Connexion</SectionTitle>
      <SectionHint>
        Patient, professionnel ou administrateur — un seul accès pour tous les espaces.
      </SectionHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <FieldInput
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            autoComplete="email"
            $error={!!errors.email}
            {...register('email', { required: 'Email requis' })}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <FieldInput
            id="password"
            type="password"
            placeholder="8 caractères minimum"
            autoComplete="current-password"
            $error={!!errors.password}
            {...register('password', {
              required: 'Mot de passe requis',
              minLength: { value: 8, message: 'Min. 8 caractères' },
            })}
          />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        <TextLink to="/mot-de-passe-oublie">Mot de passe oublié</TextLink>

        <AuthSubmit type="submit" disabled={submitting}>
          {submitting ? 'Connexion en cours…' : 'Entrer'}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p>Nouveau sur la plateforme ? <Link to="/register">Créer un compte patient</Link></p>
        <p>Médecin, pharmacie ou établissement ? <Link to="/register/professionnel">Demander un accès pro</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
