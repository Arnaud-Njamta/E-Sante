import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Download, CheckCircle, Clock, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useMesPaiements, getRecuUrl } from '../hooks/usePaiement';
import { getActiveLocale } from '../i18n/syncLanguage';
import { CAMEROON_COLORS } from '../config/cameroonHealth';

export default function PatientPaiementsPage() {
  const { t } = useTranslation();
  const locale = getActiveLocale();
  const { data: paiements, isLoading, error, refetch } = useMesPaiements();

  const typeLabels = {
    consultation: t('paiements.type_consultation'),
    pharmacie: t('paiements.type_pharmacie'),
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message={t('paiements.load_error')} onRetry={refetch} />;

  const list = paiements || [];

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><Wallet size={24} style={{ verticalAlign: 'middle' }} /> {t('paiements.title')}</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>{t('paiements.subtitle')}</p>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <FileText size={40} style={{ marginBottom: 12 }} />
          <p>{t('paiements.empty')}</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((p) => (
            <Card key={p.id} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: CAMEROON_COLORS.green, textTransform: 'uppercase' }}>
                    {typeLabels[p.type] || p.type}
                  </span>
                  <h3 style={{ margin: '4px 0' }}>{p.libelle || t('paiements.default_label')}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                    {p.beneficiaire?.label || t('paiements.provider')}
                    {p.createdAt && ` — ${new Date(p.createdAt).toLocaleDateString(locale)}`}
                  </p>
                  {p.reference_paiement && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>{t('paiements.ref', { ref: p.reference_paiement })}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: CAMEROON_COLORS.greenDark }}>
                    {Number(p.montant_brut_fcfa).toLocaleString(locale)} FCFA
                  </p>
                  {p.statut_paiement === 'paye' ? (
                    <span style={{ fontSize: '0.8rem', color: '#047857' }}><CheckCircle size={12} /> {t('paiements.paid')}</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#B45309' }}><Clock size={12} /> {t('paiements.pending')}</span>
                  )}
                </div>
              </div>
              {p.statut_paiement === 'paye' && (
                <Button
                  size="sm"
                  variant="secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => window.open(getRecuUrl(p.id), '_blank')}
                >
                  <Download size={14} /> {t('paiements.download_receipt')}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
