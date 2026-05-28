import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis';

export const questionQueue = new Queue('question-generation', {
  connection: redisConfig
});

console.log('📦 BullMQ Question Queue initialized.');
