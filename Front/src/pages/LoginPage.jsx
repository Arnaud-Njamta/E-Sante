import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getBranding, getHomeRoute } from '../config/branding';
import { CAMEROON_COLORS, FEMINICIDE_BANNER } from '../config/cameroonHealth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
  Mail, Lock, ArrowRight, Heart, Calendar, Newspaper, ScanLine,
  Shield, Phone,
} from 'lucide-react';

const HERO_IMAGE = '/images/login-feminicide.jpg';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: #F8FAFC;
`;

const LeftPanel = styled.div`
  flex: 1.1;
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
    180deg,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.35) 50%,
    rgba(0, 45, 35, 0.82) 100%
  );
  z-index: 0;
`;

const FlagStripe = styled.div`
  position: relative;
  z-index: 2;
  height: 6px;
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
  padding: 44px 48px 40px;
  gap: 36px;
`;

/* ─── Bloc féminicides — style une de journal ─── */
const AwarenessBlock = styled.div`
  background: rgba(139, 13, 28, 0.88);
  backdrop-filter: blur(10px);
  border-radius: 4px;
  padding: 32px 34px;
  border-left: 6px solid ${CAMEROON_COLORS.yellow};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
`;

const JournalKicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: ${CAMEROON_COLORS.yellow};
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(252, 209, 22, 0.4);
`;

const JournalHeadline = styled.h2`
  margin: 0 0 10px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: clamp(2rem, 3.8vw, 3.4rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
`;

const JournalSubhead = styled.p`
  margin: 0 0 20px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: clamp(1.05rem, 1.8vw, 1.35rem);
  font-style: italic;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.4;
  border-left: 3px solid ${CAMEROON_COLORS.yellow};
  padding-left: 14px;
`;

const HelplineRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const HelplinePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 800;
  color: ${CAMEROON_COLORS.yellow};
  border: 1px solid rgba(252, 209, 22, 0.35);
  font-family: system-ui, sans-serif;
`;

const BrandBlock = styled.div`
  padding-top: 8px;
`;

const BrandTitle = styled.h1`
  margin: 0 0 8px;
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const BrandDesc = styled.p`
  margin: 0 0 20px;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.55;
  max-width: 420px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.84rem;
  opacity: 0.92;

  span.icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.12);
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
  padding: 32px 28px;
  background: linear-gradient(180deg, #FFFFFF 0%, #F0FDF9 100%);
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #E2E8F0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const MobileAwareness = styled.div`
  display: none;
  @media (max-width: 960px) {
    display: block;
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 4px;
    border-left: 5px solid ${CAMEROON_COLORS.yellow};
    background: linear-gradient(135deg, ${CAMEROON_COLORS.red}, ${CAMEROON_COLORS.redDark});
    color: white;
    h2 {
      margin: 0 0 8px;
      font-family: Georgia, serif;
      font-size: 1.25rem;
      font-weight: 700;
    }
    p { margin: 0; font-size: 0.9rem; }
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
              <Shield size={14} />
              Cameroun — {FEMINICIDE_BANNER.subtitle}
            </JournalKicker>
            <JournalHeadline>{FEMINICIDE_BANNER.title}</JournalHeadline>
            <JournalSubhead>Vous n&apos;êtes pas seule — de l&apos;aide est disponible, 24h/24.</JournalSubhead>
            <HelplineRow>
              <HelplinePill><Phone size={14} /> 117</HelplinePill>
              <HelplinePill><Phone size={14} /> 112</HelplinePill>
              <HelplinePill><Phone size={14} /> 1515</HelplinePill>
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
        <FormCard>
          <MobileAwareness>
            <h2>{FEMINICIDE_BANNER.title}</h2>
            <p>En danger : <strong>117</strong> · <strong>112</strong> · <strong>1515</strong></p>
          </MobileAwareness>

          <div style={{
            display: 'inline-block', padding: '4px 10px', borderRadius: 6,
            background: `${CAMEROON_COLORS.green}12`, color: CAMEROON_COLORS.greenDark,
            fontSize: '0.72rem', fontWeight: 700, marginBottom: 14,
          }}>
            🇨🇲 République du Cameroun
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 4px', color: '#0F172A' }}>Connexion</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 22 }}>
            Entrez votre e-mail et mot de passe — vous serez redirigé vers votre espace.
          </p>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Input label="Adresse e-mail" type="email" icon={Mail} error={errors.email?.message} {...register('email', { required: 'Email requis' })} />
            <Input label="Mot de passe" type="password" icon={Lock} error={errors.password?.message} {...register('password', { required: 'Mot de passe requis', minLength: { value: 8, message: 'Min. 8 caractères' } })} />
            <p style={{ textAlign: 'right', margin: '-8px 0 4px' }}>
              <Link to="/mot-de-passe-oublie" style={{ fontSize: '0.8rem', color: CAMEROON_COLORS.green, fontWeight: 600 }}>
                Mot de passe oublié ?
              </Link>
            </p>
            <Button type="submit" fullWidth disabled={submitting} iconRight={ArrowRight}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </Form>

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#64748B', marginTop: 18 }}>
            Pas de compte ?{' '}
            <Link to="/register" style={{ color: CAMEROON_COLORS.green, fontWeight: 700 }}>Créer un compte</Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#64748B', marginTop: 6 }}>
            <Link to="/register/professionnel" style={{ color: CAMEROON_COLORS.green, fontWeight: 700 }}>Inscription professionnelle</Link>
          </p>
        </FormCard>
      </RightPanel>
    </PageWrapper>
  );
}
