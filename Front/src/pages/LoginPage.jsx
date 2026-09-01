import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getBranding, getHomeRoute } from '../config/branding';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, Footnotes, DEEP,
} from '../components/auth/AuthShell';
import BrandLogo from '../components/brand/BrandLogo';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated, role, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const branding = getBranding('patient');
  const { register, handleSubmit, formState: { errors } } = useForm();

  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(getHomeRoute(role), { replace: true });
    }
  }, [loading, isAuthenticated, role, navigate]);

  if (loading) {
    return <Spinner fullPage text={t('auth.loading')} />;
  }

  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      toast.success(t('auth.welcome', { appName: getBranding(result.role).appName }));
      navigate(getHomeRoute(result.role), { replace: true });
    } catch (err) {
      if (!err.response) {
        toast.error(t('auth.error_network'));
      } else if (err.response.status >= 500) {
        toast.error(t('auth.error_server'));
      } else {
        toast.error(err.response?.data?.message || t('auth.error_credentials'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" tagline={branding.tagline} emblemSize={52} />
      </Wordmark>

      <SectionTitle>{t('auth.login_title')}</SectionTitle>
      <SectionHint>{t('auth.login_hint')}</SectionHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
          <FieldInput
            id="email"
            type="email"
            placeholder={t('auth.email_placeholder')}
            autoComplete="email"
            $error={!!errors.email}
            {...register('email', { required: t('auth.email_required') })}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
          <FieldInput
            id="password"
            type="password"
            placeholder={t('auth.password_placeholder')}
            autoComplete="current-password"
            $error={!!errors.password}
            {...register('password', {
              required: t('auth.password_required'),
              minLength: { value: 8, message: t('auth.password_min') },
            })}
          />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        <TextLink to="/mot-de-passe-oublie">{t('auth.forgot_password')}</TextLink>

        <AuthSubmit type="submit" disabled={submitting}>
          {submitting ? t('auth.submitting_login') : t('auth.enter')}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p>{t('auth.no_account')} <Link to="/register">{t('auth.create_account')}</Link></p>
        <p>{t('auth.pro_access')} <Link to="/register/professionnel">{t('auth.request_pro')}</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
