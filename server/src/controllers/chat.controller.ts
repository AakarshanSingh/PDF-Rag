import type { Request, Response } from 'express';
import { retrieveDocuments } from '../services/vector.service.js';
import { generateChatAnswer } from '../services/llm.service.js';

export async function chatController(req: Request, res: Response) {
  const rawMessage = req.query.message;

  if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return res.status(400).json({ message: 'message is required' });
  }

  const userQuery = rawMessage.trim();
  const docs = await retrieveDocuments(userQuery, 2);
  const message = await generateChatAnswer(userQuery, docs);

  return res.json({
    message,
    docs,
  });
}
