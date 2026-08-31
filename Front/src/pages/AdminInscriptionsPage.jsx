import React, { useState } from 'react';
import styled from 'styled-components';
import { Shield, Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import AdminDocumentPanel from '../components/admin/AdminDocumentPanel';
import {
  useInscriptionsEnAttente, useValiderInscription, useRejeterInscription, usePreVerifierInscription,
} from '../hooks/useInscription';
import { useAdminAuditLogs } from '../hooks/useAdminAudit';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  medecin: 'Médecin',
  pharmacie: 'Pharmacie',
  hopital: 'Hôpital',
  clinique: 'Clinique',
};

const OPERATEUR_LABELS = {
  orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo',
  wave: 'Wave',
};

const InscriptionCard = styled(Card)`
  padding: 22px;
  margin-bottom: 14px;
`;

const TypeBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.deep};
`;

const Meta = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const ExpandBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.deep};
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

const RejectArea = styled.div`
  margin-top: 14px;

  textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    font-family: inherit;
    font-size: 0.88rem;
    margin-bottom: 8px;
    resize: vertical;
  }
`;

const Timeline = styled.ul`
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 14px;

  li {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    padding: 6px 0;
    border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

    &:last-child { border-bottom: none; }

    strong { color: ${({ theme }) => theme.colors.text}; }
  }
`;

const ACTION_LABELS = {
  inscription_soumise: 'Demande soumise',
  inscription_validee: 'Inscription validée',
  inscription_rejetee: 'Inscription rejetée',
  document_consulte: 'Document consulté',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function InscriptionAuditTimeline({ inscriptionId }) {
  const { data } = useAdminAuditLogs({
    cible_type: 'inscription',
    cible_id: inscriptionId,
    limit: 15,
  });
  const logs = data?.logs || [];
  if (!logs.length) return null;

  return (
    <Timeline>
      {logs.map((log) => (
        <li key={log.id}>
          <strong>{ACTION_LABELS[log.action] || log.action}</strong>
          {' — '}{log.acteur_label}
          {' · '}{formatDate(log.createdAt)}
          {log.details?.nom_original && ` · ${log.details.nom_original}`}
        </li>
      ))}
    </Timeline>
  );
}

export default function AdminInscriptionsPage() {
  const { data: inscriptions, isLoading, error, refetch } = useInscriptionsEnAttente();
  const valider = useValiderInscription();
  const rejeter = useRejeterInscription();
  const preVerifier = usePreVerifierInscription();
  const [motif, setMotif] = useState('');
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [aiReports, setAiReports] = useState({});

  const handleValider = async (id) => {
    try {
      await valider.mutateAsync(id);
      toast.success('Dossier validé — compte pleinement activé');
      setSelected(null);
      setExpanded(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handlePreVerifier = async (id) => {
    try {
      const rapport = await preVerifier.mutateAsync(id);
      setAiReports((prev) => ({ ...prev, [id]: rapport }));
      setExpanded(id);
      toast.success(`Pré-analyse IA : ${rapport.verdict_global}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pré-vérification impossible');
    }
  };

  const handleRejeter = async (id) => {
    if (!motif.trim()) { toast.error('Indiquez un motif de rejet'); return; }
    try {
      await rejeter.mutateAsync({ id, motif_rejet: motif });
      toast.success('Inscription rejetée');
      setSelected(null);
      setExpanded(null);
      setMotif('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Impossible de charger les demandes" onRetry={refetch} />;

  const list = inscriptions || [];

  return (
    <div>
      <PageHeader
        title={<> <Shield size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Validation MINSANTE</>}
        subtitle="Dossiers professionnels en attente — consultez les pièces jointes avant validation."
      />

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          Aucune demande en attente pour le moment.
        </Card>
      ) : list.map((ins) => {
        const isOpen = expanded === ins.id;
        return (
          <InscriptionCard key={ins.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <TypeBadge>{TYPE_LABELS[ins.type_profil] || ins.type_profil}</TypeBadge>
                <h3 style={{ margin: '6px 0 4px', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 500 }}>
                  {ins.prenom ? `${ins.prenom} ${ins.nom}` : ins.nom_structure || ins.nom}
                </h3>
                <Meta>
                  {ins.email} — {ins.ville}{ins.region ? `, ${ins.region}` : ''}
                </Meta>
                {ins.numero_ordre && <Meta style={{ marginTop: 4 }}>N° ordre : {ins.numero_ordre}</Meta>}
                {ins.numero_agrement && <Meta style={{ marginTop: 4 }}>Agrément : {ins.numero_agrement}</Meta>}
                {ins.donnees?.paiement && (
                  <Meta style={{ marginTop: 8, color: '#0F766E' }}>
                    {OPERATEUR_LABELS[ins.donnees.paiement.operateur] || ins.donnees.paiement.operateur}
                    {' — '}{ins.donnees.paiement.numero}
                    {' ('}{ins.donnees.paiement.titulaire}{')'}
                    {ins.donnees.paiement.numero_marchand && ` · Marchand: ${ins.donnees.paiement.numero_marchand}`}
                  </Meta>
                )}
                <Meta style={{ marginTop: 8, fontSize: '0.75rem' }}>Statut : {ins.statut}</Meta>
              </div>
              <Actions>
                <Button size="sm" variant="secondary" onClick={() => handlePreVerifier(ins.id)} disabled={preVerifier.isPending}>
                  <Sparkles size={14} /> Pré-analyse IA
                </Button>
                <Button size="sm" onClick={() => handleValider(ins.id)} disabled={valider.isPending}>
                  <Check size={14} /> Valider
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setSelected(selected === ins.id ? null : ins.id)}>
                  <X size={14} /> Rejeter
                </Button>
              </Actions>
            </div>

            <ExpandBtn type="button" onClick={() => setExpanded(isOpen ? null : ins.id)}>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isOpen ? 'Masquer le dossier' : `Voir le dossier (${ins.documents?.length || 0} document${(ins.documents?.length || 0) > 1 ? 's' : ''})`}
            </ExpandBtn>

            {isOpen && (
              <>
                <AdminDocumentPanel documents={ins.documents} />
                {(aiReports[ins.id] || ins.donnees?.ai_verification) && (
                  <div style={{ marginTop: 12, padding: 12, background: '#F8FAFC', borderRadius: 8, fontSize: '0.82rem' }}>
                    <strong>Rapport IA (indicatif)</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', fontSize: '0.75rem' }}>
                      {JSON.stringify(aiReports[ins.id] || ins.donnees?.ai_verification, null, 2)}
                    </pre>
                  </div>
                )}
                <InscriptionAuditTimeline inscriptionId={ins.id} />
              </>
            )}

            {selected === ins.id && (
              <RejectArea>
                <textarea
                  placeholder="Motif de rejet (obligatoire)"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={2}
                />
                <Button size="sm" variant="secondary" onClick={() => handleRejeter(ins.id)}>Confirmer le rejet</Button>
              </RejectArea>
            )}
          </InscriptionCard>
        );
      })}
    </div>
  );
}
