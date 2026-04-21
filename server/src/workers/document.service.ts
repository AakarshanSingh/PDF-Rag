import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { documents } from '../db/schema.js';

export type DocumentStatus = 'queued' | 'indexing' | 'indexed' | 'failed';

export async function setDocumentStatus(
  documentId: string,
  status: DocumentStatus,
) {
  await db
    .update(documents)
    .set({ status })
    .where(eq(documents.id, documentId));
}
