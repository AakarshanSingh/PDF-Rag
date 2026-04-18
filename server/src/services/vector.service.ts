import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '../config/env.js';

function buildEmbeddings() {
  return new OpenAIEmbeddings({
    model: config.llm.embeddingModel,
    apiKey: config.openaiApiKey,
  });
}

async function getVectorStore() {
  const embeddings = buildEmbeddings();

  return QdrantVectorStore.fromExistingCollection(embeddings, {
    url: config.qdrantUrl,
    collectionName: config.vectorCollection,
  });
}

export async function retrieveDocuments(
  query: string,
  ownerClerkId: string,
  k = 2,
) {
  const vectorStore = await getVectorStore();
  const retriever = vectorStore.asRetriever({
    k,
    filter: {
      must: [
        {
          key: 'metadata.ownerClerkId',
          match: { value: ownerClerkId },
        },
      ],
    },
  });

  return retriever.invoke(query);
}

export async function addDocumentsToVectorStore(docs: any[]) {
  const vectorStore = await getVectorStore();
  await vectorStore.addDocuments(docs);
}
