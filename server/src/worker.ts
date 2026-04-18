import { startFileUploadWorker } from './workers/fileUpload.worker.js';
import { config } from './config/env.js';

startFileUploadWorker();

console.log(`Worker started for queue: ${config.queue.name}`);
