"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAssignmentUpdate = exports.getSocketIO = exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
let io = null;
/**
 * Inits the Socket.io WebSocket server instance bound to our Express HTTPServer.
 * Enables real-time reactive event broadcasts across dedicated room channels.
 */
const initSocketServer = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Enforce open CORS rules for client next.js connections
            methods: ['GET', 'POST'],
        },
    });
    // Setup connection channels
    io.on('connection', (socket) => {
        console.log(`🔌 [socket] Client connected: ${socket.id}`);
        // Let clients join specific rooms mapped to assignmentIds to follow background progression
        socket.on('join_assignment', (assignmentId) => {
            socket.join(assignmentId);
            console.log(`🔌 [socket] Client ${socket.id} subscribed to Assignment Room: ${assignmentId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 [socket] Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocketServer = initSocketServer;
/**
 * Returns the active Socket.io Server instance.
 * Throws an error if referenced before server boot.
 */
const getSocketIO = () => {
    if (!io) {
        throw new Error('Socket.io server has not been initialized yet.');
    }
    return io;
};
exports.getSocketIO = getSocketIO;
/**
 * Broadcasts a structured reactive progress payload to all subscribed clients in a specific assignment room.
 * Mapped statuses: PENDING | GENERATING | COMPLETED | FAILED
 */
const notifyAssignmentUpdate = (assignmentId, status, data) => {
    if (!io) {
        console.warn('⚠️ [socket] Broadcast skipped: Socket.io server not initialized.');
        return;
    }
    console.log(`📡 [socket] Room Broadcast (${assignmentId}) -> Status: ${status}`);
    io.to(assignmentId).emit('assignment_update', {
        assignmentId,
        status,
        data,
    });
};
exports.notifyAssignmentUpdate = notifyAssignmentUpdate;
