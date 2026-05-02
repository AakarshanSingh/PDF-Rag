import type { Response } from 'express';
import type { AuthRequest } from '../middleware/requireUser.js';
import { retrieveDocuments } from '../services/vector.service.js';
import { generateChatAnswer } from '../services/llm.service.js';

export async function chatController(req: AuthRequest, res: Response) {
  try {
    const appUser = req.user;
    if (!appUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rawMessage = req.query.message;
    if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const userQuery = rawMessage.trim();
    const docs = await retrieveDocuments(userQuery, appUser.id, 2);
    const message = await generateChatAnswer(userQuery, docs);

    return res.json({
      message,
      docs,
    });
  } catch (error) {
    console.error('chatController error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
