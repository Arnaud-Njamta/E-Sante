import React, { useState } from 'react';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Mail, Lock, Activity, ArrowRight, Pill, BellRing, BarChart3, ScanLine } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background};
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]} 0%, ${({ theme }) => theme.colors.primary[700]} 50%, #1a1a4e 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[10]};
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    top: -100px;
    right: -100px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    bottom: -50px;
    left: -50px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const BrandContent = styled.div`
  text-align: center;
  z-index: 1;
  max-width: 400px;
  animation: fadeInUp 0.6s ease both;
`;

const BrandTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['4xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const BrandSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  opacity: 0.85;
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`;

const Features = styled.div`
  margin-top: ${({ theme }) => theme.spacing[8]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  opacity: 0.9;

  span {
    width: 32px;
    height: 32px;
    border-radius: ${({ theme }) => theme.radii.md};
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[6]};
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.5s ease both;
`;

const LogoMobile = styled.div`
  display: none;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const LogoIconSmall = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  svg { width: 22px; height: 22px; }
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

const ForgotLink = styled.div`
  text-align: right;
  margin-top: -${({ theme }) => theme.spacing[2]};

  a {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.primary[500]};
    &:hover { text-decoration: underline; }
  }
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error('Veuillez entrer votre email'); return; }
    setForgotLoading(true);
    try {
      await client.post(ENDPOINTS.auth.forgotPassword, { email: forgotEmail });
      toast.success('Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setForgotLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Connexion réussie !');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <LeftPanel>
        <BrandContent>
          <BrandTitle>E-Santé</BrandTitle>
          <BrandSubtitle>
            Votre assistant intelligent pour un suivi médicamenteux fiable et personnalisé.
          </BrandSubtitle>
          <Features>
            <Feature><span><Pill size={16} /></span> Suivi intelligent de vos médicaments</Feature>
            <Feature><span><BellRing size={16} /></span> Rappels personnalisés aux bons moments</Feature>
            <Feature><span><BarChart3 size={16} /></span> Statistiques d'observance détaillées</Feature>
            <Feature><span><ScanLine size={16} /></span> Scanner d'ordonnances intégré</Feature>
          </Features>
        </BrandContent>
      </LeftPanel>

      <RightPanel>
        <FormCard>
          <LogoMobile>
            <LogoIconSmall><Activity size={22} /></LogoIconSmall>
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>E-Santé</span>
          </LogoMobile>

          <FormTitle>Bon retour !</FormTitle>
          <FormSubtitle>Connectez-vous pour suivre vos traitements en toute sécurité.</FormSubtitle>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Adresse e-mail"
              type="email"
              placeholder="patient@email.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'L\'email est requis',
                pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' },
              })}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: { value: 8, message: 'Minimum 8 caractères' },
              })}
            />

            <ForgotLink>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>Mot de passe oublié ?</a>
            </ForgotLink>

            {showForgot && (
              <div style={{ background: 'var(--surface, #f8fafc)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginTop: '4px' }}>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 12px' }}>Entrez votre email pour recevoir un lien de réinitialisation :</p>
                <input
                  type="email"
                  placeholder="patient@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowForgot(false)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, color: '#64748b', background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer' }}>Annuler</button>
                  <button type="button" onClick={handleForgotPassword} disabled={forgotLoading} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'white', background: '#2D7FF9', border: 'none', cursor: 'pointer', opacity: forgotLoading ? 0.6 : 1 }}>{forgotLoading ? 'Envoi…' : 'Envoyer'}</button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              iconRight={ArrowRight}
            >
              {submitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </Form>

          <BottomText>
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </BottomText>
        </FormCard>
      </RightPanel>
    </PageWrapper>
  );
}
