export type DocumentStatus = 'queued' | 'indexing' | 'indexed' | 'failed';

export async function setDocumentStatus(
  _documentId: string,
  _status: DocumentStatus,
) {
  return;
}
