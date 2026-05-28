"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisConnection = exports.redisConfig = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null, // Critical requirement for BullMQ
};
let redisConnection = null;
const getRedisConnection = () => {
    if (!redisConnection) {
        redisConnection = new ioredis_1.default(exports.redisConfig);
        redisConnection.on('connect', () => {
            console.log('✅ Redis connected successfully.');
        });
        redisConnection.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });
    }
    return redisConnection;
};
exports.getRedisConnection = getRedisConnection;
