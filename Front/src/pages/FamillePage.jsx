import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Trash2, Edit2, Baby } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import FamilleProfilSwitcher from '../components/patient/FamilleProfilSwitcher';
import {
  useFamilleProfils, useCreerProfilFamille, useUpdateProfilFamille, useSupprimerProfilFamille,
} from '../hooks/useFamille';
import toast from 'react-hot-toast';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const MemberCard = styled(Card)`
  padding: 20px;
  position: relative;

  .relation {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 8px;
  }

  h3 { margin: 0 0 4px; font-size: 1.1rem; }
  p { margin: 0; font-size: 0.82rem; color: ${({ theme }) => theme.colors.textSecondary }; }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }
`;

const FormCard = styled(Card)`
  padding: 24px;
  margin-top: 20px;
`;

const RELATIONS = ['enfant', 'parent', 'conjoint', 'autre'];

const emptyForm = { nom: '', prenom: '', date_naissance: '', relation: 'enfant', contact_urgence: '' };

export default function FamillePage() {
  const { t } = useTranslation();
  const { data: profils, isLoading } = useFamilleProfils();
  const creer = useCreerProfilFamille();
  const update = useUpdateProfilFamille();
  const supprimer = useSupprimerProfilFamille();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const list = Array.isArray(profils) ? profils : [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      nom: p.nom,
      prenom: p.prenom,
      date_naissance: p.date_naissance || '',
      relation: p.relation,
      contact_urgence: p.contact_urgence || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim()) {
      toast.error(t('famille.name_required'));
      return;
    }
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
      } else {
        if (list.length >= 8) {
          toast.error(t('famille.max_reached'));
          return;
        }
        await creer.mutateAsync(form);
      }
      toast.success(t('famille.saved'));
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('famille.delete_confirm'))) return;
    try {
      await supprimer.mutateAsync(id);
      toast.success(t('famille.deleted'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner text={t('common.loading')} />;

  return (
    <>
      <PageHeader
        title={t('famille.title')}
        subtitle={t('famille.subtitle')}
        icon={<Users size={24} />}
      />

      <FamilleProfilSwitcher />

      <Button onClick={openCreate} disabled={list.length >= 8}>
        <Plus size={16} /> {t('famille.add_member')}
      </Button>

      {list.length === 0 && !showForm && (
        <p style={{ marginTop: 20, color: '#64748B', fontStyle: 'italic' }}>{t('famille.empty')}</p>
      )}

      <Grid>
        {list.map((p) => (
          <MemberCard key={p.id}>
            <div className="relation">{t(`famille.relations.${p.relation}`)}</div>
            <h3>{p.prenom} {p.nom}</h3>
            {p.date_naissance && <p>{new Date(p.date_naissance).toLocaleDateString()}</p>}
            {p.groupe_sanguin && <p>🩸 {p.groupe_sanguin}</p>}
            <div className="actions">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                <Edit2 size={14} />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </MemberCard>
        ))}
      </Grid>

      {showForm && (
        <FormCard>
          <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Baby size={20} />
            {editingId ? t('famille.edit') : t('famille.add_member')}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
            <Input label={t('famille.firstname')} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            <Input label={t('famille.lastname')} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            <Input label={t('famille.birthdate')} type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
            <label style={{ fontSize: '0.82rem' }}>
              {t('famille.relation')}
              <select
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8 }}
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{t(`famille.relations.${r}`)}</option>
                ))}
              </select>
            </label>
            <Input label={t('famille.emergency_contact')} value={form.contact_urgence} onChange={(e) => setForm({ ...form, contact_urgence: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" disabled={creer.isPending || update.isPending}>
                {t('common.save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </FormCard>
      )}
    </>
  );
}
