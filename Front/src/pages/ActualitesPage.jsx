import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
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
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';
import { getActiveLocale } from '../i18n/syncLanguage';

const Page = styled.div`
  max-width: 1080px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

const Hero = styled.header`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  .kicker {
    margin: 0 0 10px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  h1 {
    margin: 0 0 10px;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: clamp(1.85rem, 4vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.12;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    max-width: 580px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 9px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.textSecondary)};
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.colors.ink};
    color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.ink)};
  }
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const PostCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const PostImage = styled.div`
  height: 200px;
  background: ${({ $url, theme }) => ($url
    ? `url(${$url}) center/cover`
    : `linear-gradient(145deg, ${theme.colors.background}, ${theme.colors.border})`)};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(28, 25, 23, 0.18) 100%);
  }
`;

const PostBody = styled.div`
  padding: 20px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const TypeBadge = styled.span`
  font-size: 0.65rem;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: ${({ $type, theme }) => ($type === 'realisation'
    ? 'rgba(252, 209, 22, 0.2)'
    : 'rgba(11, 61, 48, 0.08)')};
  color: ${({ $type, theme }) => ($type === 'realisation' ? '#92400E' : theme.colors.deep)};
`;

const AuteurBadge = styled.span`
  font-size: 0.76rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.ink};
    flex-shrink: 0;
  }
`;

const PostTitle = styled.h3`
  margin: 0 0 10px;
  font-family: ${({ theme }) => theme.typography.fontFamilySerif};
  font-size: 1.15rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const PostContent = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostFooter = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
`;

const LikeBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  color: ${({ $liked, theme }) => ($liked ? CAMEROON_COLORS.red : theme.colors.textMuted)};
  padding: 4px 0;
  transition: color 0.15s;
  font-family: inherit;

  &:hover { color: ${CAMEROON_COLORS.red}; }
`;

const CommentBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  color: ${({ $open, theme }) => ($open ? theme.colors.deep : theme.colors.textMuted)};
  padding: 4px 0;
  transition: color 0.15s;
  font-family: inherit;

  &:hover { color: ${({ theme }) => theme.colors.ink}; }
`;

const CommentsPanel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px 20px 18px;
  background: ${({ theme }) => theme.colors.background};
`;

const CommentItem = styled.div`
  padding: 10px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type { border-bottom: none; }

  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    display: block;
    margin-bottom: 3px;
  }
  p { margin: 0; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.55; }
  time { font-size: 0.72rem; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const PublishCard = styled(Card)`
  padding: 28px;
  margin-bottom: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  h3 {
    margin: 0 0 18px;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: 1.25rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 10px 0 8px;
  border: none;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.border};
  font-size: 0.86rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  outline: none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.deep}; }
`;

const PublishTextarea = styled.textarea`
  width: 100%;
  padding: 12px 0;
  margin-top: 12px;
  border: none;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.border};
  font-size: 0.88rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  resize: vertical;
  outline: none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.deep}; }
`;

function CommentSection({ publicationId, open, onToggle }) {
  const { t } = useTranslation();
  const locale = getActiveLocale();
  const [text, setText] = useState('');
  const { data: comments, isLoading } = usePublicationComments(open ? publicationId : null);
  const addComment = useAddComment();
  const { isAuthenticated } = useAuth();

  const submit = async () => {
    if (!text.trim()) return;
    try {
      await addComment.mutateAsync({ id: publicationId, contenu: text });
      setText('');
      toast.success(t('actualites.comment_published'));
    } catch {
      toast.error(t('actualites.comment_login'));
    }
  };

  if (!open) return null;

  return (
    <CommentsPanel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'inherit' }}>
          {t('actualites.comments')} {comments?.length ? `(${comments.length})` : ''}
        </span>
        <button type="button" onClick={onToggle} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.78rem' }}>
          {t('actualites.hide')}
        </button>
      </div>

      {isLoading && <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{t('actualites.comments_loading')}</p>}

      {!isLoading && (!comments || comments.length === 0) && (
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 10px' }}>{t('actualites.no_comments')}</p>
      )}

      {(comments || []).map((c) => {
        const when = c.created_at || c.createdAt;
        return (
          <CommentItem key={c.id}>
            <strong>{c.auteur_nom || t('common.user')}</strong>
            <p>{c.contenu}</p>
            {when && (
              <time>{new Date(when).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
            )}
          </CommentItem>
        );
      })}

      {isAuthenticated ? (
        <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'flex-end' }}>
          <CommentInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('actualites.comment_placeholder')}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button size="sm" onClick={submit} disabled={addComment.isPending}>
            <Send size={14} />
          </Button>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 10 }}>
          <a href="/login" style={{ color: CAMEROON_COLORS.green, fontWeight: 600 }}>{t('actualites.login_link')}</a> {t('actualites.login_to_comment')}
        </p>
      )}
    </CommentsPanel>
  );
}

function PostItem({ post }) {
  const { t } = useTranslation();
  const locale = getActiveLocale();
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
      toast.error(t('actualites.like_login'));
    }
  };

  const imgUrl = resolveFileUrl(post.image_url, post.fichier_image_id);
  const dateStr = post.created_at || post.createdAt
    ? new Date(post.created_at || post.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <PostCard>
      <PostImage $url={imgUrl} />
      <PostBody>
        <MetaRow>
          <TypeBadge $type={post.type}>
            {post.type === 'realisation' ? <><Trophy size={10} style={{ marginRight: 4 }} />{t('actualites.type_achievement')}</> : t('actualites.type_news')}
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
  const { t } = useTranslation();
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
  const backLabel = isAuthenticated ? t('actualites.back_home') : t('actualites.back_login');

  const filters = [
    { v: '', l: t('actualites.filter_all'), icon: Sparkles },
    { v: 'actualite', l: t('actualites.filter_news'), icon: Newspaper },
    { v: 'realisation', l: t('actualites.filter_achievements'), icon: Trophy },
  ];

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({ payload: form, image });
      toast.success(t('actualites.publish_success'));
      setShowForm(false);
      setForm({ type: 'actualite', titre: '', contenu: '', mis_en_avant: false });
      setImage(null);
    } catch {
      toast.error(t('actualites.publish_error'));
    }
  };

  if (isLoading) return <Spinner text={t('actualites.loading')} />;

  return (
    <Page>
      <TopBar>
        <BackBtn type="button" onClick={() => navigate(homeRoute)}>
          <ArrowLeft size={18} />
          {backLabel}
        </BackBtn>
        {canPublish && (
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? undefined : Plus}>
            {showForm ? t('common.cancel') : t('actualites.publish')}
          </Button>
        )}
      </TopBar>

      <Hero>
        <p className="kicker">{t('actualites.kicker')}</p>
        <h1><Newspaper size={28} strokeWidth={1.5} /> {t('actualites.title')}</h1>
        <p>{t('actualites.subtitle')}</p>
      </Hero>

      <FilterRow>
        {filters.map((f) => (
          <FilterChip key={f.v} type="button" $active={filtre === f.v} onClick={() => setFiltre(f.v)}>
            <f.icon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {f.l}
          </FilterChip>
        ))}
      </FilterRow>

      {showForm && (
        <PublishCard>
          <h3>{t('actualites.new_publication')}</h3>
          <form onSubmit={handlePublish}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" checked={form.type === 'actualite'} onChange={() => setForm({ ...form, type: 'actualite' })} /> {t('actualites.type_news')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" checked={form.type === 'realisation'} onChange={() => setForm({ ...form, type: 'realisation' })} /> {t('actualites.type_achievement')}
              </label>
            </div>
            <Input label={t('actualites.form_title')} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            <PublishTextarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={4} placeholder={t('actualites.form_content_placeholder')} required />
            <label style={{ display: 'block', marginTop: 12, fontSize: '0.85rem', color: '#64748B' }}>
              <ImageIcon size={14} style={{ verticalAlign: 'middle' }} /> {t('actualites.photo_optional')}
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'block', marginTop: 6 }} />
            </label>
            <Button type="submit" style={{ marginTop: 16 }} disabled={creer.isPending}>
              {creer.isPending ? t('actualites.publishing') : t('actualites.publish_feed')}
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
          title={t('actualites.empty_title')}
          description={t('actualites.empty_desc')}
        />
      )}
    </Page>
  );
}
