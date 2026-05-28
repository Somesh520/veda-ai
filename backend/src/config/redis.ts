import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ
};

let redisConnection: Redis | null = null;

export const getRedisConnection = (): Redis => {
  if (!redisConnection) {
    redisConnection = new Redis(redisConfig);
    
    redisConnection.on('connect', () => {
      console.log('✅ Redis connected successfully.');
    });

    redisConnection.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
  }
  
  return redisConnection;
};
