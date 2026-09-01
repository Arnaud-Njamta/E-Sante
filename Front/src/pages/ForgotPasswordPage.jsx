import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, Footnotes, Notice,
} from '../components/auth/AuthShell';
import BrandLogo from '../components/brand/BrandLogo';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      await client.post(ENDPOINTS.auth.forgotPassword, { email });
      setSent(true);
      toast.success(t('auth.forgot_toast'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.forgot_error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" emblemSize={52} />
      </Wordmark>

      <SectionTitle>{t('auth.forgot_title')}</SectionTitle>
      <SectionHint>{t('auth.forgot_hint')}</SectionHint>

      {sent ? (
        <Notice>{t('auth.forgot_sent')}</Notice>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
            <FieldInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.email_placeholder')}
              $error={!!errors.email}
              {...register('email', {
                required: t('auth.email_required'),
                pattern: { value: /^\S+@\S+$/i, message: t('auth.email_invalid') },
              })}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <AuthSubmit type="submit" disabled={submitting}>
            {submitting ? t('auth.sending') : t('auth.send_link')}
          </AuthSubmit>
        </AuthForm>
      )}

      <Footnotes>
        <p><Link to="/login">{t('auth.back_login')}</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
