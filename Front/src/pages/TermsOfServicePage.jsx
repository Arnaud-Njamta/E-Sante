import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { CAMEROON_COLORS } from '../config/cameroonHealth';
import { BRAND } from '../config/branding';

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

const Back = styled(Link)`
  display: inline-block;
  margin-bottom: 20px;
  color: ${CAMEROON_COLORS.green};
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
`;

const Box = styled(Card)`
  padding: 20px;
  margin-top: 20px;
  background: #F0FDF9;
  border: 1px solid ${CAMEROON_COLORS.green}30;
`;

export default function TermsOfServicePage() {
  return (
    <Page>
      <Back to="/login">← Retour</Back>
      <Title>Conditions Générales d&apos;Utilisation</Title>
      <Sub>
        {BRAND.name} — Version 1.0 · Cameroun · Dernière mise à jour : août 2026
      </Sub>

      <Section>
        <h2>1. Objet</h2>
        <p>
          Les présentes CGU régissent l&apos;accès et l&apos;utilisation de la plateforme {BRAND.name}
          (téléconsultation, annuaire santé, suivi médicamenteux, messagerie pharmacie, assistant numérique).
          En créant un compte, vous acceptez ces conditions et la{' '}
          <Link to="/confidentialite">Politique de confidentialité</Link>.
        </p>
      </Section>

      <Section>
        <h2>2. Comptes</h2>
        <ul>
          <li><strong>Patient</strong> : compte créé immédiatement après vérification (SMS le cas échéant).</li>
          <li>
            <strong>Professionnel</strong> (médecin, pharmacie, clinique, hôpital) : le compte est créé
            immédiatement, mais l&apos;accès aux fonctions sensibles (visibilité publique, paiements patients,
            chat) reste soumis à la <strong>validation documentaire</strong> (MINSANTE / équipe {BRAND.name}).
          </li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
          <li>Informations fausses ou documents frauduleux → rejet, suspension ou signalement aux autorités.</li>
        </ul>
      </Section>

      <Section>
        <h2>3. Professionnels de santé</h2>
        <p>
          Conformément à la réglementation camerounaise, l&apos;exercice de la médecine suppose l&apos;inscription
          à l&apos;Ordre National des Médecins du Cameroun (ONMC). Les structures doivent disposer des agréments
          et autorisations MINSANTE requis. {BRAND.name} peut exiger diplôme, carte d&apos;ordre, agrément,
          autorisation, et procéder à des contrôles (y compris pré-analyse assistée par IA, sans valeur d&apos;authentification officielle).
        </p>
      </Section>

      <Section>
        <h2>4. Assistant numérique (Dr. DjamSanté)</h2>
        <ul>
          <li>L&apos;IA recueille des informations et prépare une <strong>synthèse</strong> pour faciliter la décision du médecin.</li>
          <li>Elle <strong>ne prescrit pas</strong> de médicaments et ne remplace pas une consultation.</li>
          <li>En urgence vitale : appelez le <strong>112</strong> ou le <strong>1515</strong> (ou rendez-vous aux urgences).</li>
        </ul>
      </Section>

      <Section>
        <h2>5. Services médicaux & responsabilité</h2>
        <p>
          Les actes médicaux sont réalisés par des professionnels indépendants. {BRAND.name} fournit
          l&apos;outil numérique ; la responsabilité clinique incombe au praticien. Les tarifs affichés
          sont indicatifs en FCFA et peuvent inclure une commission de plateforme, communiquée avant paiement.
        </p>
      </Section>

      <Section>
        <h2>6. Données personnelles</h2>
        <p>
          Traitement conforme à la Politique de confidentialité et au cadre camerounais (DPN).
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;export et de suppression
          (sous réserve des obligations légales de conservation).
        </p>
      </Section>

      <Section>
        <h2>7. Paiements</h2>
        <p>
          Paiements via opérateurs Mobile Money et prestataires intégrés. Les litiges de transaction
          relèvent des conditions du prestataire et du support {BRAND.name}.
        </p>
      </Section>

      <Section>
        <h2>8. Suspension & résiliation</h2>
        <p>
          Vous pouvez demander la suppression de votre compte. {BRAND.name} peut suspendre un compte
          en cas de violation des CGU, de fraude documentaire, ou sur injonction des autorités.
        </p>
      </Section>

      <Section>
        <h2>9. Droit applicable</h2>
        <p>
          Droit camerounais. Litiges : tentative de règlement amiable, puis juridictions compétentes du Cameroun.
        </p>
      </Section>

      <Box>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
          Contact : <strong>support@{BRAND.domain}</strong> · DPO : <strong>dpo@{BRAND.domain}</strong>
        </p>
      </Box>
    </Page>
  );
}
