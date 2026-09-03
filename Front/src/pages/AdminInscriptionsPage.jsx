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
  infirmier: 'Infirmier(ère)',
  aide_soignant: 'Aide-soignant(e)',
  sage_femme: 'Sage-femme',
  kinesitherapeute: 'Kinésithérapeute',
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

const VERDICT_STYLES = {
  favorable: { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857', label: 'Favorable' },
  acceptable: { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857', label: 'Acceptable' },
  douteux: { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309', label: 'Douteux' },
  insuffisant: { bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C', label: 'Insuffisant' },
  rejete: { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C', label: 'Rejeté' },
};

const AiReportCard = styled.div`
  margin-top: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ $border }) => $border || '#E2E8F0'};
  background: ${({ $bg }) => $bg || '#F8FAFC'};
`;

const AiReportHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const AiVerdict = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid ${({ $border }) => $border};
`;

const AiMessage = styled.p`
  margin: 0 0 12px;
  font-size: 0.88rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;

const AiSectionTitle = styled.h4`
  margin: 14px 0 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const AiSourceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AiSourceItem = styled.li`
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid ${({ theme }) => theme.colors.border};

  a {
    font-size: 0.84rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.deep};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  p {
    margin: 4px 0 0;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const AiAnalysisList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.45;
  }
`;

function AiVerificationReport({ report }) {
  if (!report) return null;
  const style = VERDICT_STYLES[report.verdict_global] || {
    bg: '#F8FAFC', border: '#E2E8F0', color: '#475569', label: report.verdict_global || 'Indéterminé',
  };
  const analyses = Array.isArray(report.analyses) ? report.analyses : [];
  const sources = Array.isArray(report.sources_officielles) ? report.sources_officielles : [];

  return (
    <AiReportCard $bg={style.bg} $border={style.border}>
      <AiReportHeader>
        <strong style={{ fontSize: '0.88rem' }}>Rapport IA (indicatif)</strong>
        <AiVerdict $color={style.color} $border={style.border}>
          <Sparkles size={12} /> {style.label}
        </AiVerdict>
      </AiReportHeader>

      {report.message && <AiMessage>{report.message}</AiMessage>}

      {analyses.length > 0 ? (
        <>
          <AiSectionTitle>Analyses documents</AiSectionTitle>
          <AiAnalysisList>
            {analyses.map((a, idx) => (
              <li key={a.document || a.type || idx}>
                <strong>{a.document || a.type || `Document ${idx + 1}`}</strong>
                {a.verdict && <> — {a.verdict}</>}
                {a.message && <div style={{ marginTop: 4, opacity: 0.85 }}>{a.message}</div>}
                {a.score_confiance != null && (
                  <div style={{ marginTop: 4, fontSize: '0.75rem', color: '#64748B' }}>
                    Confiance : {a.score_confiance}%
                  </div>
                )}
              </li>
            ))}
          </AiAnalysisList>
        </>
      ) : (
        <>
          <AiSectionTitle>Analyses documents</AiSectionTitle>
          <AiMessage style={{ marginBottom: 0, color: '#64748B' }}>
            Aucune pièce jointe à analyser pour ce dossier.
          </AiMessage>
        </>
      )}

      {sources.length > 0 && (
        <>
          <AiSectionTitle>Sources officielles à consulter</AiSectionTitle>
          <AiSourceList>
            {sources.map((s) => (
              <AiSourceItem key={s.nom || s.url}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.nom}</a>
                ) : (
                  <strong style={{ fontSize: '0.84rem' }}>{s.nom}</strong>
                )}
                {s.usage && <p>{s.usage}</p>}
              </AiSourceItem>
            ))}
          </AiSourceList>
        </>
      )}
    </AiReportCard>
  );
}

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
          {' · '}{formatDate(log.created_at || log.createdAt)}
          {log.details?.nom_original && ` · ${log.details.nom_original}`}
        </li>
      ))}
    </Timeline>
  );
}

export default function AdminInscriptionsPage() {
  const { data: inscriptions, isLoading, error, refetch, isFetching } = useInscriptionsEnAttente();
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
        subtitle={`Dossiers professionnels en attente${isFetching ? ' · actualisation…' : ''} — rafraîchissement auto toutes les 15 s.`}
      >
        <div style={{ marginTop: 12 }}>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            Actualiser
          </Button>
        </div>
      </PageHeader>

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
                {(ins.alerte_fraude || ins.donnees?.reincription || (ins.historique_tentatives || []).length > 0) && (
                  <div style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    color: '#9A3412',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                  }}
                  >
                    <strong>Surveillance fraude / réinscription</strong>
                    <div style={{ marginTop: 4 }}>
                      Cet email a déjà été utilisé pour une inscription ou un compte archivé
                      {(ins.historique_tentatives || []).length
                        ? ` (${ins.historique_tentatives.length} tentative(s) passée(s))`
                        : ''}
                      .
                    </div>
                    {(ins.historique_tentatives || []).slice(0, 3).map((h) => (
                      <div key={h.id || `${h.statut}-${h.created_at}`} style={{ marginTop: 4, opacity: 0.9 }}>
                        • {h.type_profil || 'pro'} — {h.statut}
                        {h.motif_rejet ? ` — motif : ${h.motif_rejet}` : ''}
                        {h.created_at ? ` — ${formatDate(h.created_at)}` : ''}
                      </div>
                    ))}
                    <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#C2410C' }}>
                      Voir aussi le Journal de contrôle (réinscription / compte supprimé).
                    </div>
                  </div>
                )}
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

            {(aiReports[ins.id] || ins.donnees?.ai_verification) && (
              <AiVerificationReport report={aiReports[ins.id] || ins.donnees?.ai_verification} />
            )}

            <ExpandBtn type="button" onClick={() => setExpanded(isOpen ? null : ins.id)}>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isOpen ? 'Masquer le dossier' : `Voir le dossier (${ins.documents?.length || 0} document${(ins.documents?.length || 0) > 1 ? 's' : ''})`}
            </ExpandBtn>

            {isOpen && (
              <>
                <AdminDocumentPanel documents={ins.documents} />
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
