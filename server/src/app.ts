import express from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/upload.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { clerkMiddleware } from '@clerk/express';
import { requireUser } from './middleware/requireUser.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  return res.json({ status: 'healthy' });
});

app.use(clerkMiddleware());

app.use('/upload', requireUser, uploadRouter);
app.use('/chat', chatRouter);
