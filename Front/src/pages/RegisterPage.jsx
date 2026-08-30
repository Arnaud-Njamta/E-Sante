import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBranding } from '../config/branding';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';
import AuthShell, {
  Wordmark, SectionTitle, SectionHint, AuthForm, Field, FieldLabel,
  FieldInput, FieldError, AuthSubmit, AuthSecondary, Footnotes, Notice,
  VerifiedBadge, FormGrid,
} from '../components/auth/AuthShell';

const OtpActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
`;

const OtpRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;

  > div:first-child { flex: 1; min-width: 140px; }
`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const branding = getBranding('patient');
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [mockHint, setMockHint] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  const {
    register, handleSubmit, formState: { errors }, watch, getValues,
  } = useForm();

  const handleSendOtp = async () => {
    const telephone = getValues('telephone');
    if (!telephone || telephone.replace(/\D/g, '').length < 9) {
      toast.error('Saisissez un numéro de téléphone valide');
      return;
    }
    setSendingOtp(true);
    try {
      const { data } = await client.post(ENDPOINTS.auth.otpSend, {
        telephone,
        usage: 'register',
      });
      const result = data.data || data;
      setOtpSent(true);
      setPhoneVerified(false);
      setVerificationToken(null);
      if (result.hint) setMockHint(result.hint);
      toast.success(result.message || 'Code envoyé');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d\'envoyer le code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const telephone = getValues('telephone');
    if (!otpCode || otpCode.length < 4) {
      toast.error('Saisissez le code reçu par SMS');
      return;
    }
    setVerifyingOtp(true);
    try {
      const { data } = await client.post(ENDPOINTS.auth.otpVerify, {
        telephone,
        code: otpCode,
        usage: 'register',
      });
      const result = data.data || data;
      setVerificationToken(result.verification_token);
      setPhoneVerified(true);
      toast.success('Téléphone vérifié');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code incorrect');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const onSubmit = async (formData) => {
    if (!phoneVerified || !verificationToken) {
      toast.error('Vérifiez votre numéro de téléphone par SMS avant de continuer');
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
        date_naissance: formData.dateNaissance,
        otp_verification_token: verificationToken,
      });
      toast.success('Compte créé avec succès !');
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
        <h2>{branding.appName}</h2>
        <p>{branding.tagline}</p>
      </Wordmark>

      <SectionTitle>Créer un compte</SectionTitle>
      <SectionHint>
        Rejoignez DjamSanté pour le suivi de vos traitements et la prise de rendez-vous.
      </SectionHint>

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <FieldLabel htmlFor="telephone">Téléphone (vérification SMS)</FieldLabel>
          <FieldInput
            id="telephone"
            type="tel"
            placeholder="+237 6XX XX XX XX"
            disabled={phoneVerified}
            $error={!!errors.telephone}
            {...register('telephone', {
              required: 'Le téléphone est requis',
              minLength: { value: 9, message: 'Numéro invalide' },
              onChange: () => {
                setOtpSent(false);
                setPhoneVerified(false);
                setVerificationToken(null);
                setMockHint(null);
              },
            })}
          />
          {errors.telephone && <FieldError>{errors.telephone.message}</FieldError>}
        </Field>

        {phoneVerified ? (
          <VerifiedBadge>
            <CheckCircle size={18} />
            Numéro vérifié
          </VerifiedBadge>
        ) : (
          <>
            <OtpActions>
              <AuthSecondary type="button" onClick={handleSendOtp} disabled={sendingOtp}>
                {sendingOtp ? 'Envoi…' : otpSent ? 'Renvoyer le code' : 'Envoyer le code SMS'}
              </AuthSecondary>
            </OtpActions>

            {otpSent && (
              <OtpRow>
                <Field>
                  <FieldLabel htmlFor="otp">Code SMS</FieldLabel>
                  <FieldInput
                    id="otp"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </Field>
                <AuthSecondary type="button" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                  {verifyingOtp ? 'Vérification…' : 'Vérifier'}
                </AuthSecondary>
              </OtpRow>
            )}

            {mockHint && (
              <Notice style={{ marginBottom: 0 }}>{mockHint}</Notice>
            )}
          </>
        )}

        <FormGrid>
          <Field>
            <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
            <FieldInput
              id="prenom"
              placeholder="Jean"
              $error={!!errors.prenom}
              {...register('prenom', { required: 'Le prénom est requis' })}
            />
            {errors.prenom && <FieldError>{errors.prenom.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="nom">Nom</FieldLabel>
            <FieldInput
              id="nom"
              placeholder="Dupont"
              $error={!!errors.nom}
              {...register('nom', { required: 'Le nom est requis' })}
            />
            {errors.nom && <FieldError>{errors.nom.message}</FieldError>}
          </Field>
        </FormGrid>

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <FieldInput
            id="email"
            type="email"
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
          <FieldLabel htmlFor="dateNaissance">Date de naissance</FieldLabel>
          <FieldInput
            id="dateNaissance"
            type="date"
            $error={!!errors.dateNaissance}
            {...register('dateNaissance', { required: 'La date de naissance est requise' })}
          />
          {errors.dateNaissance && <FieldError>{errors.dateNaissance.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <FieldInput
            id="password"
            type="password"
            placeholder="8 caractères minimum"
            $error={!!errors.password}
            {...register('password', {
              required: 'Le mot de passe est requis',
              minLength: { value: 8, message: 'Minimum 8 caractères' },
            })}
          />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
          <FieldInput
            id="confirmPassword"
            type="password"
            placeholder="8 caractères minimum"
            $error={!!errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Confirmez le mot de passe',
              validate: (val) => val === watch('password') || 'Les mots de passe ne correspondent pas',
            })}
          />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
        </Field>

        <AuthSubmit type="submit" disabled={submitting || !phoneVerified}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </AuthSubmit>
      </AuthForm>

      <Footnotes>
        <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        <p>
          <Link to="/confidentialite">Politique de confidentialité</Link>
        </p>
      </Footnotes>
    </AuthShell>
  );
}
