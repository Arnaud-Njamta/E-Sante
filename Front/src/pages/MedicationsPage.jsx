import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useTraitements, useCreateTraitement, useUpdateTraitement, useDeleteTraitement } from '../hooks/useTraitements';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, Heart, Search, Pill, FileText,
  Droplet, Tablet, Flame, ChevronRight,
} from 'lucide-react';
import { getActiveLocale } from '../i18n/syncLanguage';

/* ─── Styles ─── */
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: fadeIn 0.4s ease both;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  h1 { font-size: 1.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin: 0; }
  p  { font-size: 0.9rem; color: ${({ theme }) => theme.colors.textSecondary}; margin: 4px 0 0; }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: fadeIn 0.4s ease both;
  animation-delay: 0.05s;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  svg { width: 16px; height: 16px; color: ${({ theme }) => theme.colors.textMuted}; flex-shrink: 0; }
  input {
    border: none;
    background: none;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    width: 100%;
    outline: none;
    &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
`;

const FilterTab = styled.button`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) => $active ? theme.colors.primary[500] : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSecondary};
  &:hover { background: ${({ $active, theme }) => $active ? theme.colors.primary[500] : theme.colors.neutral[100]}; }
`;

const MedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const MedCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  animation-delay: ${({ $delay }) => $delay};
  position: relative;
`;

const MedTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const MedIconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ $color }) => $color};
  svg { width: 20px; height: 20px; }
`;

const MedNameBlock = styled.div`
  flex: 1;
  h3 { margin: 0; font-size: 1rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; }
  span { font-size: 0.8rem; color: ${({ theme }) => theme.colors.primary[500]}; font-style: italic; }
`;

const StatusTag = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ $color }) => $color};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const DetailItem = styled.div`
  .label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${({ theme }) => theme.colors.textMuted}; margin-bottom: 2px; }
  .value { font-size: 0.85rem; font-weight: 600; color: ${({ theme }) => theme.colors.text}; }
`;

const DurationItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  .label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${({ theme }) => theme.colors.textMuted}; margin-bottom: 2px; }
  .value { font-size: 0.85rem; font-weight: 500; color: ${({ theme }) => theme.colors.text}; }
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[100]};
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 6px;
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.neutral[50]};
  transition: all 0.2s;
  svg { width: 16px; height: 16px; }
  &:hover { background: ${({ theme }) => theme.colors.primary[50]}; color: ${({ theme }) => theme.colors.primary[500]}; }
`;

const DeleteIconBtn = styled(IconBtn)`
  &:hover { background: #FEF2F2; color: #EF4444; }
`;

/* Add Card */
const AddCard = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing[8]};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 280px;
  animation: fadeIn 0.4s ease both;
  &:hover { border-color: ${({ theme }) => theme.colors.primary[400]}; background: ${({ theme }) => theme.colors.primary[50]}; }
`;

const AddIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  svg { width: 22px; height: 22px; }
`;

const AddTitle = styled.h4`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px;
`;

const AddDesc = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing[5]};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

/* ─── Helpers ─── */
const getFormeIcon = (forme) => {
  switch (forme) {
    case 'sirop': case 'gouttes': return Droplet;
    case 'comprime': case 'gelule': return Tablet;
    case 'pommade': case 'patch': return Flame;
    default: return Pill;
  }
};

const getStatusLabel = (statut, t) => {
  const key = statut === 'termine' ? 'termine' : statut === 'arrete' ? 'arrete' : 'actif';
  const colors = { actif: '#22C55E', termine: '#64748B', arrete: '#EF4444' };
  return { label: t(`medications.status.${key}`), color: colors[key] || colors.actif };
};

const getColor = (forme) => {
  switch (forme) {
    case 'comprime': return '#2D7FF9';
    case 'gelule': return '#8B5CF6';
    case 'sirop': return '#22C55E';
    case 'injection': return '#EF4444';
    case 'patch': return '#F59E0B';
    default: return '#2D7FF9';
  }
};

/* ─── Component ─── */
export default function MedicationsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // API hooks
  const { data: traitements, isLoading, error } = useTraitements();
  const createMutation = useCreateTraitement();
  const updateMutation = useUpdateTraitement();
  const deleteMutation = useDeleteTraitement();

  const allTraitements = Array.isArray(traitements) ? traitements : [];

  const filtered = allTraitements.filter((m) => {
    const matchSearch = (m.nom_medicament || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchSearch;
    if (filter === 'active') return matchSearch && m.statut === 'actif';
    if (filter === 'completed') return matchSearch && m.statut === 'termine';
    if (filter === 'stopped') return matchSearch && m.statut === 'arrete';
    return matchSearch;
  });

  const onSubmit = (data) => {
    const payload = {
      nom_medicament: data.nom,
      dosage: data.dosage,
      forme: data.forme || 'comprime',
      frequence: data.frequence || '1',
      instructions: data.instructions,
      date_debut: data.dateDebut || undefined,
      date_fin: data.dateFin || undefined,
      horaires_prise: data.horaires ? data.horaires.split(',').map(h => h.trim()) : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload }, {
        onSuccess: () => {
          toast.success(t('medications.updated_toast', { name: data.nom }));
          setShowModal(false);
          setEditingId(null);
          reset();
        },
        onError: (err) => toast.error(err.response?.data?.message || t('medications.update_error')),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t('medications.added_toast', { name: data.nom }));
          setShowModal(false);
          reset();
        },
        onError: (err) => toast.error(err.response?.data?.message || t('medications.add_error')),
      });
    }
  };

  const handleEdit = (med) => {
    setEditingId(med.id);
    setValue('nom', med.nom_medicament);
    setValue('dosage', med.dosage);
    setValue('forme', med.forme);
    setValue('frequence', med.frequence);
    setValue('instructions', med.instructions);
    setValue('dateDebut', med.date_debut ? med.date_debut.split('T')[0] : '');
    setValue('dateFin', med.date_fin ? med.date_fin.split('T')[0] : '');
    setShowModal(true);
  };

  const handleDelete = (med) => {
    if (!window.confirm(t('medications.delete_confirm', { name: med.nom_medicament }))) return;
    deleteMutation.mutate(med.id, {
      onSuccess: () => toast.success(t('medications.deleted_toast')),
      onError: () => toast.error(t('medications.delete_error')),
    });
  };

  const locale = getActiveLocale();

  if (isLoading) return <Spinner text={t('medications.loading')} />;
  if (error) return <ErrorState title={t('errors.generic')} message={t('medications.error_load')} onRetry={() => window.location.reload()} />;

  return (
    <>
      <PageHeader>
        <div>
          <h1>{t('medications.title')}</h1>
          <p>{t('medications.subtitle')}</p>
        </div>
        <Button icon={Plus} onClick={() => { setEditingId(null); reset(); setShowModal(true); }}>
          {t('medications.add')}
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput>
          <Search />
          <input placeholder={t('medications.search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </SearchInput>
        <Divider />
        <FilterTabs>
          {[
            { key: 'all', labelKey: 'medications.filter_all' },
            { key: 'active', labelKey: 'medications.filter_active' },
            { key: 'completed', labelKey: 'medications.filter_completed' },
            { key: 'stopped', labelKey: 'medications.filter_stopped' },
          ].map((tab) => (
            <FilterTab key={tab.key} $active={filter === tab.key} onClick={() => setFilter(tab.key)}>{t(tab.labelKey)}</FilterTab>
          ))}
        </FilterTabs>
      </FilterBar>

      {filtered.length === 0 && !allTraitements.length ? (
        <EmptyState
          icon={Pill}
          title={t('medications.empty_title')}
          description={t('medications.empty_desc')}
        />
      ) : (
        <MedGrid>
          {filtered.map((med, i) => {
            const MedIcon = getFormeIcon(med.forme);
            const status = getStatusLabel(med.statut, t);
            const color = getColor(med.forme);
            return (
              <MedCard key={med.id} hoverable $delay={`${0.05 * (i + 1)}s`}>
                <MedTop>
                  <MedIconWrap $color={color}><MedIcon /></MedIconWrap>
                  <MedNameBlock>
                    <h3>{med.nom_medicament}</h3>
                    <span>{med.forme}</span>
                  </MedNameBlock>
                  <StatusTag $color={status.color}>{status.label}</StatusTag>
                </MedTop>

                <DetailGrid>
                  <DetailItem>
                    <div className="label">{t('medications.field_dosage')}</div>
                    <div className="value">{med.dosage || '—'}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">{t('medications.field_frequency')}</div>
                    <div className="value">{med.frequence ? t('medications.per_day', { n: med.frequence }) : '—'}</div>
                  </DetailItem>
                </DetailGrid>

                <DurationItem>
                  <div className="label">{t('medications.field_period')}</div>
                  <div className="value">
                    {med.date_debut ? new Date(med.date_debut).toLocaleDateString(locale) : '—'}
                    {med.date_fin ? ` — ${new Date(med.date_fin).toLocaleDateString(locale)}` : ` — ${t('medications.ongoing')}`}
                  </div>
                </DurationItem>

                <CardActions>
                  <ActionIcons>
                    <IconBtn onClick={() => handleEdit(med)}><Edit2 /></IconBtn>
                    <DeleteIconBtn onClick={() => handleDelete(med)}><Trash2 /></DeleteIconBtn>
                  </ActionIcons>
                </CardActions>
              </MedCard>
            );
          })}

          <AddCard onClick={() => { setEditingId(null); reset(); setShowModal(true); }}>
            <AddIcon><Plus /></AddIcon>
            <AddTitle>{t('medications.add_card_title')}</AddTitle>
            <AddDesc>{t('medications.add_card_desc')}</AddDesc>
          </AddCard>
        </MedGrid>
      )}

      <Footer>
        <span>{t('medications.shown_count', { count: filtered.length })}</span>
      </Footer>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingId(null); reset(); }}
        title={editingId ? t('medications.edit_modal') : t('medications.add_modal')}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingId(null); reset(); }}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? t('medications.saving') : t('common.save')}
            </Button>
          </>
        }
      >
        <FormGrid>
          <Input label={t('medications.label_name')} placeholder={t('medications.placeholder_name')} error={errors.nom?.message} {...register('nom', { required: t('medications.name_required') })} />
          <Input label={t('medications.label_dosage')} placeholder={t('medications.placeholder_dosage')} error={errors.dosage?.message} {...register('dosage', { required: t('medications.dosage_required') })} />
          <Input label={t('medications.label_form')} placeholder={t('medications.placeholder_form')} {...register('forme')} />
          <Input label={t('medications.label_frequency')} placeholder={t('medications.placeholder_frequency')} {...register('frequence')} />
          <Input label={t('medications.label_schedule')} placeholder={t('medications.placeholder_schedule')} {...register('horaires')} />
          <Input label={t('medications.label_instructions')} placeholder={t('medications.placeholder_instructions')} {...register('instructions')} />
          <Input label={t('medications.label_start')} type="date" {...register('dateDebut')} />
          <Input label={t('medications.label_end')} type="date" {...register('dateFin')} />
        </FormGrid>
      </Modal>
    </>
  );
}
