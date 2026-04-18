import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);

  console.log(auth);

  if (!auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
}
