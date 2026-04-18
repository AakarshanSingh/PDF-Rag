import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { OpenAI } from 'openai';
import { config } from './config/env.js';

const app = express();

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

const queue = new Queue(config.queue.name, {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.upload.destination);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  dest: config.upload.destination,
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

app.get('/', (req, res) => {
  return res.json({ status: 'healthy' });
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'PDF File is Required' });
  }

  await queue.add(
    'file-ready',
    JSON.stringify({
      filename: req?.file.originalname,
      source: req?.file.destination,
      path: req?.file.path,
    }),
  );

  return res.json({ message: 'Uploaded' });
});

app.get('/chat', async (req, res) => {
  const rawMessage = req.query.message;

  if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return res.status(400).json({ message: 'message is required' });
  }

  const userQuery = rawMessage.trim();

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

  const ret = vectorStore.asRetriever({
    k: 2,
  });

  const result = await ret.invoke(userQuery);

  const SYSTEM_PROMPT = `
  You are helpful AI Assistant who answers the user query based on the available context from PDF File.
  Context:
    ${JSON.stringify(result)}
  `;

  const chatResult = await client.chat.completions.create({
    model: config.llm.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  return res.json({
    message: chatResult.choices[0].message.content,
    docs: result,
  });
});

app.listen(config.port, () =>
  console.log(`Server started on port ${config.port}`),
);
