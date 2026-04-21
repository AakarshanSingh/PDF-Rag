import { count, desc, eq } from 'drizzle-orm';
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
  if (!auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const appUser = await getOrCreateUserByClerkId(auth.userId);

  const quotaRows = await db
    .select({ total: count() })
    .from(documents)
    .where(eq(documents.userId, appUser.id));

  const currentCount = Number(quotaRows[0]?.total ?? 0);
  if (currentCount >= appUser.uploadLimit) {
    return res.status(429).json({
      message: `Upload limit reached. You can upload up to ${appUser.uploadLimit} files.`,
    });
  }

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
    ownerClerkId: auth.userId,
    filename: req.file.originalname,
    source: req.file.destination,
    path: req.file.path,
  });

  return res.json({ message: 'Uploaded', documentId });
}

export async function getUserDocumentsController(req: Request, res: Response) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const appUser = await getOrCreateUserByClerkId(auth.userId);

  const rows = await db
    .select({
      id: documents.id,
      filename: documents.filename,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, appUser.id))
    .orderBy(desc(documents.createdAt));

  return res.json({
    documents: rows,
    uploadLimit: appUser.uploadLimit,
  });
}

export async function getDocumentStatusController(req: Request, res: Response) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const documentIdParam = req.params.id;
  const documentId = Array.isArray(documentIdParam)
    ? documentIdParam[0]
    : documentIdParam;

  if (!documentId) {
    return res.status(400).json({ message: 'document id is required' });
  }

  const appUser = await getOrCreateUserByClerkId(auth.userId);

  const rows = await db
    .select({
      id: documents.id,
      userId: documents.userId,
      status: documents.status,
    })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  const doc = rows[0];
  if (!doc) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (doc.userId !== appUser.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json({
    documentId: doc.id,
    status: doc.status,
  });
}
