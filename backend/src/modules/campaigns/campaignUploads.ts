import fs from 'fs';
import path from 'path';
import multer from 'multer';

const campaignUploadsDir = path.resolve(__dirname, '../../uploads/campaign-assets');

fs.mkdirSync(campaignUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, campaignUploadsDir);
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniquePrefix}-${safeName}`);
  },
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const uploadCampaignAssets = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'campaign_image' && !allowedImageMimeTypes.has(file.mimetype)) {
      callback(new Error('Campaign image must be a JPG, PNG, or WEBP file.'));
      return;
    }

    if (file.fieldname === 'supporting_documents' && !allowedMimeTypes.has(file.mimetype) && !allowedImageMimeTypes.has(file.mimetype)) {
      callback(new Error('Unsupported document type. Please upload a PDF, Word document, JPG, PNG, or WEBP file.'));
      return;
    }

    callback(null, true);
  },
});