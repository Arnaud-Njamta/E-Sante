import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getBranding, getHomeRoute } from '../config/branding';
import { CAMEROON_COLORS, FEMINICIDE_BANNER } from '../config/cameroonHealth';
import toast from 'react-hot-toast';
import {
  Mail, Lock, Heart, Calendar, Newspaper, ScanLine,
  Shield, Phone,
} from 'lucide-react';

const FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const HERO_IMAGE = '/images/login-feminicide.jpg';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  font-family: ${FONT};
  background: #fafafa;
  -webkit-font-smoothing: antialiased;
`;

const LeftPanel = styled.div`
  flex: 1.15;
  position: relative;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
  @media (max-width: 960px) { display: none; }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('${HERO_IMAGE}') center center / cover no-repeat;
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    165deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.45) 45%,
    rgba(0, 50, 38, 0.88) 100%
  );
  z-index: 0;
`;

const FlagStripe = styled.div`
  position: relative;
  z-index: 2;
  height: 4px;
  background: linear-gradient(90deg,
    ${CAMEROON_COLORS.green} 33.3%,
    ${CAMEROON_COLORS.red} 33.3% 66.6%,
    ${CAMEROON_COLORS.yellow} 66.6%
  );
  flex-shrink: 0;
`;

const LeftInner = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 52px 44px;
  gap: 40px;
`;

const AwarenessBlock = styled.div`
  background: rgba(120, 10, 24, 0.82);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const JournalKicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${CAMEROON_COLORS.yellow};
  margin-bottom: 12px;
`;

const JournalHeadline = styled.h2`
  margin: 0 0 10px;
  font-size: clamp(1.75rem, 3vw, 2.6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #fff;
`;

const JournalSubhead = styled.p`
  margin: 0 0 18px;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.5;
`;

const HelplineRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const HelplinePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const BrandBlock = styled.div`
  padding-top: 4px;
`;

const BrandTitle = styled.h1`
  margin: 0 0 6px;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
`;

const BrandDesc = styled.p`
  margin: 0 0 22px;
  font-size: 0.92rem;
  font-weight: 500;
  opacity: 0.88;
  line-height: 1.6;
  max-width: 400px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.88rem;
  font-weight: 500;
  opacity: 0.95;

  span.icon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.14);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #fafafa;

  @media (max-width: 960px) {
    padding: 24px 16px;
  }
`;

const FormShell = styled.div`
  width: 100%;
  max-width: 380px;
`;

const LogoMark = styled.div`
  text-align: center;
  margin-bottom: 32px;

  h1 {
    margin: 0;
    font-size: 2.1rem;
    font-weight: 800;
    letter-spacing: -0.05em;
    color: #111;
    line-height: 1;
  }

  p {
    margin: 8px 0 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: #737373;
    letter-spacing: -0.01em;
  }
`;

const FormCard = styled.div`
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  padding: 36px 32px 28px;

  @media (max-width: 480px) {
    padding: 28px 20px 22px;
    border: none;
    background: transparent;
  }
`;

const FormTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #111;
  text-align: center;
`;

const FormSubtitle = styled.p`
  margin: 0 0 28px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #737373;
  text-align: center;
  line-height: 1.45;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  color: #525252;
  letter-spacing: 0.01em;
`;

const FieldWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FieldIcon = styled.span`
  position: absolute;
  left: 14px;
  display: flex;
  color: #a3a3a3;
  pointer-events: none;

  svg { width: 17px; height: 17px; }
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 13px 14px 13px 42px;
  font-family: ${FONT};
  font-size: 0.92rem;
  font-weight: 500;
  color: #111;
  background: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 10px;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #a3a3a3;
    font-weight: 400;
  }

  &:focus {
    outline: none;
    background: #fff;
    border-color: #a3a3a3;
    box-shadow: 0 0 0 3px rgba(0, 122, 94, 0.08);
  }

  ${({ $error }) => $error && `
    border-color: #ed4956;
    &:focus { box-shadow: 0 0 0 3px rgba(237, 73, 86, 0.1); }
  `}
`;

const FieldError = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #ed4956;
`;

const ForgotLink = styled(Link)`
  align-self: flex-end;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${CAMEROON_COLORS.green};
  text-decoration: none;
  margin: 2px 0 6px;

  &:hover { text-decoration: underline; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 13px 20px;
  font-family: ${FONT};
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
  background: ${CAMEROON_COLORS.green};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background: ${CAMEROON_COLORS.greenDark};
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 22px 0 18px;
  color: #a3a3a3;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #dbdbdb;
  }
`;

const FooterCard = styled.div`
  margin-top: 12px;
  padding: 22px;
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 500;
  color: #525252;

  @media (max-width: 480px) {
    border: none;
    background: transparent;
    padding: 16px 0;
  }

  a {
    color: ${CAMEROON_COLORS.green};
    font-weight: 700;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
`;

const CountryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  padding: 6px 12px;
  border-radius: 100px;
  background: #f0fdf9;
  border: 1px solid #bbf7d0;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${CAMEROON_COLORS.greenDark};
  letter-spacing: 0.02em;
`;

const MobileAwareness = styled.div`
  display: none;
  @media (max-width: 960px) {
    display: block;
    margin-bottom: 24px;
    padding: 18px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${CAMEROON_COLORS.red}, ${CAMEROON_COLORS.redDark});
    color: white;

    h2 {
      margin: 0 0 6px;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    p { margin: 0; font-size: 0.85rem; font-weight: 500; }
    strong { color: ${CAMEROON_COLORS.yellow}; }
  }
`;

const FEATURES = [
  { icon: Heart, text: 'Suivi de vos médicaments' },
  { icon: Calendar, text: 'Prendre rendez-vous en ligne' },
  { icon: Newspaper, text: 'Fil actualités santé' },
  { icon: ScanLine, text: 'Scanner vos ordonnances' },
];

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
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <LeftPanel>
        <FlagStripe />
        <ImageOverlay />
        <LeftInner>
          <AwarenessBlock>
            <JournalKicker>
              <Shield size={13} />
              Cameroun — {FEMINICIDE_BANNER.subtitle}
            </JournalKicker>
            <JournalHeadline>{FEMINICIDE_BANNER.title}</JournalHeadline>
            <JournalSubhead>Vous n&apos;êtes pas seule — de l&apos;aide est disponible, 24h/24.</JournalSubhead>
            <HelplineRow>
              <HelplinePill><Phone size={13} /> 117</HelplinePill>
              <HelplinePill><Phone size={13} /> 112</HelplinePill>
              <HelplinePill><Phone size={13} /> 1515</HelplinePill>
            </HelplineRow>
          </AwarenessBlock>

          <BrandBlock>
            <BrandTitle>{branding.appName}</BrandTitle>
            <BrandDesc>
              Plateforme santé numérique camerounaise — patients, médecins, pharmacies, hôpitaux et cliniques.
            </BrandDesc>
            <FeatureList>
              {FEATURES.map((f) => (
                <FeatureItem key={f.text}>
                  <span className="icon"><f.icon size={16} /></span>
                  {f.text}
                </FeatureItem>
              ))}
            </FeatureList>
          </BrandBlock>
        </LeftInner>
      </LeftPanel>

      <RightPanel>
        <FormShell>
          <MobileAwareness>
            <h2>{FEMINICIDE_BANNER.title}</h2>
            <p>En danger : <strong>117</strong> · <strong>112</strong> · <strong>1515</strong></p>
          </MobileAwareness>

          <LogoMark>
            <h1>{branding.appName}</h1>
            <p>{branding.tagline}</p>
          </LogoMark>

          <FormCard>
            <CountryBadge>🇨🇲 République du Cameroun</CountryBadge>
            <FormTitle>Connexion</FormTitle>
            <FormSubtitle>
              Accédez à votre espace personnel ou professionnel.
            </FormSubtitle>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <FieldLabel htmlFor="login-email">Adresse e-mail</FieldLabel>
                <FieldWrap>
                  <FieldIcon><Mail /></FieldIcon>
                  <FieldInput
                    id="login-email"
                    type="email"
                    placeholder="nom@exemple.com"
                    autoComplete="email"
                    $error={!!errors.email}
                    {...register('email', { required: 'Email requis' })}
                  />
                </FieldWrap>
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="login-password">Mot de passe</FieldLabel>
                <FieldWrap>
                  <FieldIcon><Lock /></FieldIcon>
                  <FieldInput
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    $error={!!errors.password}
                    {...register('password', {
                      required: 'Mot de passe requis',
                      minLength: { value: 8, message: 'Min. 8 caractères' },
                    })}
                  />
                </FieldWrap>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </FieldGroup>

              <ForgotLink to="/mot-de-passe-oublie">Mot de passe oublié ?</ForgotLink>

              <SubmitBtn type="submit" disabled={submitting}>
                {submitting ? 'Connexion…' : 'Se connecter'}
              </SubmitBtn>
            </Form>

            <Divider>ou</Divider>

            <FooterCard style={{ marginTop: 0, padding: '16px 0 0', border: 'none', background: 'transparent' }}>
              Pas de compte ? <Link to="/register">Créer un compte</Link>
            </FooterCard>
          </FormCard>

          <FooterCard>
            Professionnel de santé ?{' '}
            <Link to="/register/professionnel">Inscription pro</Link>
          </FooterCard>
        </FormShell>
      </RightPanel>
    </PageWrapper>
  );
}
