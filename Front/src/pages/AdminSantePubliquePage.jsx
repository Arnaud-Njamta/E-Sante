import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Building2, Siren, AlertTriangle, Activity } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { CAMEROON_COLORS } from '../config/cameroonHealth';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const Kpi = styled(Card)`
  padding: 16px;
  h4 { margin: 0 0 6px; font-size: 0.72rem; color: #64748B; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
  p { margin: 0; font-size: 1.5rem; font-weight: 700; color: ${CAMEROON_COLORS.greenDark}; }
`;

const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 16px;
`;

const RegionCard = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${({ $alert }) => ($alert ? '#FECACA' : '#E2E8F0')};
  background: ${({ $alert }) => ($alert ? '#FEF2F2' : '#fff')};

  .name { font-weight: 700; font-size: 0.85rem; margin-bottom: 4px; }
  .count { font-size: 0.75rem; color: #64748B; }
`;

const AlerteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const AlerteItem = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  border-left: 4px solid ${({ $p }) => (
    $p === 'critique' ? '#DC2626' : $p === 'attention' ? '#D97706' : '#2563EB'
  )};
  background: #F8FAFC;

  strong { font-size: 0.88rem; }
  p { margin: 4px 0 0; font-size: 0.78rem; color: #64748B; }
  .meta { font-size: 0.7rem; color: #94A3B8; margin-top: 4px; }
`;

export default function AdminSantePubliquePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sante-publique'],
    queryFn: async () => {
      const { data: res } = await client.get(ENDPOINTS.admin.santePublique);
      return res.data;
    },
    refetchInterval: 60_000,
  });

  if (isLoading) return <Spinner text="Chargement santé publique…" />;

  const resume = data?.resume || {};

  return (
    <>
      <PageHeader
        title="Santé publique — MINSANTE"
        subtitle="Vue nationale : alertes, couverture régionale, activité"
        icon={<Activity size={24} />}
      />

      <Grid>
        <Kpi><h4><Users size={14} /> Patients</h4><p>{resume.patients_total ?? 0}</p></Kpi>
        <Kpi><h4><Users size={14} /> Profils famille</h4><p>{resume.profils_famille ?? 0}</p></Kpi>
        <Kpi><h4><Building2 size={14} /> Établissements</h4><p>{resume.etablissements_total ?? 0}</p></Kpi>
        <Kpi><h4><Siren size={14} /> Alertes actives</h4><p>{resume.alertes_actives ?? 0}</p></Kpi>
        <Kpi><h4><AlertTriangle size={14} /> Urgences en attente</h4><p>{resume.demandes_urgence_en_attente ?? 0}</p></Kpi>
      </Grid>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Link to="/admin/alertes"><Button size="sm">Gérer les alertes</Button></Link>
      </div>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={18} /> Carte des alertes par région
        </h3>
        <RegionGrid>
          {(data?.carte_regions || []).map((r) => (
            <RegionCard key={r.region} $alert={r.count > 0}>
              <div className="name">{r.region}</div>
              <div className="count">
                {r.count > 0 ? `${r.count} alerte(s)` : 'Aucune alerte'}
              </div>
            </RegionCard>
          ))}
        </RegionGrid>
      </Card>

      <Card style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 8px' }}>Alertes sanitaires en cours</h3>
        <AlerteList>
          {(data?.alertes_actives || []).length === 0 && (
            <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>Aucune alerte active</p>
          )}
          {(data?.alertes_actives || []).map((a) => (
            <AlerteItem key={a.id} $p={a.priorite}>
              <strong>{a.titre}</strong>
              <p>{a.contenu?.slice(0, 150)}</p>
              <div className="meta">
                {a.region || 'National'} · {a.priorite} · {a.auteur_nom}
                {' · '}
                {new Date(a.created_at).toLocaleString('fr-FR')}
              </div>
            </AlerteItem>
          ))}
        </AlerteList>
      </Card>
    </>
  );
}
