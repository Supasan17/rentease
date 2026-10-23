/**
 * Image Upload Middleware
 *
 * Handles multipart item image uploads with multer. Files are stored on disk
 * in server/uploads/, limited to jpg, jpeg, png and webp, 5 MB each and at
 * most 5 images per request.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Make sure the uploads folder exists before multer writes to it
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Disk storage: keep the original extension and give each file a unique name.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  }
});

/**
 * File filter: accept only image types with a matching extension and MIME type.
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error('Only jpg, jpeg, png and webp images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  }
});

/**
 * Deletes the files multer saved for this request (used when the request fails).
 */
const removeUploadedFiles = (req) => {
  if (!req.files || req.files.length === 0) return;

  req.files.forEach((file) => {
    fs.unlink(file.path, () => {});
  });
};

/**
 * Deletes stored images given their public paths (e.g. '/uploads/<file>').
 */
const removeImages = (imagePaths = []) => {
  imagePaths.forEach((imagePath) => {
    const filePath = path.join(UPLOAD_DIR, path.basename(imagePath));
    fs.unlink(filePath, () => {});
  });
};

/**
 * Converts the files saved for this request into their public paths.
 */
const getUploadedImagePaths = (req) =>
  (req.files || []).map((file) => `/uploads/${file.filename}`);

/**
 * Upload item images: Accepts up to 5 files in the 'images' field and
 * turns multer errors into 400 responses.
 */
const uploadItemImages = (req, res, next) => {
  upload.array('images', MAX_FILES)(req, res, (err) => {
    if (!err) return next();

    removeUploadedFiles(req);
    res.status(400);

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new Error('Each image must be 5 MB or smaller'));
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new Error(`You can upload up to ${MAX_FILES} images in the 'images' field`));
      }
      return next(new Error(err.message));
    }

    next(err);
  });
};

module.exports = {
  uploadItemImages,
  removeUploadedFiles,
  removeImages,
  getUploadedImagePaths
};
