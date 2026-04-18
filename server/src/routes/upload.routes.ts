import { Router } from 'express';
import multer from 'multer';
import { config } from '../config/env.js';
import { uploadPdfController } from '../controllers/upload.controller.js';

export const uploadRouter = Router();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, config.upload.destination);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  dest: config.upload.destination,
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

uploadRouter.post('/pdf', upload.single('pdf'), uploadPdfController);
