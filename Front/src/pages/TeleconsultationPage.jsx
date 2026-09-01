import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, ExternalLink, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useRendezVousById } from '../hooks/useRendezVous';
import { useAuth } from '../context/AuthContext';
import {
  buildJitsiUrl, isTeleconsultSecure, openTeleconsultation,
} from '../utils/teleconsultation';

const Wrap = styled.div` max-width: 1100px; margin: 0 auto; `;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 70vh;
  min-height: 480px;
  border: none;
  border-radius: 12px;
  background: #0F172A;
`;

const JoinCard = styled.div`
  padding: 40px 32px;
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(145deg, #ECFDF5, #D1FAE5);
  border: 1px solid #6EE7B7;
  max-width: 480px;
  margin: 0 auto;

  h3 {
    margin: 16px 0 8px;
    font-size: 1.25rem;
    color: #065F46;
  }

  p {
    margin: 0 0 24px;
    font-size: 0.9rem;
    color: #047857;
    line-height: 1.5;
  }
`;

const IconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #047857;
  color: white;
`;

export default function TeleconsultationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rdv, isLoading, error, refetch } = useRendezVousById(id);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Consultation introuvable" onRetry={refetch} />;

  const canJoin = rdv.statut === 'confirme' && rdv.type_consultation === 'teleconsultation' && rdv.lien_video;
  const isSecure = isTeleconsultSecure();
  const displayName = user?.prenom ? `${user.prenom} ${user.nom || ''}`.trim() : 'DjamSanté';
  const jitsiUrl = buildJitsiUrl(rdv.lien_video, displayName);

  const handleJoin = () => openTeleconsultation(rdv.lien_video, displayName);

  return (
    <Wrap>
      <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Retour
      </Button>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px' }}>
        <Video size={24} /> Téléconsultation
      </h1>
      <p style={{ color: '#64748B', marginBottom: 20 }}>
        {rdv.date_rdv} à {rdv.heure_debut}
        {rdv.medecin && ` — Dr. ${rdv.medecin.prenom} ${rdv.medecin.nom}`}
      </p>

      {!canJoin ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#F8FAFC', borderRadius: 12, color: '#64748B' }}>
          {rdv.statut === 'en_attente'
            ? 'En attente de confirmation par le médecin. Le lien vidéo sera disponible une fois le RDV confirmé.'
            : 'Cette consultation n\'est pas disponible en visioconférence.'}
        </div>
      ) : !isSecure ? (
        <JoinCard>
          <IconCircle><Video size={32} /></IconCircle>
          <h3>Votre consultation est prête</h3>
          <p>
            Cliquez ci-dessous pour rejoindre la visioconférence.
            La salle s&apos;ouvre dans un nouvel onglet — autorisez la caméra et le micro quand le navigateur le demande.
          </p>
          <Button size="lg" onClick={handleJoin} style={{ width: '100%', maxWidth: 320 }}>
            <ExternalLink size={18} /> Rejoindre la visioconférence
          </Button>
          <p style={{ marginTop: 16, marginBottom: 0, fontSize: '0.75rem', color: '#059669' }}>
            <CheckCircle size={12} style={{ verticalAlign: 'middle' }} /> Fonctionne sans HTTPS via Jitsi Meet
          </p>
        </JoinCard>
      ) : (
        <>
          <VideoFrame
            title="Salle de téléconsultation DjamSanté"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
          />
          <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#94A3B8' }}>
            Problème audio/vidéo ?{' '}
            <button
              type="button"
              onClick={handleJoin}
              style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Ouvrir dans un nouvel onglet
            </button>
          </p>
        </>
      )}
    </Wrap>
  );
}
