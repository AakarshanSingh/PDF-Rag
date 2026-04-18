import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export async function getOrCreateUserByClerkId(clerkId: string) {
  const existing = await db
    .select({ id: users.id, clerkId: users.clerkId })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const created = await db
    .insert(users)
    .values({ clerkId })
    .returning({ id: users.id, clerkId: users.clerkId });

  return created[0];
}
