import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { getActiveLocale } from '../../i18n/syncLanguage';
import {
  BookHeart, Droplets, Plus, X, Save, PenLine, Bot, StickyNote, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Button from '../ui/Button';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pageTurn = keyframes`
  from { opacity: 0; transform: rotateY(-6deg) translateX(12px); }
  to { opacity: 1; transform: rotateY(0) translateX(0); }
`;

const Notebook = styled.div`
  background:
    linear-gradient(180deg, #F5E6C8 0%, #EDD9B5 6%, #FFF9E8 6%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4A574' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  border-radius: 4px 16px 16px 4px;
  box-shadow:
    4px 4px 0 #C4A574,
    8px 8px 24px rgba(0,0,0,0.12),
    inset 0 0 60px rgba(139, 90, 43, 0.04);
  padding: 0 24px 32px 48px;
  position: relative;
  min-height: 520px;
  animation: ${fadeIn} 0.5s ease both;

  &::before {
    content: '';
    position: absolute;
    left: 36px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #E8B4B4;
    opacity: 0.6;
  }
`;

const Rings = styled.div`
  position: absolute;
  left: 8px;
  top: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  span {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid #8B7355;
    background: linear-gradient(135deg, #D4C4A8, #A89070);
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.4);
  }
`;

const CoverHeader = styled.div`
  background: linear-gradient(135deg, #065F46, #047857);
  margin: 0 -24px 20px -48px;
  padding: 24px 24px 24px 48px;
  border-radius: 4px 16px 0 0;
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }

  h2 {
    margin: 0 0 4px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p { margin: 0; font-size: 0.82rem; opacity: 0.85; }
`;

const BloodStamp = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%) rotate(-8deg);
  border: 3px solid rgba(255,255,255,0.5);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  color: white;
  background: rgba(220, 38, 38, 0.35);
`;

const BloodSelect = styled.select`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%) rotate(-4deg);
  border: 2px dashed rgba(255,255,255,0.6);
  border-radius: 50%;
  width: 68px;
  height: 68px;
  background: rgba(220, 38, 38, 0.35);
  color: white;
  font-weight: 800;
  font-size: 0.8rem;
  text-align: center;
  cursor: pointer;
  appearance: none;
  padding: 0;

  option { color: #1E293B; background: white; }
`;

const PageTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid #D4A574;
  padding-bottom: 0;
`;

const PageTab = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px 8px 0 0;
  background: ${({ $active }) => ($active ? '#FFF9E8' : 'transparent')};
  color: ${({ $active }) => ($active ? '#92400E' : '#A8A29E')};
  font-family: Georgia, serif;
  font-size: 0.82rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  border-bottom: ${({ $active }) => ($active ? '2px solid #FFF9E8' : 'none')};
  margin-bottom: -2px;
  transition: all 0.15s;

  &:hover { color: #92400E; }
`;

const PageContent = styled.div`
  animation: ${pageTurn} 0.35s ease both;
`;

const PageSection = styled.div`
  margin-bottom: 20px;
  animation: ${fadeIn} 0.4s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
`;

const SectionLabel = styled.div`
  font-family: Georgia, serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #92400E;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px dashed #D4A574;
  padding-bottom: 4px;
`;

const LinedArea = styled.textarea`
  width: 100%;
  min-height: ${({ $rows }) => ($rows || 2) * 32}px;
  border: none;
  background: repeating-linear-gradient(
    transparent,
    transparent 31px,
    #E8D5B5 31px,
    #E8D5B5 32px
  );
  background-color: transparent;
  font-family: 'Caveat', 'Segoe Script', cursive;
  font-size: 1.25rem;
  line-height: 32px;
  color: #1E3A5F;
  resize: vertical;
  padding: 0 4px;
  outline: none;

  &::placeholder { color: #A8A29E; font-style: italic; font-size: 1.1rem; }
  &:focus { background-color: rgba(255, 251, 235, 0.5); }
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 36px;
  padding: 4px 0;
`;

const Tag = styled.span`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.82rem;
  background: ${({ $alert }) => ($alert ? '#FEE2E2' : '#FEF3C7')};
  color: ${({ $alert }) => ($alert ? '#991B1B' : '#92400E')};
  border: 1px solid ${({ $alert }) => ($alert ? '#FECACA' : '#FDE68A')};
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: Georgia, serif;
`;

const TagField = styled.input`
  border: none;
  background: transparent;
  font-size: 0.85rem;
  min-width: 120px;
  outline: none;
  font-style: italic;
  color: #78716C;
  font-family: 'Caveat', cursive;
  font-size: 1.1rem;
`;

const StickyNoteBox = styled.div`
  background: linear-gradient(135deg, #FEF08A, #FDE047);
  padding: 14px 16px;
  border-radius: 2px 12px 12px 2px;
  box-shadow: 3px 3px 8px rgba(0,0,0,0.1);
  transform: rotate(-1deg);
  margin-bottom: 16px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 12px;
    background: rgba(0,0,0,0.08);
    border-radius: 2px;
  }

  textarea {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'Caveat', cursive;
    font-size: 1.3rem;
    line-height: 1.4;
    color: #422006;
    resize: none;
    outline: none;
    min-height: 60px;

    &::placeholder { color: #A16207; opacity: 0.7; }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
  }

  button {
    background: #92400E;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    &:hover { background: #78350F; }
    &:disabled { opacity: 0.5; }
  }
`;

const ObsEntry = styled.div`
  padding: 10px 12px;
  margin-bottom: 8px;
  border-left: 3px solid ${({ $ia }) => ($ia ? '#7C3AED' : '#059669')};
  background: rgba(255,255,255,0.5);
  border-radius: 0 8px 8px 0;
  font-size: 0.95rem;
  line-height: 1.5;
  font-family: 'Caveat', cursive;

  .meta {
    font-size: 0.7rem;
    color: #94A3B8;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: system-ui, sans-serif;
  }
`;

const PageNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #D4A574;

  button {
    background: none;
    border: 1px solid #D4A574;
    border-radius: 8px;
    padding: 6px 12px;
    color: #92400E;
    font-size: 0.78rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    &:hover { background: #FEF3C7; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  span { font-size: 0.75rem; color: #A8A29E; font-family: Georgia, serif; }
`;

const GROUPES_SANGUINS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SECTION_KEYS = [
  { key: 'allergies', labelKey: 'carnet.fields.allergies', phKey: 'carnet.placeholders.allergies', alert: true },
  { key: 'pathologies', labelKey: 'carnet.fields.pathologies', phKey: 'carnet.placeholders.pathologies' },
  { key: 'traitements_habituelles', labelKey: 'carnet.fields.traitements', phKey: 'carnet.placeholders.traitements' },
  { key: 'vaccinations', labelKey: 'carnet.fields.vaccinations', phKey: 'carnet.placeholders.vaccinations' },
  { key: 'antecedents_familiaux', labelKey: 'carnet.fields.antecedents_fam', phKey: 'carnet.placeholders.antecedents_fam' },
  { key: 'antecedents_chirurgicaux', labelKey: 'carnet.fields.antecedents_chir', phKey: 'carnet.placeholders.antecedents_chir' },
];

function TagEditor({ values = [], onChange, alert, placeholder, addLabel }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <TagInput>
      {values.map((v) => (
        <Tag key={v} $alert={alert}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
            <X size={12} />
          </button>
        </Tag>
      ))}
      <TagField
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder={values.length ? addLabel : placeholder}
      />
    </TagInput>
  );
}

export default function CarnetNotebook({
  data, form, setForm, onSave, saving, readOnly = false,
}) {
  const { t } = useTranslation();
  const locale = getActiveLocale();
  const [page, setPage] = useState(0);
  const [stickyDraft, setStickyDraft] = useState('');

  const f = form || data;
  const editable = !!setForm && !readOnly;
  const fullName = [f?.prenom, f?.nom].filter(Boolean).join(' ') || t('carnet.my_notebook');
  const observations = f?.observations_carnet || [];

  const sections = useMemo(() => SECTION_KEYS.map((s) => ({
    ...s,
    label: t(s.labelKey),
    placeholder: t(s.phKey),
  })), [t]);

  const pages = useMemo(() => [
    { id: 0, label: t('carnet.page_medical') },
    { id: 1, label: t('carnet.page_notes') },
  ], [t]);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const addObservation = (text) => {
    if (!text?.trim()) return;
    update('observations_carnet', [
      { id: Date.now(), date: new Date().toISOString(), text: text.trim(), source: 'patient' },
      ...observations,
    ]);
    setStickyDraft('');
  };

  return (
    <Notebook>
      <Rings>{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <span key={i} />)}</Rings>

      <CoverHeader>
        <h2><BookHeart size={22} /> {fullName}</h2>
        <p>{t('carnet.notebook_subtitle')}</p>
        {editable ? (
          <BloodSelect
            value={f?.groupe_sanguin || ''}
            onChange={(e) => update('groupe_sanguin', e.target.value)}
            title={t('carnet.blood_title')}
          >
            {GROUPES_SANGUINS.map((g) => (
              <option key={g || 'empty'} value={g}>{g || '🩸 ?'}</option>
            ))}
          </BloodSelect>
        ) : f?.groupe_sanguin && (
          <BloodStamp><Droplets size={14} />{f.groupe_sanguin}</BloodStamp>
        )}
      </CoverHeader>

      <PageTabs>
        {pages.map((p) => (
          <PageTab key={p.id} type="button" $active={page === p.id} onClick={() => setPage(p.id)}>
            {p.label}
          </PageTab>
        ))}
      </PageTabs>

      {page === 0 && (
        <PageContent key="page-0">
          {sections.map((sec, i) => (
            <PageSection key={sec.key} $delay={`${0.05 * i}s`}>
              <SectionLabel><PenLine size={12} /> {sec.label}</SectionLabel>
              {editable ? (
                <TagEditor
                  values={f[sec.key] || []}
                  onChange={(v) => update(sec.key, v)}
                  alert={sec.alert}
                  placeholder={sec.placeholder}
                  addLabel={t('carnet.add_tag')}
                />
              ) : (
                <TagInput>
                  {(f[sec.key] || []).length > 0
                    ? (f[sec.key] || []).map((v) => <Tag key={v} $alert={sec.alert}>{v}</Tag>)
                    : <span style={{ color: '#A8A29E', fontStyle: 'italic', fontSize: '0.85rem' }}>—</span>}
                </TagInput>
              )}
            </PageSection>
          ))}
        </PageContent>
      )}

      {page === 1 && (
        <PageContent key="page-1">
          {editable && (
            <StickyNoteBox>
              <textarea
                value={stickyDraft}
                onChange={(e) => setStickyDraft(e.target.value)}
                placeholder={t('carnet.placeholders.sticky')}
                rows={3}
              />
              <div className="actions">
                <button type="button" onClick={() => addObservation(stickyDraft)} disabled={!stickyDraft.trim()}>
                  <Plus size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {t('carnet.pin_note')}
                </button>
              </div>
            </StickyNoteBox>
          )}

          <PageSection $delay="0.1s">
            <SectionLabel><StickyNote size={12} /> {t('carnet.free_notes')}</SectionLabel>
            {editable ? (
              <LinedArea
                $rows={5}
                value={f.notes_medicales || ''}
                onChange={(e) => update('notes_medicales', e.target.value)}
                placeholder={t('carnet.placeholders.notes')}
              />
            ) : (
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontFamily: "'Caveat', cursive" }}>
                {f.notes_medicales || '—'}
              </p>
            )}
          </PageSection>

          <PageSection $delay="0.2s">
            <SectionLabel>
              <Bot size={12} /> {t('carnet.observations')}
            </SectionLabel>
            {observations.length === 0 ? (
              <p style={{ color: '#A8A29E', fontStyle: 'italic', fontSize: '0.95rem', margin: 0, fontFamily: "'Caveat', cursive" }}>
                {t('carnet.observations_empty')}
              </p>
            ) : observations.map((o) => (
              <ObsEntry key={o.id || o.date} $ia={o.source === 'ia'}>
                <div className="meta">
                  {o.source === 'ia' ? <><Bot size={10} /> {t('carnet.source_ia')}</> : <><PenLine size={10} /> {t('carnet.source_me')}</>}
                  {' · '}
                  {new Date(o.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {o.text}
              </ObsEntry>
            ))}
          </PageSection>
        </PageContent>
      )}

      <PageNav>
        <button type="button" onClick={() => setPage(0)} disabled={page === 0}>
          <ChevronLeft size={14} /> {t('carnet.prev')}
        </button>
        <span>{t('carnet.page_of', { current: page + 1, total: pages.length })}</span>
        <button type="button" onClick={() => setPage(1)} disabled={page === 1}>
          {t('carnet.next_page')} <ChevronRight size={14} />
        </button>
      </PageNav>

      {editable && onSave && (
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <Button onClick={onSave} disabled={saving}>
            <Save size={16} /> {saving ? t('carnet.saving') : t('carnet.save')}
          </Button>
        </div>
      )}
    </Notebook>
  );
}
