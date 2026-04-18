import { getAuth } from '@clerk/express';
import type { Request, Response } from 'express';
import { addFileReadyJob } from '../services/queue.service.js';
import { db } from '../db/index.js';
import { documents } from '../db/schema.js';
import { getOrCreateUserByClerkId } from '../services/user.service.js';

export async function uploadPdfController(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'PDF File is Required' });
  }

  const auth = getAuth(req);

  const appUser = await getOrCreateUserByClerkId(auth.userId!);

  const inserted = await db
    .insert(documents)
    .values({
      userId: appUser.id,
      filename: req.file.originalname,
      storagePath: req.file.path,
      status: 'queued',
    })
    .returning({ id: documents.id });

  const documentId = inserted[0]?.id;
  
  if (!documentId) {
    return res
      .status(500)
      .json({ message: 'Failed to create document record' });
  }

  await addFileReadyJob({
    documentId,
    ownerClerkId: auth.userId!,
    filename: req.file.originalname,
    source: req.file.destination,
    path: req.file.path,
  });

  return res.json({ message: 'Uploaded', documentId });
}
