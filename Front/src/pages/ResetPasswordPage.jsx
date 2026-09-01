import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import PasswordStrengthMeter, { scorePassword } from '../components/ui/PasswordStrengthMeter';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const passwordValue = watch('password') || '';

  const onSubmit = async ({ password }) => {
    if (!token) {
      toast.error(t('auth.invalid_token_toast'));
      return;
    }
    setSubmitting(true);
    try {
      await client.post(ENDPOINTS.auth.resetPassword, { token, password });
      toast.success(t('auth.password_updated'));
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.link_expired'));
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
        <SectionTitle>{t('auth.invalid_link_title')}</SectionTitle>
        <Notice>{t('auth.invalid_link_desc')}</Notice>
        <Footnotes>
          <p><Link to="/mot-de-passe-oublie">{t('auth.request_new_link')}</Link></p>
        </Footnotes>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" emblemSize={52} />
      </Wordmark>

      <SectionTitle>{t('auth.reset_title')}</SectionTitle>
      <SectionHint>{t('auth.reset_hint')}</SectionHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <FieldLabel htmlFor="password">{t('auth.new_password')}</FieldLabel>
          <FieldInput
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.password_placeholder')}
            $error={!!errors.password}
            {...register('password', {
              required: t('auth.password_required'),
              minLength: { value: 8, message: t('auth.password_min') },
              validate: (val) => {
                const s = scorePassword(val);
                return s.isAcceptable || t('auth.password_too_weak');
              },
            })}
          />
          <PasswordStrengthMeter password={passwordValue} />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">{t('auth.confirm_password')}</FieldLabel>
          <FieldInput
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            $error={!!errors.confirmPassword}
            {...register('confirmPassword', {
              required: t('auth.confirm_required'),
              validate: (val) => val === watch('password') || t('auth.password_mismatch'),
            })}
          />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
        </Field>

        <AuthSubmit type="submit" disabled={submitting}>
          {submitting ? t('profile.saving') : t('common.save')}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p><Link to="/login">{t('auth.back_login')}</Link></p>
      </Footnotes>
    </AuthShell>
  );
}
