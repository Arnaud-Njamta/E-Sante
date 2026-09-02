import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Heart, MessageCircle, Send, Trophy, Calendar,
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToggleLike, useAddComment, usePublicationComments } from '../../hooks/usePublications';
import { CAMEROON_COLORS } from '../../config/cameroonHealth';
import { resolveFileUrl } from '../ui/PhotoUploadCard';
import { getActiveLocale } from '../../i18n/syncLanguage';
import { localizePublication } from '../../utils/publicationLocale';

const Post = styled.article`
  max-width: 640px;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 12px;
`;

const AuthorAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary[700]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const AuthorMeta = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 0.92rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-top: 2px;
  }
`;

const TypeBadge = styled.span`
  font-size: 0.62rem;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: ${({ $type }) => ($type === 'realisation' ? 'rgba(252, 209, 22, 0.2)' : 'rgba(11, 61, 48, 0.08)')};
  color: ${({ $type }) => ($type === 'realisation' ? '#92400E' : '#0B3D30')};
  flex-shrink: 0;
`;

const PostImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ $url, theme }) => ($url
    ? `url(${$url}) center/cover`
    : `linear-gradient(145deg, ${theme.colors.background}, ${theme.colors.border})`)};
`;

const PostBody = styled.div`
  padding: 16px 18px 0;
`;

const PostTitle = styled.h1`
  margin: 0 0 12px;
  font-family: ${({ theme }) => theme.typography.fontFamilySerif};
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.35;
`;

const PostContent = styled.div`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  white-space: pre-wrap;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 600;
  font-family: inherit;
  color: ${({ $active, $liked, theme }) => {
    if ($liked) return CAMEROON_COLORS.red;
    if ($active) return theme.colors.deep;
    return theme.colors.textSecondary;
  }};
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const CommentsSection = styled.div`
  padding: 14px 18px 18px;
  background: ${({ theme }) => theme.colors.background};
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
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

const CommentInputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 14px;
  align-items: flex-end;
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

function authorInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function PublicationDetailView({ post }) {
  const { t, i18n } = useTranslation();
  const locale = getActiveLocale();
  const { isAuthenticated } = useAuth();
  const localized = localizePublication(post, i18n.language);
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const { data: comments, isLoading: commentsLoading } = usePublicationComments(post?.id);
  const [liked, setLiked] = useState(post?.user_a_like);
  const [likes, setLikes] = useState(post?.likes_count ?? 0);
  const [commentText, setCommentText] = useState('');

  if (!post) return null;

  const imgUrl = resolveFileUrl(post.image_url, post.fichier_image_id);
  const dateStr = post.created_at || post.createdAt
    ? new Date(post.created_at || post.createdAt).toLocaleDateString(locale, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    : '';

  const handleLike = async () => {
    try {
      const res = await toggleLike.mutateAsync(post.id);
      setLiked(res.liked);
      setLikes(res.likes_count);
    } catch {
      toast.error(t('actualites.like_login'));
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ id: post.id, contenu: commentText });
      setCommentText('');
      toast.success(t('actualites.comment_published'));
    } catch {
      toast.error(t('actualites.comment_login'));
    }
  };

  const commentsCount = comments?.length ?? post.comments_count ?? 0;

  return (
    <Post>
      <PostHeader>
        <AuthorAvatar>{authorInitials(post.auteur_nom)}</AuthorAvatar>
        <AuthorMeta>
          <strong>{post.auteur_nom}</strong>
          {dateStr && (
            <span><Calendar size={12} /> {dateStr}</span>
          )}
        </AuthorMeta>
        <TypeBadge $type={post.type}>
          {post.type === 'realisation' ? <><Trophy size={10} style={{ marginRight: 4 }} />{t('actualites.type_achievement')}</> : t('actualites.type_news')}
        </TypeBadge>
      </PostHeader>

      {imgUrl && <PostImage $url={imgUrl} />}

      <PostBody>
        <PostTitle>{localized.titre}</PostTitle>
        {localized.contenu && <PostContent>{localized.contenu}</PostContent>}
      </PostBody>

      <StatsRow>
        <span>{likes > 0 ? t('actualites.likes_count', { count: likes }) : ''}</span>
        <span>{commentsCount > 0 ? t('actualites.comments_count', { count: commentsCount }) : ''}</span>
      </StatsRow>

      <ActionsRow>
        <ActionBtn type="button" $liked={liked} onClick={handleLike}>
          <Heart size={20} fill={liked ? CAMEROON_COLORS.red : 'none'} />
          {t('actualites.like_action')}
        </ActionBtn>
        <ActionBtn type="button" $active>
          <MessageCircle size={20} />
          {t('actualites.comment_action')}
        </ActionBtn>
      </ActionsRow>

      <CommentsSection>
        <SectionTitle>{t('actualites.comments')}</SectionTitle>

        {commentsLoading && (
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{t('actualites.comments_loading')}</p>
        )}

        {!commentsLoading && (!comments || comments.length === 0) && (
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>{t('actualites.no_comments')}</p>
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
          <CommentInputRow>
            <CommentInput
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('actualites.comment_placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            />
            <Button size="sm" onClick={submitComment} disabled={addComment.isPending}>
              <Send size={14} />
            </Button>
          </CommentInputRow>
        ) : (
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 12 }}>
            <a href="/login" style={{ color: CAMEROON_COLORS.green, fontWeight: 600 }}>{t('actualites.login_link')}</a> {t('actualites.login_to_comment')}
          </p>
        )}
      </CommentsSection>
    </Post>
  );
}
