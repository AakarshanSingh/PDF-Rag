import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../config/env.js';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const db = drizzle(pool);
