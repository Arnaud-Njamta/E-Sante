import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Activity, Phone, ArrowRight, CheckCircle } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[50]} 0%, ${({ theme }) => theme.colors.background} 50%);
  padding: ${({ theme }) => theme.spacing[6]};
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing[8]};
  animation: fadeInUp 0.5s ease both;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  svg { width: 24px; height: 24px; }
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const FormSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const OtpSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primary[50]};
  border: 1px solid ${({ theme }) => theme.colors.primary[100]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const OtpRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: flex-end;

  > div:first-child { flex: 1; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.success || '#16a34a'};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const MockHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const BottomText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing[6]};

  a {
    color: ${({ theme }) => theme.colors.primary[500]};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    &:hover { text-decoration: underline; }
  }
`;

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [verificationToken, setVerificationToken] = useState(null);
    const [mockHint, setMockHint] = useState(null);
    const [otpCode, setOtpCode] = useState('');
    const { register, handleSubmit, formState: { errors }, watch, getValues } = useForm();

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
        <PageWrapper>
            <FormCard>
                <LogoSection>
                    <LogoIcon><Activity /></LogoIcon>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>DjamSanté</span>
                </LogoSection>

                <FormTitle>Créer un compte</FormTitle>
                <FormSubtitle>Rejoignez DjamSanté pour un meilleur suivi de vos traitements.</FormSubtitle>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <OtpSection>
                        <Input
                            label="Téléphone (vérification SMS)"
                            type="tel"
                            placeholder="+237 6XX XX XX XX"
                            icon={Phone}
                            error={errors.telephone?.message}
                            disabled={phoneVerified}
                            {...register('telephone', {
                                required: 'Le téléphone est requis',
                                minLength: { value: 9, message: 'Numéro invalide' },
                                onChange: () => {
                                    setOtpSent(false);
                                    setPhoneVerified(false);
                                    setVerificationToken(null);
                                },
                            })}
                        />

                        {phoneVerified ? (
                            <VerifiedBadge>
                                <CheckCircle size={18} />
                                Numéro vérifié
                            </VerifiedBadge>
                        ) : (
                            <>
                                <OtpRow>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp}
                                    >
                                        {sendingOtp ? 'Envoi…' : otpSent ? 'Renvoyer le code' : 'Envoyer le code SMS'}
                                    </Button>
                                </OtpRow>

                                {otpSent && (
                                    <OtpRow>
                                        <Input
                                            label="Code SMS"
                                            placeholder="123456"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={verifyingOtp}
                                        >
                                            {verifyingOtp ? 'Vérification…' : 'Vérifier'}
                                        </Button>
                                    </OtpRow>
                                )}

                                {mockHint && <MockHint>{mockHint}</MockHint>}
                            </>
                        )}
                    </OtpSection>

                    <Row>
                        <Input
                            label="Prénom"
                            placeholder="Jean"
                            icon={User}
                            error={errors.prenom?.message}
                            {...register('prenom', { required: 'Le prénom est requis' })}
                        />
                        <Input
                            label="Nom"
                            placeholder="Dupont"
                            icon={User}
                            error={errors.nom?.message}
                            {...register('nom', { required: 'Le nom est requis' })}
                        />
                    </Row>

                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="jean.dupont@email.com"
                        icon={Mail}
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'L\'email est requis',
                            pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' },
                        })}
                    />

                    <Input
                        label="Date de naissance"
                        type="date"
                        error={errors.dateNaissance?.message}
                        {...register('dateNaissance', { required: 'La date de naissance est requise' })}
                    />

                    <Input
                        label="Mot de passe"
                        type="password"
                        placeholder="Minimum 8 caractères"
                        icon={Lock}
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Le mot de passe est requis',
                            minLength: { value: 8, message: 'Minimum 8 caractères' },
                        })}
                    />

                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword', {
                            required: 'Confirmez le mot de passe',
                            validate: (val) => val === watch('password') || 'Les mots de passe ne correspondent pas',
                        })}
                    />

                    <Button type="submit" fullWidth disabled={submitting || !phoneVerified} iconRight={ArrowRight}>
                        {submitting ? 'Création…' : 'Créer mon compte'}
                    </Button>
                </Form>

                <BottomText>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                    <br />
                    <Link to="/confidentialite" style={{ fontSize: '0.8rem', marginTop: 8, display: 'inline-block' }}>
                        Politique de confidentialité
                    </Link>
                </BottomText>
            </FormCard>
        </PageWrapper>
    );
}
