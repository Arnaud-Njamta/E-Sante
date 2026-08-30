import React, { useState } from 'react';
import { Shield, Check, X, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useInscriptionsEnAttente, useValiderInscription, useRejeterInscription } from '../hooks/useInscription';
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

export default function AdminInscriptionsPage() {
  const { data: inscriptions, isLoading, error, refetch } = useInscriptionsEnAttente();
  const valider = useValiderInscription();
  const rejeter = useRejeterInscription();
  const [motif, setMotif] = useState('');
  const [selected, setSelected] = useState(null);

  const handleValider = async (id) => {
    try {
      await valider.mutateAsync(id);
      toast.success('Inscription validée — compte créé');
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleRejeter = async (id) => {
    if (!motif.trim()) { toast.error('Indiquez un motif de rejet'); return; }
    try {
      await rejeter.mutateAsync({ id, motif_rejet: motif });
      toast.success('Inscription rejetée');
      setSelected(null);
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
      <h1 style={{ margin: '0 0 8px' }}><Shield size={24} style={{ verticalAlign: 'middle' }} /> Validation MINSANTE</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>
        Dossiers professionnels en attente de validation — conformité CSU Cameroun
      </p>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          Aucune demande en attente pour le moment.
        </Card>
      ) : list.map((ins) => (
        <Card key={ins.id} style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#0D9488' }}>
                {TYPE_LABELS[ins.type_profil] || ins.type_profil}
              </span>
              <h3 style={{ margin: '4px 0' }}>
                {ins.prenom ? `${ins.prenom} ${ins.nom}` : ins.nom_structure || ins.nom}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                {ins.email} — {ins.ville}{ins.region ? `, ${ins.region}` : ''}
              </p>
              {ins.numero_ordre && <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>N° ordre : {ins.numero_ordre}</p>}
              {ins.numero_agrement && <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Agrément : {ins.numero_agrement}</p>}
              {ins.donnees?.paiement && (
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#0F766E' }}>
                  💳 {OPERATEUR_LABELS[ins.donnees.paiement.operateur] || ins.donnees.paiement.operateur}
                  {' — '}{ins.donnees.paiement.numero}
                  {' ('}{ins.donnees.paiement.titulaire}{')'}
                  {ins.donnees.paiement.numero_marchand && ` · Marchand: ${ins.donnees.paiement.numero_marchand}`}
                </p>
              )}
              <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Statut : {ins.statut}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Button size="sm" onClick={() => handleValider(ins.id)} disabled={valider.isPending}>
                <Check size={14} /> Valider
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSelected(selected === ins.id ? null : ins.id)}>
                <X size={14} /> Rejeter
              </Button>
            </div>
          </div>
          {ins.documents?.length > 0 && (
            <div style={{ marginTop: 12, fontSize: '0.8rem' }}>
              <FileText size={14} style={{ verticalAlign: 'middle' }} /> {ins.documents.length} document(s) joint(s)
            </div>
          )}
          {selected === ins.id && (
            <div style={{ marginTop: 12 }}>
              <textarea
                placeholder="Motif de rejet (obligatoire)"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 8 }}
              />
              <Button size="sm" variant="secondary" onClick={() => handleRejeter(ins.id)}>Confirmer le rejet</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
