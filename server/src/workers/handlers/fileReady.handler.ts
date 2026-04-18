import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { addDocumentsToVectorStore } from '../../services/vector.service.js';

type FileReadyPayload = {
  filename: string;
  source: string;
  path: string;
};

export async function fileReadyHandler(job: { data: string }) {
  const data = JSON.parse(job.data) as FileReadyPayload;

  console.log(`Job: ${job.data}`);

  const loader = new PDFLoader(data.path);
  const docs = await loader.load();

  await addDocumentsToVectorStore(docs);

  console.log('All docs are added to vector store');
}
