export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  openaiApiKey: process.env.OPENAI_API_KEY!,
  qdrantUrl: process.env.QDRANT_URL!,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  queue: {
    name: 'file-upload-queue',
  },
  upload: {
    destination: 'uploads/',
    maxFileSize: 10 * 1024 * 1024,
  },
  llm: {
    model: 'gpt-5-nano',
    embeddingModel: 'text-embedding-3-small',
  },
  vectorCollection: process.env.VECTOR_COLLECTION || 'pdf-docs'
};

export type Config = typeof config;
