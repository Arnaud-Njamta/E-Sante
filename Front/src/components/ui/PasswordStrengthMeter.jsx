import React, { useMemo } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  margin-top: 8px;
`;

const Track = styled.div`
  height: 6px;
  border-radius: 99px;
  background: #E8E4DC;
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 99px;
  transition: width 0.2s ease, background 0.2s ease;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #6B6560;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

const Hints = styled.ul`
  margin: 6px 0 0;
  padding-left: 16px;
  font-size: 0.72rem;
  color: #8A847C;
  line-height: 1.45;
`;

/** Score 0–4 : trop court / faible / moyen / fort / très fort */
export function scorePassword(password = '') {
  const p = String(password);
  if (!p) {
    return {
      score: 0, pct: 0, label: '', color: '#E8E4DC', hints: [],
    };
  }

  let score = 0;
  const hints = [];

  if (p.length >= 8) score += 1;
  else hints.push('Au moins 8 caractères');

  if (p.length >= 12) score += 1;

  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  else hints.push('Majuscules et minuscules');

  if (/\d/.test(p)) score += 1;
  else hints.push('Au moins un chiffre');

  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  else hints.push('Un caractère spécial (!@#…)');

  // Cap à 4 pour l'échelle visuelle
  const capped = Math.min(4, score);
  const map = [
    { label: 'Trop court', color: '#B91C1C', pct: 15 },
    { label: 'Faible', color: '#DC2626', pct: 30 },
    { label: 'Moyen', color: '#D97706', pct: 55 },
    { label: 'Fort', color: '#16A34A', pct: 80 },
    { label: 'Très fort', color: '#15803D', pct: 100 },
  ];

  // score 0 = empty handled above; raw length < 8 → index 0
  let idx = 0;
  if (p.length < 8) idx = 0;
  else if (capped <= 1) idx = 1;
  else if (capped === 2) idx = 2;
  else if (capped === 3) idx = 3;
  else idx = 4;

  return {
    score: capped,
    pct: map[idx].pct,
    label: map[idx].label,
    color: map[idx].color,
    hints: hints.slice(0, 3),
    isAcceptable: p.length >= 8 && capped >= 2,
  };
}

export default function PasswordStrengthMeter({ password = '' }) {
  const result = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;

  return (
    <Wrap>
      <Track>
        <Fill $pct={result.pct} $color={result.color} />
      </Track>
      <Meta>
        <Label $color={result.color}>{result.label}</Label>
        <span>{password.length} car.</span>
      </Meta>
      {result.hints.length > 0 && result.score < 4 && (
        <Hints>
          {result.hints.map((h) => <li key={h}>{h}</li>)}
        </Hints>
      )}
    </Wrap>
  );
}
