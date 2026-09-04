import React from 'react';
import styled from 'styled-components';
import { Phone } from 'lucide-react';
import { CAMEROON_COLORS, FEMINICIDE_BANNER } from '../../config/cameroonHealth';
import {
  SANS, SERIF, HERO_IMAGE, INK, PAPER, MUTED, LINE, DEEP,
} from './authTheme';

export {
  SANS, SERIF, INK, PAPER, MUTED, LINE, DEEP,
};

const Shell = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  font-family: ${SANS};
  background: ${PAPER};
  -webkit-font-smoothing: antialiased;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    min-height: 100dvh;
  }
`;

const Visual = styled.aside`
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: hidden;

  @media (max-width: 960px) {
    display: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background: url('${HERO_IMAGE}') 58% center / cover no-repeat;
  }
`;

const VisualShade = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.52) 0%, rgba(0, 0, 0, 0.18) 42%, rgba(0, 0, 0, 0.02) 68%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, transparent 38%, rgba(0, 0, 0, 0.48) 100%);
`;

const FlagBar = styled.div`
  position: relative;
  z-index: 2;
  height: 3px;
  flex-shrink: 0;
  background: linear-gradient(90deg,
    ${CAMEROON_COLORS.green} 33.3%,
    ${CAMEROON_COLORS.red} 33.3% 66.6%,
    ${CAMEROON_COLORS.yellow} 66.6%
  );
`;

const VisualBody = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px 44px 32px 28px;

  @media (max-width: 960px) {
    padding: 24px 24px 28px 20px;
  }
`;

const BottomBlock = styled.div`
  width: 100%;
  max-width: min(460px, 58%);
`;

const HeroTitle = styled.h1`
  margin: 0 0 18px;
  font-family: ${SERIF};
  font-size: clamp(1.85rem, 3.2vw, 2.85rem);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: #fff;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
`;

const HeroSub = styled.p`
  margin: 0 0 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 0.92rem;
  font-weight: 400;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
`;

const HelplineRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
`;

const HelplineNum = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${CAMEROON_COLORS.yellow};
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);

  svg { opacity: 0.95; }
`;

const Auth = styled.main`
  display: flex;
  justify-content: center;
  padding: 48px 40px;
  padding-top: calc(48px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  max-height: 100dvh;
  min-height: 100dvh;

  @media (max-width: 960px) {
    padding: calc(20px + env(safe-area-inset-top, 0px)) 16px calc(28px + env(safe-area-inset-bottom, 0px));
    align-items: flex-start;
    justify-content: center;
  }

  @media (max-width: 400px) {
    padding-left: 12px;
    padding-right: 12px;
  }
`;

const AuthInner = styled.div`
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '560px' : '400px')};
`;

export const Wordmark = styled.div`
  margin-bottom: 32px;
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
  font-size: 16px;
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

export const SelectWrap = styled.div`
  position: relative;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 14px;
    width: 7px;
    height: 7px;
    margin-top: -5px;
    border-right: 1.75px solid ${MUTED};
    border-bottom: 1.75px solid ${MUTED};
    transform: rotate(45deg);
    pointer-events: none;
    transition: border-color 0.15s ease;
  }

  &:focus-within::after {
    border-color: ${DEEP};
  }
`;

export const FieldSelect = styled.select`
  width: 100%;
  height: 48px;
  padding: 0 40px 0 14px;
  font-family: ${SANS};
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: ${INK};
  background: #FAFAF9;
  border: 1px solid ${LINE};
  border-radius: 10px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background: #F5F5F4;
    border-color: #D6D3D1;
  }

  &:focus {
    outline: none;
    background: #fff;
    border-color: ${DEEP};
    box-shadow: 0 0 0 3px rgba(11, 61, 48, 0.12);
  }

  option {
    font-weight: 500;
    color: ${INK};
    background: #fff;
    padding: 10px;
  }

  option:disabled,
  option[value=''] {
    color: #A8A29E;
  }
`;

export const OperateurGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const OperateurOption = styled.button`
  padding: 14px 12px;
  text-align: center;
  cursor: pointer;
  font-family: ${SANS};
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
  background: ${({ $active }) => ($active ? INK : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : INK)};
  border: 1.5px solid ${({ $active }) => ($active ? INK : LINE)};
  border-radius: 2px;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${INK};
  }
`;

export const AuthSecondary = styled.button`
  padding: 12px 16px;
  font-family: ${SANS};
  font-size: 0.88rem;
  font-weight: 600;
  color: ${INK};
  background: transparent;
  border: 1.5px solid ${LINE};
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) { border-color: ${INK}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  font-weight: 600;
  color: ${DEEP};
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
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
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
    display: block;
    width: 100%;
    max-width: 100%;
    font-family: ${SANS};
    font-size: 16px;
    color: ${MUTED};
    padding: 10px 0;
  }

  .file-ok {
    margin-top: 6px;
    font-size: 0.78rem;
    color: ${DEEP};
    word-break: break-all;
  }
`;

export default function AuthShell({ children, wide = false }) {
  return (
    <Shell>
      <Visual>
        <FlagBar />
        <VisualShade />
        <VisualBody>
          <BottomBlock>
            <HeroTitle>{FEMINICIDE_BANNER.title}</HeroTitle>
            <HeroSub>
              Vous n&apos;êtes pas seule. Une aide est disponible à tout moment.
            </HeroSub>
            <HelplineRow>
              <HelplineNum><Phone size={16} /> 117</HelplineNum>
              <HelplineNum><Phone size={16} /> 112</HelplineNum>
              <HelplineNum><Phone size={16} /> 1515</HelplineNum>
            </HelplineRow>
          </BottomBlock>
        </VisualBody>
      </Visual>

      <Auth>
        <AuthInner $wide={wide}>
          {children}
        </AuthInner>
      </Auth>
    </Shell>
  );
}
