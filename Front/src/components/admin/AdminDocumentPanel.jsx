import React from 'react';
import styled from 'styled-components';
import { ExternalLink, FileText } from 'lucide-react';
import { authenticatedFileUrl } from '../../utils/fileUrl';

const DOC_LABELS = {
  diplome: 'Diplôme',
  carte_ordre: 'Carte ordre des médecins',
  agrement: 'Agrément',
  autorisation: 'Autorisation MINSANTE',
  document: 'Document',
};

const Panel = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h4`
  margin: 0 0 14px;
  font-family: ${({ theme }) => theme.typography.fontFamilySerif};
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
`;

const DocCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const Preview = styled.div`
  height: 140px;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DocBody = styled.div`
  padding: 12px 14px;

  h5 {
    margin: 0 0 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DocLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.deep};
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;

function isImageType(type, url) {
  const t = (type || '').toLowerCase();
  return t.includes('image') || /\.(jpe?g|png|gif|webp)$/i.test(url || '');
}

export default function AdminDocumentPanel({ documents = [] }) {
  if (!documents.length) {
    return (
      <Panel>
        <Title><FileText size={16} /> Documents</Title>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#6B6560' }}>
          Aucun document joint pour cette demande.
        </p>
      </Panel>
    );
  }

  return (
    <Panel>
      <Title><FileText size={16} /> Documents ({documents.length})</Title>
      <Grid>
        {documents.map((doc) => {
          const url = authenticatedFileUrl(doc.fichier_id);
          const label = DOC_LABELS[doc.type] || doc.type?.replace(/_/g, ' ') || 'Document';
          const showImage = isImageType(doc.mime_type, doc.nom_original);

          return (
            <DocCard key={doc.fichier_id || doc.type}>
              <Preview>
                {showImage && url ? (
                  <img src={url} alt={label} />
                ) : (
                  <FileText size={36} strokeWidth={1.25} color="#A8A29E" />
                )}
              </Preview>
              <DocBody>
                <h5>{label}</h5>
                {url && (
                  <DocLink href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                    Ouvrir / Télécharger
                  </DocLink>
                )}
              </DocBody>
            </DocCard>
          );
        })}
      </Grid>
    </Panel>
  );
}
