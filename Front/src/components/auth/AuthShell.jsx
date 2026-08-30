import React from 'react';
import styled from 'styled-components';
import {
  Phone, Shield, Heart, Calendar, Newspaper, ScanLine,
} from 'lucide-react';
import { getBranding } from '../../config/branding';
import { CAMEROON_COLORS, FEMINICIDE_BANNER } from '../../config/cameroonHealth';
import {
  SANS, SERIF, HERO_IMAGE, INK, PAPER, MUTED, LINE, DEEP,
} from './authTheme';

const FEATURES = [
  { icon: Heart, text: 'Suivi de vos médicaments' },
  { icon: Calendar, text: 'Prendre rendez-vous en ligne' },
  { icon: Newspaper, text: 'Fil actualités santé' },
  { icon: ScanLine, text: 'Scanner vos ordonnances' },
];

export {
  SANS, SERIF, INK, PAPER, MUTED, LINE, DEEP,
};

const Shell = styled.div`
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
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: hidden;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: 960px) {
    display: none;
  }

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

const FlagBar = styled.div`
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

const VisualBody = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 44px 48px 40px;
  gap: 36px;
`;

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
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
`;

const Auth = styled.main`
  display: flex;
  justify-content: center;
  padding: 48px 40px;
  overflow-y: auto;
  max-height: 100vh;

  @media (max-width: 960px) {
    padding: 36px 20px 48px;
    max-height: none;
  }
`;

const AuthInner = styled.div`
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '560px' : '400px')};
`;

export const Wordmark = styled.div`
  margin-bottom: 40px;

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

export const SectionTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: ${INK};
`;

export const SectionHint = styled.p`
  margin: 0 0 24px;
  font-size: 0.9rem;
  color: ${MUTED};
  line-height: 1.55;
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;

  &.full {
    grid-column: 1 / -1;
  }
`;

export const FieldLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${INK};
`;

export const FieldInput = styled.input`
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

  &::placeholder { color: #A8A29E; font-weight: 400; }
  &:focus { outline: none; border-bottom-color: ${DEEP}; }
  ${({ $error }) => $error && `border-bottom-color: ${CAMEROON_COLORS.red};`}
`;

export const FieldSelect = styled.select`
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
  cursor: pointer;

  &:focus { outline: none; border-bottom-color: ${DEEP}; }
`;

export const FieldError = styled.span`
  font-size: 0.76rem;
  color: ${CAMEROON_COLORS.red};
`;

export const AuthSubmit = styled.button`
  margin-top: 8px;
  width: 100%;
  padding: 15px 20px;
  font-family: ${SANS};
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: ${INK};
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover:not(:disabled) { background: ${DEEP}; }
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

export const AuthLink = styled.a`
  color: ${INK};
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; text-underline-offset: 3px; }
`;

export const Footnotes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 28px;
  margin-top: 8px;
  border-top: 1px solid ${LINE};
  font-size: 0.88rem;
  color: ${MUTED};
  line-height: 1.5;

  a {
    color: ${INK};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; text-underline-offset: 3px; }
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Notice = styled.div`
  padding: 14px 16px;
  margin-bottom: 24px;
  font-size: 0.84rem;
  line-height: 1.55;
  color: ${MUTED};
  border-left: 3px solid ${DEEP};
  background: rgba(11, 61, 48, 0.05);
`;

export const SubSection = styled.h4`
  margin: 28px 0 16px;
  padding-top: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${MUTED};
  border-top: 1px solid ${LINE};
`;

export const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 28px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const TypeCard = styled.button`
  padding: 16px 14px;
  text-align: left;
  cursor: pointer;
  background: ${({ $active }) => ($active ? INK : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : INK)};
  border: 1.5px solid ${({ $active }) => ($active ? INK : LINE)};
  border-radius: 2px;
  transition: all 0.15s ease;
  font-family: ${SANS};

  h3 {
    margin: 8px 0 4px;
    font-size: 0.95rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.78rem;
    opacity: 0.8;
    line-height: 1.4;
  }

  &:hover {
    border-color: ${INK};
  }
`;

export const DocZone = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid ${LINE};

  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${INK};
    margin-bottom: 10px;
    text-transform: capitalize;
  }

  input[type="file"] {
    font-family: ${SANS};
    font-size: 0.82rem;
    color: ${MUTED};
  }
`;

const MobileAlert = styled.div`
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

export default function AuthShell({ children, wide = false }) {
  const branding = getBranding('patient');

  return (
    <Shell>
      <Visual>
        <FlagBar />
        <ImageOverlay />
        <VisualBody>
          <AwarenessBlock>
            <JournalKicker>
              <Shield size={14} />
              Cameroun — {FEMINICIDE_BANNER.subtitle}
            </JournalKicker>
            <JournalHeadline>{FEMINICIDE_BANNER.title}</JournalHeadline>
            <JournalSubhead>
              Vous n&apos;êtes pas seule — de l&apos;aide est disponible, 24h/24.
            </JournalSubhead>
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
        </VisualBody>
      </Visual>

      <Auth>
        <AuthInner $wide={wide}>
          <MobileAlert>
            <h2>{FEMINICIDE_BANNER.title}</h2>
            <p>En danger : <strong>117</strong> · <strong>112</strong> · <strong>1515</strong></p>
          </MobileAlert>
          {children}
        </AuthInner>
      </Auth>
    </Shell>
  );
}
