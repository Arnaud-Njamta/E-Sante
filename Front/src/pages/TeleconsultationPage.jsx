import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, ExternalLink, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useRendezVousById } from '../hooks/useRendezVous';
import { useAuth } from '../context/AuthContext';

const Wrap = styled.div` max-width: 1100px; margin: 0 auto; `;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 70vh;
  min-height: 480px;
  border: none;
  border-radius: 12px;
  background: #0F172A;
`;

const AlertBox = styled.div`
  padding: 24px;
  border-radius: 12px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  color: #92400E;
  margin-bottom: 20px;

  h3 { margin: 0 0 8px; display: flex; align-items: center; gap: 8px; font-size: 1rem; }
  p { margin: 0 0 12px; font-size: 0.9rem; line-height: 1.5; }
`;

export default function TeleconsultationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rdv, isLoading, error, refetch } = useRendezVousById(id);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Consultation introuvable" onRetry={refetch} />;

  const canJoin = rdv.statut === 'confirme' && rdv.type_consultation === 'teleconsultation' && rdv.lien_video;
  const isSecure = typeof window !== 'undefined' && window.isSecureContext;
  const displayName = encodeURIComponent(user?.prenom ? `${user.prenom} ${user.nom || ''}` : 'DjamSanté');
  const jitsiUrl = rdv.lien_video
    ? `${rdv.lien_video}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&userInfo.displayName=${displayName}`
    : null;

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
        <AlertBox>
          <h3><ShieldAlert size={18} /> Connexion sécurisée requise (HTTPS)</h3>
          <p>
            La caméra et le micro nécessitent HTTPS. Votre site est en HTTP —
            WebRTC est bloqué par le navigateur (message « WebRTC is not available »).
          </p>
          <p>
            <strong>Solution :</strong> activer HTTPS sur le serveur (Let&apos;s Encrypt / Certbot),
            ou ouvrir la salle Jitsi directement :
          </p>
          <Button onClick={() => window.open(rdv.lien_video, '_blank', 'noopener,noreferrer')}>
            <ExternalLink size={16} /> Ouvrir la visio dans un nouvel onglet
          </Button>
        </AlertBox>
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
              onClick={() => window.open(rdv.lien_video, '_blank')}
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
