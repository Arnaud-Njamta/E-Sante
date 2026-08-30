import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getBranding, getHomeRoute } from '../config/branding';
import { CAMEROON_COLORS, FEMINICIDE_BANNER } from '../config/cameroonHealth';
import toast from 'react-hot-toast';
import { Phone } from 'lucide-react';

const SANS = "'DM Sans', system-ui, -apple-system, sans-serif";
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";

const HERO_IMAGE = '/images/login-feminicide.jpg';

const INK = '#1C1917';
const PAPER = '#F5F2ED';
const MUTED = '#6B6560';
const LINE = '#DDD6CE';
const DEEP = '#0B3D30';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  font-family: ${SANS};
  background: ${PAPER};
  -webkit-font-smoothing: antialiased;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Visual = styled.aside`
  position: relative;
  min-height: 100vh;
  color: #fff;
  overflow: hidden;

  @media (max-width: 960px) {
    min-height: 280px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('${HERO_IMAGE}') center 30% / cover no-repeat;
  }
`;

const VisualShade = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 62%, rgba(11,61,48,0.94) 100%);
`;

const FlagBar = styled.div`
  position: relative;
  z-index: 2;
  height: 3px;
  background: linear-gradient(90deg,
    ${CAMEROON_COLORS.green} 33.3%,
    ${CAMEROON_COLORS.red} 33.3% 66.6%,
    ${CAMEROON_COLORS.yellow} 66.6%
  );
`;

const VisualBody = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 56px 52px;
  gap: 28px;

  @media (max-width: 960px) {
    padding: 28px 24px 32px;
    gap: 16px;
  }
`;

const VisualBrand = styled.p`
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.72);
`;

const VisualTitle = styled.h1`
  margin: 0;
  max-width: 11ch;
  font-family: ${SERIF};
  font-size: clamp(2.4rem, 4.2vw, 3.6rem);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.02em;
`;

const VisualLead = styled.p`
  margin: 0;
  max-width: 36ch;
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(255,255,255,0.86);
`;

const EmergencyStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,0.18);
  font-size: 0.82rem;
  color: rgba(255,255,255,0.9);

  strong {
    font-weight: 700;
    color: ${CAMEROON_COLORS.yellow};
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
`;

const Auth = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;

  @media (max-width: 960px) {
    padding: 36px 20px 48px;
  }
`;

const AuthInner = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Wordmark = styled.div`
  margin-bottom: 44px;

  @media (max-width: 960px) {
    margin-bottom: 32px;
  }

  h2 {
    margin: 0;
    font-family: ${SERIF};
    font-size: 2.35rem;
    font-weight: 500;
    letter-spacing: -0.03em;
    color: ${INK};
    line-height: 1;
  }

  p {
    margin: 10px 0 0;
    font-size: 0.95rem;
    color: ${MUTED};
    line-height: 1.5;
  }
`;

const FormBlock = styled.div`
  margin-bottom: 32px;

  h3 {
    margin: 0 0 6px;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: ${INK};
  }

  .hint {
    margin: 0 0 28px;
    font-size: 0.9rem;
    color: ${MUTED};
    line-height: 1.5;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${INK};
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 0 12px;
  font-family: ${SANS};
  font-size: 1rem;
  font-weight: 500;
  color: ${INK};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${LINE};
  border-radius: 0;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #A8A29E;
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-bottom-color: ${DEEP};
  }

  ${({ $error }) => $error && `border-bottom-color: ${CAMEROON_COLORS.red};`}
`;

const ErrorText = styled.span`
  font-size: 0.76rem;
  color: ${CAMEROON_COLORS.red};
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -6px;
`;

const TextLink = styled(Link)`
  font-size: 0.84rem;
  font-weight: 600;
  color: ${DEEP};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Submit = styled.button`
  margin-top: 10px;
  width: 100%;
  padding: 15px 20px;
  font-family: ${SANS};
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #fff;
  background: ${INK};
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    background: ${DEEP};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Footnotes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 28px;
  border-top: 1px solid ${LINE};
  font-size: 0.88rem;
  color: ${MUTED};
  line-height: 1.5;

  a {
    color: ${INK};
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
`;

const MobileAlert = styled.div`
  display: none;

  @media (max-width: 960px) {
    display: block;
    margin-bottom: 28px;
    padding: 16px 18px;
    background: ${CAMEROON_COLORS.redDark};
    color: #fff;
    font-size: 0.84rem;
    line-height: 1.5;

    strong {
      display: block;
      margin-bottom: 4px;
      font-family: ${SERIF};
      font-size: 1.05rem;
      font-weight: 500;
    }
  }
`;

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
    <Page>
      <Visual>
        <FlagBar />
        <VisualShade />
        <VisualBody>
          <VisualBrand>{FEMINICIDE_BANNER.subtitle} · Cameroun</VisualBrand>
          <VisualTitle>{FEMINICIDE_BANNER.title}</VisualTitle>
          <VisualLead>
            Vous n&apos;êtes pas seule. Une aide est disponible à tout moment.
          </VisualLead>
          <EmergencyStrip>
            <span><Phone size={14} /> <strong>117</strong></span>
            <span><Phone size={14} /> <strong>112</strong></span>
            <span><Phone size={14} /> <strong>1515</strong></span>
          </EmergencyStrip>
        </VisualBody>
      </Visual>

      <Auth>
        <AuthInner>
          <MobileAlert>
            <strong>{FEMINICIDE_BANNER.title}</strong>
            Urgence : 117 · 112 · 1515
          </MobileAlert>

          <Wordmark>
            <h2>{branding.appName}</h2>
            <p>{branding.tagline}</p>
          </Wordmark>

          <FormBlock>
            <h3>Connexion</h3>
            <p className="hint">
              Patient, professionnel ou administrateur — un seul accès pour tous les espaces.
            </p>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  $error={!!errors.email}
                  {...register('email', { required: 'Email requis' })}
                />
                {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
              </Field>

              <Field>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8 caractères minimum"
                  autoComplete="current-password"
                  $error={!!errors.password}
                  {...register('password', {
                    required: 'Mot de passe requis',
                    minLength: { value: 8, message: 'Min. 8 caractères' },
                  })}
                />
                {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
              </Field>

              <Row>
                <TextLink to="/mot-de-passe-oublie">Mot de passe oublié</TextLink>
              </Row>

              <Submit type="submit" disabled={submitting}>
                {submitting ? 'Connexion en cours…' : 'Entrer'}
              </Submit>
            </Form>
          </FormBlock>

          <Footnotes>
            <p>
              Nouveau sur la plateforme ?{' '}
              <Link to="/register">Créer un compte patient</Link>
            </p>
            <p>
              Médecin, pharmacie ou établissement ?{' '}
              <Link to="/register/professionnel">Demander un accès pro</Link>
            </p>
          </Footnotes>
        </AuthInner>
      </Auth>
    </Page>
  );
}
