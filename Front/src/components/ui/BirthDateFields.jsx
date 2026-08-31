import React, { useMemo } from 'react';
import styled from 'styled-components';

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 10px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  border: 1px solid ${({ $error }) => ($error ? '#C45C4A' : '#D8D2C8')};
  background:
    linear-gradient(45deg, transparent 50%, #6B6560 50%) calc(100% - 18px) calc(50% - 3px) / 6px 6px no-repeat,
    linear-gradient(135deg, #6B6560 50%, transparent 50%) calc(100% - 12px) calc(50% - 3px) / 6px 6px no-repeat,
    #fff;
  border-radius: 12px;
  padding: 12px 36px 12px 14px;
  font-size: 0.95rem;
  color: #1C1917;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2F6B4F;
    box-shadow: 0 0 0 3px rgba(47, 107, 79, 0.15);
  }
`;

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const daysInMonth = (year, month) => {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
};

const parseIso = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { day: '', month: '', year: '' };
  }
  const [year, month, day] = value.split('-');
  return { day: String(Number(day)), month: String(Number(month)), year };
};

const toIso = (day, month, year) => {
  if (!day || !month || !year) return '';
  const d = String(day).padStart(2, '0');
  const m = String(month).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

/**
 * Sélecteurs jour / mois / année (plus clair que le calendrier natif du navigateur).
 */
export default function BirthDateFields({
  value = '',
  onChange,
  error = false,
  id = 'dateNaissance',
  maxYear = new Date().getFullYear() - 12,
  minYear = 1920,
}) {
  const { day, month, year } = parseIso(value);

  const years = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [maxYear, minYear]);

  const maxDay = daysInMonth(Number(year) || 2000, Number(month) || 1);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => i + 1),
    [maxDay],
  );

  const emit = (next) => {
    const d = next.day ?? day;
    const m = next.month ?? month;
    const y = next.year ?? year;
    const cappedDay = d && Number(d) > daysInMonth(Number(y) || 2000, Number(m) || 1)
      ? String(daysInMonth(Number(y) || 2000, Number(m) || 1))
      : d;
    onChange?.(toIso(cappedDay, m, y));
  };

  return (
    <Row>
      <Select
        id={`${id}-day`}
        aria-label="Jour"
        value={day}
        $error={error}
        onChange={(e) => emit({ day: e.target.value })}
      >
        <option value="">Jour</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Select
        id={`${id}-month`}
        aria-label="Mois"
        value={month}
        $error={error}
        onChange={(e) => emit({ month: e.target.value })}
      >
        <option value="">Mois</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>{label}</option>
        ))}
      </Select>
      <Select
        id={`${id}-year`}
        aria-label="Année"
        value={year}
        $error={error}
        onChange={(e) => emit({ year: e.target.value })}
      >
        <option value="">Année</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>
    </Row>
  );
}
