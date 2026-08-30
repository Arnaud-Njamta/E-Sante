import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Stethoscope, Calendar, Star, MapPin, Shield,
  Activity, ChevronRight, Sparkles, Pill,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useStructureDashboard } from '../hooks/useDashboards';
import { useAuth } from '../context/AuthContext';
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';

const STATUT_COLORS = {
  en_attente: '#F59E0B',
  confirme: '#22C55E',
  annule: '#EF4444',
  termine: '#64748B',
  absent: '#94A3B8',
};

const STATUT_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
  termine: 'Terminé',
  absent: 'Absent',
};

function useBasePath(role) {
  return role === 'hopital' ? '/hopital' : '/clinique';
}

export default function StructureDashboardPage() {
  const { user, role } = useAuth();
  const { data, isLoading } = useStructureDashboard();
  const base = useBasePath(role);

  if (isLoading) return <Spinner />;

  const typeLabel = role === 'hopital' ? 'Hôpital' : 'Clinique';
  const stats = data?.stats || {};
  const profil = data?.profil || user;
  const photoUrl = resolveFileUrl(profil?.image_url, profil?.fichier_photo_id);

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'flex-start' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 16, flexShrink: 0,
          background: photoUrl ? `url(${photoUrl}) center/cover` : 'linear-gradient(135deg,#F97316,#EA580C)',
        }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 4px' }}>{user?.nom}</h1>
          <p style={{ color: '#64748B', margin: 0 }}>
            {typeLabel} — {user?.ville}, {user?.region || 'Cameroun'}
          </p>
          {profil?.numero_agrement && (
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
              Agrément MINSANTE : {profil.numero_agrement}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`${base}/medecins`} style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary"><Users size={16} /> Médecins</Button>
          </Link>
          <Link to={`${base}/services`} style={{ textDecoration: 'none' }}>
            <Button type="button"><Stethoscope size={16} /> Services</Button>
          </Link>
          <Link to={`${base}/dispensaire`} style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary"><Pill size={16} /> Dispensaire</Button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Users, label: 'Médecins', value: stats.nb_medecins ?? 0, color: '#3B82F6' },
          { icon: Stethoscope, label: 'Services', value: stats.nb_services ?? 0, color: '#8B5CF6' },
          { icon: Calendar, label: 'RDV aujourd\'hui', value: stats.rdv_aujourdhui ?? 0, color: '#10B981' },
          { icon: Activity, label: 'RDV en attente', value: stats.rdv_en_attente ?? 0, color: '#F59E0B' },
          { icon: Star, label: 'Note patients', value: Number(stats.note_moyenne ?? 5).toFixed(1), color: '#F97316' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} style={{ padding: 20 }}>
            <Icon size={22} color={color} />
            <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#64748B' }}>{label}</p>
            <strong style={{ fontSize: '1.5rem' }}>{value}</strong>
          </Card>
        ))}
      </div>

      <Card style={{
        padding: 24, marginBottom: 24,
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1px solid #FED7AA',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <Shield size={28} color="#EA580C" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} /> Plateforme alignée MINSANTE — Cameroun
            </h3>
            <p style={{ margin: 0, color: '#7C2D12', fontSize: '0.9rem', lineHeight: 1.6 }}>
              DjamSanté accompagne les établissements dans la Couverture Santé Universelle (CSU) et le Plan National
              Santé Numérique : annuaire public, prise de rendez-vous en ligne, téléconsultation, dossier patient
              numérique et visibilité auprès de millions de bénéficiaires à Yaoundé, Douala et dans les 10 régions.
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}><Users size={18} /> Équipe médicale</h3>
            <Link to={`${base}/medecins`} style={{ fontSize: '0.85rem', color: '#EA580C', textDecoration: 'none' }}>
              Gérer <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          {(data?.medecins || []).length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
              Inscrivez vos praticiens pour qu'ils apparaissent dans l'annuaire et reçoivent des rendez-vous.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.medecins.map((m) => {
                const mPhoto = resolveFileUrl(m.photo_url, m.fichier_photo_id);
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: mPhoto ? `url(${mPhoto}) center/cover` : '#E2E8F0',
                    }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>Dr {m.prenom} {m.nom}</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{m.specialite}</p>
                    </div>
                    {m.tarif_consultation_fcfa && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#059669' }}>
                        {Number(m.tarif_consultation_fcfa).toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Link to={`${base}/medecins`} style={{ textDecoration: 'none', display: 'block', marginTop: 16 }}>
            <Button type="button" variant="secondary" fullWidth><Users size={16} /> Inscrire un médecin</Button>
          </Link>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}><Stethoscope size={18} /> Services & tarifs</h3>
            <Link to={`${base}/services`} style={{ fontSize: '0.85rem', color: '#EA580C', textDecoration: 'none' }}>
              Gérer <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          {(data?.services || []).length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
              Publiez vos consultations, examens et actes avec les tarifs en FCFA pour rassurer les patients.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.services.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{s.nom}</strong>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{s.categorie}</p>
                  </div>
                  <strong style={{ color: '#059669', fontSize: '0.9rem' }}>
                    {s.prix_indicatif ? `${Number(s.prix_indicatif).toLocaleString()} FCFA` : '—'}
                  </strong>
                </div>
              ))}
            </div>
          )}
          <Link to={`${base}/services`} style={{ textDecoration: 'none', display: 'block', marginTop: 16 }}>
            <Button type="button" variant="secondary" fullWidth><Stethoscope size={16} /> Ajouter un service</Button>
          </Link>
        </Card>
      </div>

      <Card style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}><Calendar size={18} /> Rendez-vous récents</h3>
          <Link to={`${base}/rendez-vous`} style={{ fontSize: '0.85rem', color: '#EA580C', textDecoration: 'none' }}>
            Voir tout <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
        {(data?.rdv_recents || []).length === 0 ? (
          <p style={{ color: '#94A3B8' }}>Les rendez-vous pris via la plateforme apparaîtront ici.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '8px 12px' }}>Date</th>
                  <th style={{ padding: '8px 12px' }}>Patient</th>
                  <th style={{ padding: '8px 12px' }}>Médecin</th>
                  <th style={{ padding: '8px 12px' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.rdv_recents.map((rdv) => (
                  <tr key={rdv.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px' }}>{rdv.date_rdv} {rdv.heure_debut}</td>
                    <td style={{ padding: '10px 12px' }}>{rdv.patient?.prenom} {rdv.patient?.nom}</td>
                    <td style={{ padding: '10px 12px' }}>Dr {rdv.medecin?.prenom} {rdv.medecin?.nom}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem',
                        background: `${STATUT_COLORS[rdv.statut] || '#94A3B8'}22`,
                        color: STATUT_COLORS[rdv.statut] || '#64748B',
                      }}>
                        {STATUT_LABELS[rdv.statut] || rdv.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card style={{ padding: 20, marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <MapPin size={20} color="#64748B" />
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
          {user?.adresse || 'Complétez votre adresse'} — {user?.ville}, {user?.region || 'Cameroun'}
        </p>
        <Link to={`${base}/localisation`} style={{ textDecoration: 'none' }}>
          <Button type="button" variant="secondary" size="sm">Localisation</Button>
        </Link>
      </Card>
    </div>
  );
}
