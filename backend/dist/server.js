"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const worker_1 = require("./queue/worker");
const socket_service_1 = require("./services/socket.service");
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5001;
// Middlewares
app.use((0, cors_1.default)({ origin: '*' })); // Enable global CORS
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static route to access uploaded files if needed
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/assignments', assignment_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Start Server and database connections
const startServer = async () => {
    try {
        // 1. Connect Mongoose DB
        await (0, db_1.connectDB)();
        // 2. Initialize Redis connection
        (0, redis_1.getRedisConnection)();
        // 3. Initialize WebSocket Server
        (0, socket_service_1.initSocketServer)(server);
        // 4. Initialize BullMQ Queue Worker
        (0, worker_1.initQueueWorker)();
        // 5. Bind Server Port
        server.listen(PORT, () => {
            console.log(`🚀 VedaAI Backend Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
