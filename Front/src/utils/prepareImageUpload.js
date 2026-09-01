const MAX_BYTES = 10 * 1024 * 1024;
const RESIZE_THRESHOLD_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 2048;

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/x-png',
  'image/pjpeg',
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function getExtension(name = '') {
  const match = name.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : '';
}

export function validateImageFile(file) {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  const ext = getExtension(file.name);
  const mimeOk = ALLOWED_MIME.has(file.type);
  const extOk = ALLOWED_EXT.has(ext);

  if (!mimeOk && !extOk) {
    throw new Error('Format non supporté. Utilisez JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('Fichier trop volumineux (max 10 Mo)');
  }
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible ou corrompue'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Impossible de traiter l\'image'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

async function resizeImageFile(file) {
  const img = await loadImageFromFile(file);
  const { width, height } = img;

  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= RESIZE_THRESHOLD_BYTES) {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const ext = getExtension(file.name);
  const keepPng = ext === '.png' || file.type === 'image/png' || file.type === 'image/x-png';
  const mime = keepPng ? 'image/png' : 'image/jpeg';
  const quality = keepPng ? undefined : 0.9;
  const blob = await canvasToBlob(canvas, mime, quality);

  if (blob.size > MAX_BYTES) {
    throw new Error('Image trop volumineuse même après compression (max 10 Mo)');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  const outExt = keepPng ? '.png' : '.jpg';
  return new File([blob], `${baseName}${outExt}`, { type: mime, lastModified: Date.now() });
}

/** Valide et compresse si nécessaire avant envoi au serveur. */
export async function prepareImageForUpload(file) {
  validateImageFile(file);

  try {
    return await resizeImageFile(file);
  } catch (err) {
    if (err.message?.includes('corrompue') || err.message?.includes('traiter')) {
      throw err;
    }
    return file;
  }
}

export function getUploadErrorMessage(err) {
  if (err?.message && !err.response) return err.message;
  if (err?.code === 'ECONNABORTED') return 'Délai dépassé — réessayez avec une image plus légère';
  return err?.response?.data?.message || 'Erreur lors de l\'envoi du fichier';
}
