import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { config } from '../config/env.js';

export async function getOrCreateUserByClerkId(clerkId: string) {
  const existing = await db
    .select({ id: users.id, clerkId: users.clerkId, uploadLimit: users.uploadLimit })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const created = await db
    .insert(users)
    .values({ clerkId, uploadLimit: config.uploadLimit })
    .returning({ id: users.id, clerkId: users.clerkId, uploadLimit: users.uploadLimit });

  return created[0];
}
