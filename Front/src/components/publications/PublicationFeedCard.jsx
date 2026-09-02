import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Trophy, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import { resolveFileUrl } from '../ui/PhotoUploadCard';
import { getActiveLocale } from '../../i18n/syncLanguage';
import { localizePublication } from '../../utils/publicationLocale';

const PostCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
  width: 100%;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const PostImage = styled.div`
  height: 180px;
  background: ${({ $url, theme }) => ($url
    ? `url(${$url}) center/cover`
    : `linear-gradient(145deg, ${theme.colors.background}, ${theme.colors.border})`)};
`;

const PostBody = styled.div`
  padding: 18px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
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
  background: ${({ $type }) => ($type === 'realisation' ? 'rgba(252, 209, 22, 0.2)' : 'rgba(11, 61, 48, 0.08)')};
  color: ${({ $type }) => ($type === 'realisation' ? '#92400E' : '#0B3D30')};
`;

const AuteurBadge = styled.span`
  font-size: 0.76rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PostTitle = styled.h3`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.typography.fontFamilySerif};
  font-size: 1.05rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostExcerpt = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostFooter = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Stat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const ReadMore = styled.span`
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[600]};
`;

export default function PublicationFeedCard({ post, onClick }) {
  const { t, i18n } = useTranslation();
  const locale = getActiveLocale();
  const localized = localizePublication(post, i18n.language);
  const imgUrl = resolveFileUrl(post.image_url, post.fichier_image_id);
  const dateStr = post.created_at || post.createdAt
    ? new Date(post.created_at || post.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <PostCard as="button" type="button" onClick={onClick}>
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
        <PostTitle>{localized.titre}</PostTitle>
        <PostExcerpt>{localized.contenu}</PostExcerpt>
        <PostFooter>
          <Stat><Heart size={16} /> {post.likes_count ?? 0}</Stat>
          <Stat><MessageCircle size={16} /> {post.comments_count ?? 0}</Stat>
          <ReadMore>{t('actualites.read_more')}</ReadMore>
        </PostFooter>
      </PostBody>
    </PostCard>
  );
}
