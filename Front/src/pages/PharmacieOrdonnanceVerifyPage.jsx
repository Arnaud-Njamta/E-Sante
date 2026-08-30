import React, { useState } from 'react';
import { ScanLine, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';

export default function PharmacieOrdonnanceVerifyPage() {
  const [numero, setNumero] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!numero.trim() || !code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await client.get(`${ENDPOINTS.ordonnancesElec.verifier(numero.trim())}`, {
        params: { code: code.trim().toUpperCase() },
      });
      setResult({ ok: true, ord: data.data });
      toast.success('Ordonnance authentique');
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || 'Vérification échouée' });
      toast.error('Ordonnance non trouvée ou code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleDelivrer = async () => {
    if (!result?.ord?.id) return;
    try {
      await client.post(ENDPOINTS.ordonnancesElec.delivrer(result.ord.id));
      toast.success('Ordonnance marquée comme délivrée');
      setResult({ ...result, ord: { ...result.ord, statut: 'delivree' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}><ScanLine size={24} style={{ verticalAlign: 'middle' }} /> Vérifier une ordonnance</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>
        Contrôle MINSANTE — saisissez le numéro et le code de vérification de l'ordonnance électronique
      </p>

      <Card style={{ padding: 24, maxWidth: 480 }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Numéro ordonnance" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ORD-SN-2026-..." required />
          <Input label="Code de vérification" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code à 12 caractères" required />
          <Button type="submit" disabled={loading}>{loading ? 'Vérification…' : 'Vérifier l\'authenticité'}</Button>
        </form>
      </Card>

      {result?.ok && (
        <Card style={{ padding: 24, marginTop: 20, borderLeft: '4px solid #22C55E' }}>
          <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} color="#22C55E" /> Ordonnance valide
          </h3>
          <p><strong>Patient :</strong> {result.ord.patient?.prenom} {result.ord.patient?.nom}</p>
          <p><strong>Médecin :</strong> Dr. {result.ord.medecin?.prenom} {result.ord.medecin?.nom} — {result.ord.medecin?.specialite}</p>
          <p><strong>Diagnostic :</strong> {result.ord.diagnostic}</p>
          <p><strong>Statut :</strong> {result.ord.statut}</p>
          {result.ord.medicaments?.length > 0 && (
            <ul style={{ margin: '8px 0', paddingLeft: 18 }}>
              {result.ord.medicaments.map((m, i) => (
                <li key={i}>{m.nom} — {m.posologie}</li>
              ))}
            </ul>
          )}
          {result.ord.statut === 'signee' && (
            <Button onClick={handleDelivrer} style={{ marginTop: 12 }}>Marquer comme délivrée</Button>
          )}
          {result.ord.statut === 'delivree' && (
            <p style={{ color: '#059669', marginTop: 12 }}>✓ Déjà délivrée</p>
          )}
        </Card>
      )}

      {result && !result.ok && (
        <Card style={{ padding: 24, marginTop: 20, borderLeft: '4px solid #EF4444' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626' }}>
            <XCircle size={20} /> {result.message}
          </h3>
        </Card>
      )}
    </div>
  );
}
