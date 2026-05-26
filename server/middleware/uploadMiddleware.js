const fs = require('fs');
const path = require('path');
const multer = require('multer');

const profileUploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
const reportUploadDir = path.join(__dirname, '..', 'uploads', 'reports');

if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

if (!fs.existsSync(reportUploadDir)) {
  fs.mkdirSync(reportUploadDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function profileFileFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }

  return cb(null, true);
}

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const reportStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, reportUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `report-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const allowedReportMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function reportFileFilter(_req, file, cb) {
  if (!allowedReportMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only PDF, image, and document files are allowed'));
  }

  return cb(null, true);
}

const uploadReportFile = multer({
  storage: reportStorage,
  fileFilter: reportFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = {
  uploadProfileImage,
  uploadReportFile,
};