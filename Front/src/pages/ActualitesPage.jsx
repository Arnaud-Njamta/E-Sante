import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Newspaper, Trophy, Send, Image as ImageIcon,
  ArrowLeft, Plus, Sparkles, Calendar,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import {
  usePublications, useToggleLike, useAddComment, usePublicationComments, useCreerPublication,
} from '../hooks/usePublications';
import { useAuth } from '../context/AuthContext';
import { getHomeRoute } from '../config/branding';
import { CAMEROON_COLORS } from '../config/cameroonHealth';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);

  &:hover {
    border-color: ${CAMEROON_COLORS.green};
    color: ${CAMEROON_COLORS.greenDark};
    background: #F0FDF9;
  }
`;

const Hero = styled.div`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  padding: 32px 28px;
  margin-bottom: 28px;
  background: linear-gradient(135deg, ${CAMEROON_COLORS.green} 0%, ${CAMEROON_COLORS.greenDark} 55%, #0a3d32 100%);
  color: white;

  &::after {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(252, 209, 22, 0.12);
  }

  h1 {
    margin: 0 0 8px;
    font-size: 1.65rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    opacity: 0.92;
    line-height: 1.55;
    max-width: 560px;
    position: relative;
    z-index: 1;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ $active }) => ($active ? CAMEROON_COLORS.green : '#E2E8F0')};
  background: ${({ $active }) => ($active ? CAMEROON_COLORS.green : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#475569')};
  transition: all 0.15s;

  &:hover {
    border-color: ${CAMEROON_COLORS.green};
    color: ${({ $active }) => ($active ? 'white' : CAMEROON_COLORS.greenDark)};
  }
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const PostCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  border: 1px solid #E2E8F0;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 122, 94, 0.1);
  }
`;

const PostImage = styled.div`
  height: 200px;
  background: ${({ $url }) => ($url
    ? `url(${$url}) center/cover`
    : `linear-gradient(145deg, ${CAMEROON_COLORS.green}22, ${CAMEROON_COLORS.yellow}33)`)};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.15) 100%);
  }
`;

const PostBody = styled.div`
  padding: 18px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const TypeBadge = styled.span`
  font-size: 0.68rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: ${({ $type }) => ($type === 'realisation' ? '#FEF3C7' : '#D1FAE5')};
  color: ${({ $type }) => ($type === 'realisation' ? '#92400E' : CAMEROON_COLORS.greenDark)};
`;

const AuteurBadge = styled.span`
  font-size: 0.75rem;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 24px; height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${CAMEROON_COLORS.green}, ${CAMEROON_COLORS.greenDark});
    flex-shrink: 0;
  }
`;

const PostTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.35;
`;

const PostContent = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: #64748B;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostFooter = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #F1F5F9;
  align-items: center;
`;

const LikeBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $liked }) => ($liked ? '#EF4444' : '#64748B')};
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover { background: #FEF2F2; }
`;

const CommentBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $open }) => ($open ? CAMEROON_COLORS.greenDark : '#64748B')};
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover { background: #F0FDF9; }
`;

const CommentsPanel = styled.div`
  border-top: 1px solid #F1F5F9;
  padding: 14px 18px 16px;
  background: #FAFBFC;
`;

const CommentItem = styled.div`
  padding: 10px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid #F1F5F9;

  &:last-of-type { border-bottom: none; }

  strong { color: ${CAMEROON_COLORS.greenDark}; display: block; margin-bottom: 2px; }
  p { margin: 0; color: #475569; line-height: 1.5; }
  time { font-size: 0.72rem; color: #94A3B8; }
`;

const PublishCard = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  border: 2px dashed ${CAMEROON_COLORS.green}40;
  background: #F0FDF9;
`;

function CommentSection({ publicationId, open, onToggle }) {
  const [text, setText] = useState('');
  const { data: comments, isLoading } = usePublicationComments(open ? publicationId : null);
  const addComment = useAddComment();
  const { isAuthenticated } = useAuth();

  const submit = async () => {
    if (!text.trim()) return;
    try {
      await addComment.mutateAsync({ id: publicationId, contenu: text });
      setText('');
      toast.success('Commentaire publié');
    } catch {
      toast.error('Connectez-vous pour commenter');
    }
  };

  if (!open) return null;

  return (
    <CommentsPanel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: CAMEROON_COLORS.greenDark }}>
          Commentaires {comments?.length ? `(${comments.length})` : ''}
        </span>
        <button type="button" onClick={onToggle} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.78rem' }}>
          Masquer
        </button>
      </div>

      {isLoading && <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Chargement…</p>}

      {!isLoading && (!comments || comments.length === 0) && (
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 10px' }}>Aucun commentaire pour l&apos;instant. Soyez le premier !</p>
      )}

      {(comments || []).map((c) => {
        const when = c.created_at || c.createdAt;
        return (
          <CommentItem key={c.id}>
            <strong>{c.auteur_nom || 'Utilisateur'}</strong>
            <p>{c.contenu}</p>
            {when && (
              <time>{new Date(when).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
            )}
          </CommentItem>
        );
      })}

      {isAuthenticated ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrire un commentaire…"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '0.85rem' }}
          />
          <Button size="sm" onClick={submit} disabled={addComment.isPending}>
            <Send size={14} />
          </Button>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 10 }}>
          <a href="/login" style={{ color: CAMEROON_COLORS.green, fontWeight: 600 }}>Connectez-vous</a> pour commenter.
        </p>
      )}
    </CommentsPanel>
  );
}

function PostItem({ post }) {
  const toggleLike = useToggleLike();
  const [liked, setLiked] = useState(post.user_a_like);
  const [likes, setLikes] = useState(post.likes_count);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const handleLike = async () => {
    try {
      const res = await toggleLike.mutateAsync(post.id);
      setLiked(res.liked);
      setLikes(res.likes_count);
    } catch {
      toast.error('Connectez-vous pour aimer');
    }
  };

  const imgUrl = post.image_url ? `${API_BASE}${post.image_url}` : null;
  const dateStr = post.created_at || post.createdAt
    ? new Date(post.created_at || post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <PostCard>
      <PostImage $url={imgUrl} />
      <PostBody>
        <MetaRow>
          <TypeBadge $type={post.type}>
            {post.type === 'realisation' ? <><Trophy size={10} style={{ marginRight: 4 }} />Réalisation</> : 'Actualité'}
          </TypeBadge>
          <AuteurBadge>{post.auteur_nom}</AuteurBadge>
          {dateStr && (
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {dateStr}
            </span>
          )}
        </MetaRow>
        <PostTitle>{post.titre}</PostTitle>
        <PostContent>{post.contenu}</PostContent>
        <PostFooter>
          <LikeBtn type="button" $liked={liked} onClick={handleLike}>
            <Heart size={18} fill={liked ? '#EF4444' : 'none'} /> {likes}
          </LikeBtn>
          <CommentBtn type="button" $open={commentsOpen} onClick={() => setCommentsOpen((v) => !v)}>
            <MessageCircle size={18} /> {post.comments_count ?? 0}
            <span style={{ fontWeight: 500, fontSize: '0.78rem' }}>
              {commentsOpen ? '▲' : '▼'}
            </span>
          </CommentBtn>
        </PostFooter>
      </PostBody>
      <CommentSection publicationId={post.id} open={commentsOpen} onToggle={() => setCommentsOpen(false)} />
    </PostCard>
  );
}

export default function ActualitesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, isMedecin, isPharmacie, isHopital, isClinique } = useAuth();
  const [filtre, setFiltre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = usePublications({ type: filtre || undefined });
  const creer = useCreerPublication();
  const [form, setForm] = useState({ type: 'actualite', titre: '', contenu: '', mis_en_avant: false });
  const [image, setImage] = useState(null);

  const canPublish = isMedecin || isPharmacie || isHopital || isClinique;
  const homeRoute = isAuthenticated ? getHomeRoute(role) : '/login';
  const backLabel = isAuthenticated ? 'Retour à mon espace' : 'Retour à la connexion';

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({ payload: form, image });
      toast.success('Publication envoyée !');
      setShowForm(false);
      setForm({ type: 'actualite', titre: '', contenu: '', mis_en_avant: false });
      setImage(null);
    } catch {
      toast.error('Erreur publication');
    }
  };

  if (isLoading) return <Spinner text="Chargement du fil actualités…" />;

  return (
    <Page>
      <TopBar>
        <BackBtn type="button" onClick={() => navigate(homeRoute)}>
          <ArrowLeft size={18} />
          {backLabel}
        </BackBtn>
        {canPublish && (
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? undefined : Plus}>
            {showForm ? 'Annuler' : 'Publier'}
          </Button>
        )}
      </TopBar>

      <Hero>
        <h1><Newspaper size={26} /> Actualités & Réalisations</h1>
        <p>
          Le fil santé du Cameroun — initiatives des médecins, hôpitaux, cliniques et pharmacies.
          Partagez vos réussites et informez la communauté.
        </p>
      </Hero>

      <FilterRow>
        {[{ v: '', l: 'Tout', icon: Sparkles }, { v: 'actualite', l: 'Actualités', icon: Newspaper }, { v: 'realisation', l: 'Réalisations', icon: Trophy }].map((f) => (
          <FilterChip key={f.v} type="button" $active={filtre === f.v} onClick={() => setFiltre(f.v)}>
            <f.icon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {f.l}
          </FilterChip>
        ))}
      </FilterRow>

      {showForm && (
        <PublishCard>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: CAMEROON_COLORS.greenDark }}>Nouvelle publication</h3>
          <form onSubmit={handlePublish}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" checked={form.type === 'actualite'} onChange={() => setForm({ ...form, type: 'actualite' })} /> Actualité
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" checked={form.type === 'realisation'} onChange={() => setForm({ ...form, type: 'realisation' })} /> Réalisation
              </label>
            </div>
            <Input label="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            <textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={4} placeholder="Partagez votre actualité ou réalisation…" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginTop: 12, fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }} required />
            <label style={{ display: 'block', marginTop: 12, fontSize: '0.85rem', color: '#64748B' }}>
              <ImageIcon size={14} style={{ verticalAlign: 'middle' }} /> Photo (optionnel)
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'block', marginTop: 6 }} />
            </label>
            <Button type="submit" style={{ marginTop: 16 }} disabled={creer.isPending}>
              {creer.isPending ? 'Publication…' : 'Publier sur le fil'}
            </Button>
          </form>
        </PublishCard>
      )}

      {(data?.publications || []).length > 0 ? (
        <FeedGrid>
          {data.publications.map((p) => <PostItem key={p.id} post={p} />)}
        </FeedGrid>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="Aucune publication"
          description="Le fil est encore vide. Revenez bientôt ou publiez la première actualité."
        />
      )}
    </Page>
  );
}
