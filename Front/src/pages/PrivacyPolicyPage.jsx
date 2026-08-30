import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { Shield, Mail, MapPin, Phone } from 'lucide-react';
import { CAMEROON_COLORS } from '../config/cameroonHealth';

const Page = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px 48px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 8px;
`;

const Sub = styled.p`
  color: #64748B;
  margin: 0 0 28px;
  font-size: 0.95rem;
`;

const Section = styled.section`
  margin-bottom: 24px;
  h2 { font-size: 1.1rem; font-weight: 700; color: ${CAMEROON_COLORS.greenDark}; margin: 0 0 10px; }
  p, li { font-size: 0.92rem; line-height: 1.65; color: #334155; }
  ul { padding-left: 1.25rem; margin: 8px 0; }
`;

const DpoBox = styled(Card)`
  padding: 20px;
  margin-top: 28px;
  background: #F0FDF9;
  border: 1px solid ${CAMEROON_COLORS.green}30;
`;

const Back = styled(Link)`
  display: inline-block;
  margin-bottom: 20px;
  color: ${CAMEROON_COLORS.green};
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
`;

export default function PrivacyPolicyPage() {
  return (
    <Page>
      <Back to="/login">← Retour</Back>
      <Title>Politique de confidentialité — DjamSanté</Title>
      <Sub>Version 1.0.0 · République du Cameroun · Données de santé</Sub>

      <Card style={{ padding: '28px' }}>
        <Section>
          <h2>1. Responsable du traitement</h2>
          <p>
            DjamSanté traite vos données dans le cadre d'une plateforme de santé numérique.
            Le délégué à la protection des données (DPO) est joignable aux coordonnées ci-dessous.
          </p>
        </Section>

        <Section>
          <h2>2. Données collectées</h2>
          <ul>
            <li>Identité et contact (nom, email, téléphone)</li>
            <li>Données de santé : traitements, ordonnances, observance, allergies, pathologies</li>
            <li>Données de navigation et logs techniques (sécurité)</li>
          </ul>
        </Section>

        <Section>
          <h2>3. Finalités</h2>
          <p>
            Suivi thérapeutique, prise de rendez-vous, téléconsultation, messagerie avec les professionnels,
            ordonnances électroniques et amélioration du service. Le partage à des fins de recherche
            médicale n'est effectué qu'avec votre consentement explicite et sous forme anonymisée.
          </p>
        </Section>

        <Section>
          <h2>4. Vos droits (RGPD & législation camerounaise)</h2>
          <ul>
            <li><strong>Accès</strong> — export JSON depuis votre profil</li>
            <li><strong>Rectification</strong> — modification du profil</li>
            <li><strong>Effacement</strong> — suppression du compte depuis le profil</li>
            <li><strong>Opposition</strong> — retrait du consentement recherche</li>
            <li><strong>Portabilité</strong> — téléchargement de vos données</li>
          </ul>
        </Section>

        <Section>
          <h2>5. Conservation & sécurité</h2>
          <p>
            Les données sont hébergées de manière sécurisée (chiffrement en transit HTTPS, mots de passe hashés).
            Les ordonnances électroniques font l'objet d'un journal d'audit. Les fichiers sensibles
            (diplômes, cachets) ne sont accessibles qu'aux personnes autorisées.
          </p>
        </Section>

        <Section>
          <h2>6. Téléconsultation</h2>
          <p>
            Les consultations vidéo utilisent une infrastructure tierce (Jitsi). En production,
            un serveur dédié est recommandé. Ne partagez pas d'informations médicales dans un environnement non sécurisé.
          </p>
        </Section>

        <DpoBox>
          <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color={CAMEROON_COLORS.green} /> Contact DPO
          </h3>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={14} /> dpo@djamsante.cm
          </p>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={14} /> +237 6XX XX XX XX
          </p>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={14} /> Ministère de la Santé Publique, Yaoundé
          </p>
        </DpoBox>
      </Card>
    </Page>
  );
}
