import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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

export default function RegisterPage() {
  const { t } = useTranslation();
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
      toast.error(t('auth.accept_cgu_toast'));
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
      toast.success(t('auth.welcome_app'));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.register_error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Wordmark>
        <BrandLogo variant="compact" tagline={branding.tagline} emblemSize={52} />
      </Wordmark>

      <SectionTitle>{t('auth.register_title')}</SectionTitle>
      <SectionHint>{t('auth.register_hint')}</SectionHint>

      <Steps aria-hidden>
        <StepDot $active={step >= 1} />
        <StepDot $active={step >= 2} />
      </Steps>
      <StepHint>{step === 1 ? t('auth.step1') : t('auth.step2')}</StepHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <>
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

            <Field>
              <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
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
                    return s.isAcceptable || t('auth.password_weak');
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
                placeholder={t('auth.confirm_placeholder')}
                $error={!!errors.confirmPassword}
                {...register('confirmPassword', {
                  required: t('auth.confirm_required'),
                  validate: (val) => val === watch('password') || t('auth.password_mismatch'),
                })}
              />
              {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
            </Field>

            <Field>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.84rem', color: '#6B6560', lineHeight: 1.45 }}>
                <input type="checkbox" {...register('acceptCgu', { required: t('auth.cgu_required') })} style={{ marginTop: 3 }} />
                <span>
                  {t('auth.cgu_prefix')}{' '}
                  <Link to="/cgu" target="_blank">{t('auth.terms_link')}</Link>
                  {' '}{t('auth.cgu_and')}{' '}
                  <Link to="/confidentialite" target="_blank">{t('auth.privacy_link')}</Link>.
                </span>
              </label>
              {errors.acceptCgu && <FieldError>{errors.acceptCgu.message}</FieldError>}
            </Field>

            <AuthSubmit type="button" onClick={goNext}>
              {t('auth.continue')}
            </AuthSubmit>
          </>
        )}

        {step === 2 && (
          <>
            <FormGrid>
              <Field>
                <FieldLabel htmlFor="prenom">{t('auth.firstname')}</FieldLabel>
                <FieldInput
                  id="prenom"
                  autoComplete="given-name"
                  $error={!!errors.prenom}
                  {...register('prenom', { required: t('auth.firstname_required') })}
                />
                {errors.prenom && <FieldError>{errors.prenom.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="nom">{t('auth.lastname')}</FieldLabel>
                <FieldInput
                  id="nom"
                  autoComplete="family-name"
                  $error={!!errors.nom}
                  {...register('nom', { required: t('auth.lastname_required') })}
                />
                {errors.nom && <FieldError>{errors.nom.message}</FieldError>}
              </Field>
            </FormGrid>

            <Field>
              <FieldLabel htmlFor="telephone">{t('auth.phone_optional')}</FieldLabel>
              <FieldInput
                id="telephone"
                type="tel"
                autoComplete="tel"
                placeholder="+237 6XX XX XX XX"
                $error={!!errors.telephone}
                {...register('telephone', {
                  minLength: { value: 9, message: t('auth.phone_invalid') },
                })}
              />
              {errors.telephone && <FieldError>{errors.telephone.message}</FieldError>}
            </Field>

            <div style={{ display: 'flex', gap: 10 }}>
              <AuthSubmit type="button" onClick={() => setStep(1)} style={{ flex: 1, background: '#E8E4DC', color: '#1C1917' }}>
                {t('common.back')}
              </AuthSubmit>
              <AuthSubmit type="submit" disabled={submitting} style={{ flex: 1.4 }}>
                {submitting ? t('auth.creating') : t('auth.create_my_account')}
              </AuthSubmit>
            </div>
          </>
        )}
      </AuthForm>

      <Footnotes>
        <p>{t('auth.already_account')} <Link to="/login">{t('auth.sign_in')}</Link></p>
        <p>
          <Link to="/register-professionnel">{t('auth.pro_account')}</Link>
          {' · '}
          <Link to="/cgu">{t('auth.terms_link')}</Link>
        </p>
      </Footnotes>
    </AuthShell>
  );
}
