import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { usePaiementStatut } from '../hooks/usePaiement';

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const transactionId = params.get('transaction');
  const { data, isLoading, isError } = usePaiementStatut(transactionId, !!transactionId);

  useEffect(() => {
    if (data?.statut_paiement === 'paye') {
      const t = setTimeout(() => navigate('/rendez-vous'), 4000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [data, navigate]);

  if (!transactionId) {
    return (
      <Card style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
        <XCircle size={48} color="#EF4444" />
        <h2>Retour paiement invalide</h2>
        <Button onClick={() => navigate('/')} style={{ marginTop: 16 }}>Accueil</Button>
      </Card>
    );
  }

  const paye = data?.statut_paiement === 'paye';

  return (
    <Card style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
      {isLoading && <><Loader size={40} className="spin" /><p>Vérification du paiement...</p></>}
      {!isLoading && paye && (
        <>
          <CheckCircle size={48} color="#22C55E" />
          <h2>Paiement réussi</h2>
          <p style={{ color: '#64748B' }}>
            {Number(data.montant_brut_fcfa).toLocaleString('fr-FR')} FCFA — réf. {data.reference_paiement}
          </p>
          <Button onClick={() => navigate('/rendez-vous')} style={{ marginTop: 16 }}>Voir mes rendez-vous</Button>
        </>
      )}
      {!isLoading && !paye && !isError && (
        <>
          <Loader size={40} />
          <h2>Paiement en cours</h2>
          <p style={{ color: '#64748B' }}>Validez sur votre téléphone si demandé.</p>
        </>
      )}
      {isError && (
        <>
          <XCircle size={48} color="#EF4444" />
          <h2>Erreur</h2>
          <Button onClick={() => navigate('/rendez-vous')} style={{ marginTop: 16 }}>Retour</Button>
        </>
      )}
    </Card>
  );
}
