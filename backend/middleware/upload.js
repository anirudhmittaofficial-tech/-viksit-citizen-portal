import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const extname = filetypes.test(ext);
  const mimetype = /jpeg|jpg|png|webp|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only JPG, JPEG, PNG, WEBP, PDF, DOC, and DOCX formats are allowed.'));
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  }
});
