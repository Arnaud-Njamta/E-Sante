/**
 * Prépare un fichier pour upload mobile (iPhone/Android) :
 * - PDF : inchangé (contrôle taille)
 * - Images : recompressées en JPEG (évite HEIC / fichiers caméra trop lourds)
 */

const MAX_BYTES = 9 * 1024 * 1024;
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

const isPdf = (file) => {
  const name = (file?.name || '').toLowerCase();
  return file?.type === 'application/pdf' || name.endsWith('.pdf');
};

const isLikelyHeic = (file) => {
  const name = (file?.name || '').toLowerCase();
  const type = (file?.type || '').toLowerCase();
  return type.includes('heic') || type.includes('heif')
    || name.endsWith('.heic') || name.endsWith('.heif');
};

const loadImageElement = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    resolve(img);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('IMAGE_LOAD_FAILED'));
  };
  img.src = url;
});

const canvasToJpegFile = (source, baseName) => new Promise((resolve, reject) => {
  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;
  if (!w || !h) {
    reject(new Error('IMAGE_INVALID'));
    return;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(source, 0, 0, cw, ch);
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        reject(new Error('JPEG_ENCODE_FAILED'));
        return;
      }
      const safe = String(baseName || 'document').replace(/\.[^.]+$/, '') || 'document';
      resolve(new File([blob], `${safe}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }));
    },
    'image/jpeg',
    JPEG_QUALITY,
  );
});

/**
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function prepareMobileUploadFile(file) {
  if (!file) return null;

  if (isPdf(file)) {
    if (file.size > MAX_BYTES) {
      const err = new Error('PDF trop volumineux (max 9 Mo). Compressez-le ou prenez une photo.');
      err.code = 'FILE_TOO_LARGE';
      throw err;
    }
    return file;
  }

  let bitmap = null;
  try {
    if (typeof createImageBitmap === 'function') {
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        bitmap = null;
      }
    }

    if (bitmap) {
      const out = await canvasToJpegFile(bitmap, file.name);
      if (out.size > MAX_BYTES) {
        const err = new Error('Image encore trop lourde après compression. Recadrez ou baissez la qualité.');
        err.code = 'FILE_TOO_LARGE';
        throw err;
      }
      return out;
    }

    const img = await loadImageElement(file);
    const out = await canvasToJpegFile(img, file.name);
    if (out.size > MAX_BYTES) {
      const err = new Error('Image encore trop lourde après compression. Recadrez ou baissez la qualité.');
      err.code = 'FILE_TOO_LARGE';
      throw err;
    }
    return out;
  } catch (err) {
    if (err?.code === 'FILE_TOO_LARGE') throw err;
    if (isLikelyHeic(file)) {
      // Safari peut envoyer le HEIC tel quel — le backend l'accepte aussi
      if (file.size <= MAX_BYTES) return file;
      const heicErr = new Error(
        'Photo iPhone (HEIC) trop lourde. Partagez-la en JPG depuis Photos, ou photographiez depuis le formulaire.',
      );
      heicErr.code = 'HEIC_UNSUPPORTED';
      throw heicErr;
    }
    const type = (file.type || '').toLowerCase();
    const okType = type.includes('jpeg') || type.includes('jpg') || type.includes('png') || type.includes('webp');
    if (okType && file.size <= MAX_BYTES) return file;
    const fallbackErr = new Error(
      'Format photo non supporté sur mobile. Utilisez JPG, PNG ou PDF (max 9 Mo).',
    );
    fallbackErr.code = 'UNSUPPORTED';
    throw fallbackErr;
  } finally {
    bitmap?.close?.();
  }
}

export const MOBILE_FILE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf';
