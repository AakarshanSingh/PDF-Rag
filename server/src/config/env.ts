export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://pdfrag:pdfrag@localhost:5432/pdfrag',
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
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
  vectorCollection: process.env.VECTOR_COLLECTION || 'pdf-docs',
  uploadLimit: parseInt(process.env.DEFAULT_UPLOAD_LIMIT || '2', 10),
};
