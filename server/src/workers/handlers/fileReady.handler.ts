import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { addDocumentsToVectorStore } from '../../services/vector.service.js';
import { setDocumentStatus } from '../document.service.js';

type FileReadyPayload = {
  documentId: string;
  ownerClerkId: string;
  filename: string;
  source: string;
  path: string;
};

export async function fileReadyHandler(job: { data: string }) {
  const data = JSON.parse(job.data) as FileReadyPayload;

  await setDocumentStatus(data.documentId, 'indexing');

  try {
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    const docsWithOwner = docs.map((doc) => ({
      ...doc,
      metadata: {
        ...(doc.metadata ?? {}),
        ownerClerkId: data.ownerClerkId,
        documentId: data.documentId,
        filename: data.filename,
      },
    }));

    await addDocumentsToVectorStore(docsWithOwner);
    await setDocumentStatus(data.documentId, 'indexed');

    console.log('All docs are added to vector store');
  } catch (error) {
    await setDocumentStatus(data.documentId, 'failed');
    throw error;
  }
}
