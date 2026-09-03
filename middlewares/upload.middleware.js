const path = require('path');
const multer = require('multer');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

const MIME_ALIASES = {
  'image/x-png': 'image/png',
  'image/pjpeg': 'image/jpeg',
  'image/x-citrix-png': 'image/png',
  'image/x-citrix-jpeg': 'image/jpeg',
};

const EXT_TO_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

const normalizeMimeType = (file) => {
  let mime = (file.mimetype || '').toLowerCase().trim();
  if (MIME_ALIASES[mime]) mime = MIME_ALIASES[mime];

  if (!mime || mime === 'application/octet-stream') {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  }

  return mime;
};

const isAllowedType = (file, allowedTypes) => {
  const mime = normalizeMimeType(file);
  if (allowedTypes.includes(mime)) {
    file.mimetype = mime;
    return true;
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeFromExt = EXT_TO_MIME[ext];
  if (mimeFromExt && allowedTypes.includes(mimeFromExt)) {
    file.mimetype = mimeFromExt;
    return true;
  }

  return false;
};

const memoryStorage = multer.memoryStorage();

const createUpload = (allowedTypes, maxSize = MAX_FILE_SIZE, maxFiles = 10) => multer({
  storage: memoryStorage,
  limits: { fileSize: maxSize, files: maxFiles },
  fileFilter: (req, file, cb) => {
    if (isAllowedType(file, allowedTypes)) {
      cb(null, true);
      return;
    }
    const ext = path.extname(file.originalname || '').toLowerCase() || '(inconnu)';
    cb(new Error(
      `Format non supporté (${file.mimetype || 'type inconnu'}, extension ${ext}). `
      + 'Utilisez JPG, PNG, WEBP ou PDF.',
    ));
  },
});

const uploadImage = createUpload(ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, 1);
const uploadDocument = createUpload(ALLOWED_DOC_TYPES, MAX_FILE_SIZE, 10);
const uploadAny = createUpload(ALLOWED_DOC_TYPES, MAX_FILE_SIZE, 10);

/** Enveloppe multer pour transmettre les erreurs au middleware global. */
const handleUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) return next(err);
    return next();
  });
};

module.exports = {
  uploadImage,
  uploadDocument,
  uploadAny,
  handleUpload,
  MAX_FILE_SIZE,
  normalizeMimeType,
};
