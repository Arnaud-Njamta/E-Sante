import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Phone, Lock, ArrowLeft, Activity } from 'lucide-react';

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
  max-width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing[8]};
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
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

const MockHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.primary[500]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export default function ForgotPasswordSmsPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [telephone, setTelephone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mockHint, setMockHint] = useState(null);
    const [loading, setLoading] = useState(false);

    const sendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await client.post(ENDPOINTS.auth.otpSend, {
                telephone,
                usage: 'reset_password',
            });
            const result = data.data || data;
            if (result.hint) setMockHint(result.hint);
            toast.success(result.message || 'Code envoyé');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await client.post(ENDPOINTS.auth.otpVerify, {
                telephone,
                code: otpCode,
                usage: 'reset_password',
            });
            const result = data.data || data;
            setVerificationToken(result.verification_token);
            toast.success('Code vérifié');
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Code incorrect');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (password.length < 8) {
            toast.error('Minimum 8 caractères');
            return;
        }
        setLoading(true);
        try {
            await client.post(ENDPOINTS.auth.resetPasswordSms, {
                telephone,
                otp_verification_token: verificationToken,
                password,
            });
            toast.success('Mot de passe réinitialisé');
            navigate('/login', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <FormCard>
                <BackLink to="/login"><ArrowLeft size={16} /> Retour à la connexion</BackLink>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Activity />
                    <span style={{ fontWeight: 700 }}>Mot de passe oublié</span>
                </div>

                {step === 1 && (
                    <>
                        <FormTitle>Par SMS</FormTitle>
                        <FormSubtitle>Recevez un code sur le numéro associé à votre compte patient.</FormSubtitle>
                        <Form onSubmit={sendOtp}>
                            <Input
                                label="Téléphone"
                                type="tel"
                                icon={Phone}
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                placeholder="+237 6XX XX XX XX"
                                required
                            />
                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Envoi…' : 'Envoyer le code'}
                            </Button>
                        </Form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <FormTitle>Code SMS</FormTitle>
                        <FormSubtitle>Saisissez le code reçu au {telephone}</FormSubtitle>
                        {mockHint && <MockHint>{mockHint}</MockHint>}
                        <Form onSubmit={verifyOtp}>
                            <Input
                                label="Code"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="123456"
                                required
                            />
                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Vérification…' : 'Continuer'}
                            </Button>
                        </Form>
                    </>
                )}

                {step === 3 && (
                    <>
                        <FormTitle>Nouveau mot de passe</FormTitle>
                        <Form onSubmit={resetPassword}>
                            <Input
                                label="Mot de passe"
                                type="password"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Input
                                label="Confirmer"
                                type="password"
                                icon={Lock}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Enregistrement…' : 'Réinitialiser'}
                            </Button>
                        </Form>
                    </>
                )}
            </FormCard>
        </PageWrapper>
    );
}
