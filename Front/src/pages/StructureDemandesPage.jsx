import React, { useState } from 'react';
import styled from 'styled-components';
import { Inbox, Check, X, Clock, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import { useDemandesEtablissement, useRepondreDemande } from '../hooks/useUrgence';
import toast from 'react-hot-toast';

const List = styled.div`display: flex; flex-direction: column; gap: 12px;`;

const DemandeCard = styled(Card)`
  padding: 16px;
  border-left: 4px solid ${({ $urgent }) => ($urgent ? '#DC2626' : '#F59E0B')};
`;

const STATUT = {
  en_attente: { label: 'En attente', color: '#F59E0B' },
  confirmee: { label: 'Confirmée', color: '#059669' },
  refusee: { label: 'Refusée', color: '#DC2626' },
  annulee: { label: 'Annulée', color: '#94A3B8' },
};

export default function StructureDemandesPage() {
  const { data: demandes, isLoading, refetch } = useDemandesEtablissement();
  const repondre = useRepondreDemande();
  const [replyId, setReplyId] = useState(null);
  const [reponse, setReponse] = useState('');
  const [dateProp, setDateProp] = useState('');
  const [heureProp, setHeureProp] = useState('');

  const list = Array.isArray(demandes) ? demandes : [];

  const handleRepondre = async (id, statut) => {
    try {
      await repondre.mutateAsync({
        id,
        statut,
        reponse_etablissement: reponse || undefined,
        date_proposee: dateProp || undefined,
        heure_proposee: heureProp || undefined,
      });
      toast.success(statut === 'confirmee' ? 'Demande confirmée — le patient est notifié' : 'Demande refusée');
      setReplyId(null);
      setReponse('');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={<><Inbox size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Demandes de prise en charge</>}
        subtitle="Répondez aux patients qui sollicitent vos services"
      />

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Inbox size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>Aucune demande pour le moment.</p>
        </Card>
      ) : (
        <List>
          {list.map((d) => {
            const st = STATUT[d.statut] || STATUT.en_attente;
            return (
              <DemandeCard key={d.id} $urgent={d.priorite === 'urgent'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <strong>{d.numero_reference}</strong>
                    {d.priorite === 'urgent' && (
                      <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#DC2626', fontWeight: 700 }}>
                        <AlertTriangle size={12} /> URGENT
                      </span>
                    )}
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                      {d.patient?.prenom} {d.patient?.nom} — {d.patient?.telephone}
                    </p>
                    {d.service && <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Service : <strong>{d.service.nom}</strong> ({d.service.categorie})</p>}
                    {d.type_urgence && <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#DC2626' }}>Type urgence : {d.type_urgence}</p>}
                    {d.message_patient && <p style={{ margin: '8px 0 0', fontSize: '0.85rem', fontStyle: 'italic' }}>« {d.message_patient} »</p>}
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, background: `${st.color}22`, color: st.color }}>
                    {st.label}
                  </span>
                </div>

                {d.statut === 'en_attente' && (
                  <div style={{ marginTop: 12 }}>
                    {replyId === d.id ? (
                      <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 12 }}>
                        <textarea
                          value={reponse}
                          onChange={(e) => setReponse(e.target.value)}
                          placeholder="Message au patient..."
                          rows={2}
                          style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input type="date" value={dateProp} onChange={(e) => setDateProp(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                          <input type="time" value={heureProp} onChange={(e) => setHeureProp(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button size="sm" onClick={() => handleRepondre(d.id, 'confirmee')} disabled={repondre.isPending}>
                            <Check size={14} /> Confirmer
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleRepondre(d.id, 'refusee')} disabled={repondre.isPending}>
                            <X size={14} /> Refuser
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setReplyId(null)}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setReplyId(d.id)}>
                        <Clock size={14} /> Répondre
                      </Button>
                    )}
                  </div>
                )}

                {d.statut === 'confirmee' && d.date_proposee && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#059669' }}>
                    Créneau proposé : {d.date_proposee} à {d.heure_proposee || '—'}
                  </p>
                )}
              </DemandeCard>
            );
          })}
        </List>
      )}
    </div>
  );
}
