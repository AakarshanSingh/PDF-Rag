import { app } from './app.js';
import { config } from './config/env.js';
import fs from 'node:fs';
import path from 'node:path';

const uploadDir = path.resolve(process.cwd(), config.upload.destination);
fs.mkdirSync(uploadDir, { recursive: true });

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});
