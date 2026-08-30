const multer = require('multer');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

const memoryStorage = multer.memoryStorage();

const createUpload = (allowedTypes, maxSize = MAX_FILE_SIZE) => multer({
  storage: memoryStorage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Format non supporté: ${file.mimetype}. Utilisez JPG, PNG, WEBP ou PDF.`));
    }
  },
});

const uploadImage = createUpload(ALLOWED_IMAGE_TYPES);
const uploadDocument = createUpload(ALLOWED_DOC_TYPES);
const uploadAny = createUpload(ALLOWED_DOC_TYPES, MAX_FILE_SIZE);

module.exports = {
  uploadImage,
  uploadDocument,
  uploadAny,
  MAX_FILE_SIZE,
};
