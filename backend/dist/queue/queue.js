"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.questionQueue = new bullmq_1.Queue('question-generation', {
    connection: redis_1.redisConfig
});
console.log('📦 BullMQ Question Queue initialized.');
