import React from 'react';
import styled from 'styled-components';
import { Phone } from 'lucide-react';
import { CAMEROON_COLORS } from '../../config/cameroonHealth';
import {
  SANS, SERIF, HERO_IMAGE, INK, PAPER, MUTED, LINE, DEEP,
} from './authTheme';

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
  color: #fff;
  overflow: hidden;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: 960px) {
    position: relative;
    height: auto;
    min-height: 320px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('${HERO_IMAGE}') center center / cover no-repeat;
  }
`;

const VisualShade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.15) 55%,
    rgba(0, 0, 0, 0.72) 100%
  );
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
  gap: 20px;

  @media (max-width: 960px) {
    padding: 28px 24px 32px;
  }
`;

const VisualLead = styled.p`
  margin: 0;
  max-width: 38ch;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const EmergencyStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.92);

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
    margin-bottom: 24px;
    padding: 14px 16px;
    background: ${CAMEROON_COLORS.redDark};
    color: #fff;
    font-size: 0.84rem;
    line-height: 1.5;
    strong {
      display: block;
      font-family: ${SERIF};
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 4px;
    }
  }
`;

export default function AuthShell({
  children,
  wide = false,
  visualLead = 'Vous n\u2019êtes pas seule. Une aide est disponible à tout moment.',
  mobileAlertTitle = 'NON au féminicide',
}) {
  return (
    <Shell>
      <Visual>
        <FlagBar />
        <VisualShade />
        <VisualBody>
          <VisualLead>{visualLead}</VisualLead>
          <EmergencyStrip>
            <span><Phone size={14} /> Urgence <strong>117</strong></span>
            <span><Phone size={14} /> <strong>112</strong></span>
            <span><Phone size={14} /> <strong>1515</strong></span>
          </EmergencyStrip>
        </VisualBody>
      </Visual>

      <Auth>
        <AuthInner $wide={wide}>
          <MobileAlert>
            <strong>{mobileAlertTitle}</strong>
            Urgence : 117 · 112 · 1515
          </MobileAlert>
          {children}
        </AuthInner>
      </Auth>
    </Shell>
  );
}
