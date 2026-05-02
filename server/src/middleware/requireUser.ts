import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const userRows = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    
    if (!userRows[0]) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = userRows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
