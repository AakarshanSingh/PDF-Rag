import type { Request, Response } from 'express';
import { addFileReadyJob } from '../services/queue.service.js';

export async function uploadPdfController(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'PDF File is Required' });
  }

  await addFileReadyJob({
    filename: req.file.originalname,
    source: req.file.destination,
    path: req.file.path,
  });

  return res.json({ message: 'Uploaded' });
}
