import { Queue } from 'bullmq';
import { config } from '../config/env.js';

export type FileReadyPayload = {
  filename: string;
  source: string;
  path: string;
};

const queue = new Queue(config.queue.name, {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

export async function addFileReadyJob(payload: FileReadyPayload) {
  await queue.add('file-ready', JSON.stringify(payload));
}
