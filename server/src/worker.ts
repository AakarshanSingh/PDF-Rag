import { Worker } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { config } from './config/env.js';

const worker = new Worker(
  config.queue.name,
  async (job) => {
    console.log(`Job: ${job.data}`);
    const data = JSON.parse(job.data);

    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    const embeddings = new OpenAIEmbeddings({
      model: config.llm.embeddingModel,
      apiKey: config.openaiApiKey,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: config.qdrantUrl,
        collectionName: config.vectorCollection,
      },
    );

    await vectorStore.addDocuments(docs);

    console.log(`All docs are added to vector store`);
  },
  {
    concurrency: 100,
    connection: {
      host: config.redis.host,
      port: config.redis.port,
    },
  },
);
