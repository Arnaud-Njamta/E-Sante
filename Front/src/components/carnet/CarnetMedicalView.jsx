import React from 'react';
import styled, { keyframes } from 'styled-components';
import { BookHeart, Droplets, AlertTriangle, Activity, Users, Scissors, Pill, Syringe, FileText, Pencil } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Hero = styled.div`
  background: linear-gradient(145deg, #047857, #065F46);
  border-radius: 20px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
  animation: ${slideUp} 0.5s ease both;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const HeroTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeroSub = styled.p`
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.88;
`;

const BloodBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
`;

const Section = styled(Card)`
  padding: 18px;
  margin-bottom: 14px;
  animation: ${slideUp} 0.45s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: 0.9rem;

  svg { width: 18px; height: 18px; color: ${({ theme }) => theme.colors.primary[600]}; }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ $variant }) => {
    if ($variant === 'alert') return '#FEF2F2';
    if ($variant === 'info') return '#EFF6FF';
    return '#ECFDF5';
  }};
  color: ${({ $variant }) => {
    if ($variant === 'alert') return '#B91C1C';
    if ($variant === 'info') return '#1D4ED8';
    return '#047857';
  }};
`;

const EmptyHint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

const Notes = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  animation: ${slideUp} 0.5s 0.3s ease both;
`;

const SECTIONS = [
  { key: 'allergies', label: 'Allergies', icon: AlertTriangle, variant: 'alert' },
  { key: 'pathologies', label: 'Pathologies', icon: Activity, variant: 'info' },
  { key: 'antecedents_familiaux', label: 'Antécédents familiaux', icon: Users },
  { key: 'antecedents_chirurgicaux', label: 'Antécédents chirurgicaux', icon: Scissors },
  { key: 'traitements_habituelles', label: 'Traitements habituels', icon: Pill },
  { key: 'vaccinations', label: 'Vaccinations', icon: Syringe },
];

function TagSection({ section, data, delay }) {
  const values = data[section.key] || [];
  const Icon = section.icon;

  return (
    <Section $delay={delay}>
      <SectionHead><Icon /> {section.label}</SectionHead>
      {values.length > 0 ? (
        <Tags>
          {values.map((v) => (
            <Tag key={v} $variant={section.variant}>{v}</Tag>
          ))}
        </Tags>
      ) : (
        <EmptyHint>Aucune information renseignée</EmptyHint>
      )}
    </Section>
  );
}

export default function CarnetMedicalView({ data, onEdit }) {
  const fullName = [data?.prenom, data?.nom].filter(Boolean).join(' ') || 'Mon carnet';

  return (
    <div>
      <Hero>
        <HeroTop>
          <div>
            <HeroTitle><BookHeart size={22} /> {fullName}</HeroTitle>
            <HeroSub>Carnet médical électronique — DjamSanté</HeroSub>
          </div>
          {data?.groupe_sanguin && (
            <BloodBadge><Droplets size={16} /> {data.groupe_sanguin}</BloodBadge>
          )}
        </HeroTop>
      </Hero>

      {SECTIONS.map((section, i) => (
        <TagSection key={section.key} section={section} data={data} delay={`${0.05 * (i + 1)}s`} />
      ))}

      {(data?.notes_medicales || '').trim() && (
        <Section $delay="0.35s">
          <SectionHead><FileText /> Notes complémentaires</SectionHead>
          <Notes>{data.notes_medicales}</Notes>
        </Section>
      )}

      <Actions>
        {onEdit && (
          <Button onClick={onEdit}>
            <Pencil size={16} /> Modifier mon carnet
          </Button>
        )}
      </Actions>
    </div>
  );
}
