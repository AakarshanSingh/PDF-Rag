import { app } from './app.js';
import { config } from './config/env.js';
import fs from 'node:fs';
import path from 'node:path';

const uploadDir = path.resolve(process.cwd(), config.upload.destination);
fs.mkdirSync(uploadDir, { recursive: true });

import { db } from './db/index.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function setupDemoUser() {
  try {
    const email = 'demo@example.com';
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!existingUser[0]) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.insert(users).values({
        name: 'Demo User',
        email,
        password: hashedPassword,
        isVerified: true,
      });
      console.log('Demo user created successfully: demo@example.com / password123');
    } else {
      console.log('Demo user already exists.');
    }
  } catch (error) {
    console.error('Failed to setup demo user:', error);
  }
}

app.listen(config.port, async () => {
  await setupDemoUser();
  console.log(`Server started on port ${config.port}`);
});
