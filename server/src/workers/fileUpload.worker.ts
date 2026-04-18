import { Worker } from 'bullmq';
import { config } from '../config/env.js';
import { fileReadyHandler } from './handlers/fileReady.handler.js';

export function startFileUploadWorker() {
  return new Worker(config.queue.name, fileReadyHandler, {
    concurrency: 100,
    connection: {
      host: config.redis.host,
      port: config.redis.port,
    },
  });
}