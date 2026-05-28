import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { getRedisConnection } from './config/redis';
import { initQueueWorker } from './queue/worker';
import { initSocketServer } from './services/socket.service';
import assignmentRoutes from './routes/assignment.routes';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({ origin: '*' })); // Enable global CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static route to access uploaded files if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/assignments', assignmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start Server and database connections
const startServer = async () => {
  try {
    // 1. Connect Mongoose DB
    await connectDB();

    // 2. Initialize Redis connection
    getRedisConnection();

    // 3. Initialize WebSocket Server
    initSocketServer(server);

    // 4. Initialize BullMQ Queue Worker
    initQueueWorker();

    // 5. Bind Server Port
    server.listen(PORT, () => {
      console.log(`🚀 VedaAI Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
