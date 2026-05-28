import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

/**
 * Inits the Socket.io WebSocket server instance bound to our Express HTTPServer.
 * Enables real-time reactive event broadcasts across dedicated room channels.
 */
export const initSocketServer = (server: HTTPServer): SocketIOServer => {
  const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:3000'] 
    : '*';

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  });

  // Setup connection channels
  io.on('connection', (socket) => {
    console.log(`🔌 [socket] Client connected: ${socket.id}`);

    // Let clients join specific rooms mapped to assignmentIds to follow background progression
    socket.on('join_assignment', (assignmentId: string) => {
      socket.join(assignmentId);
      console.log(`🔌 [socket] Client ${socket.id} subscribed to Assignment Room: ${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Returns the active Socket.io Server instance.
 * Throws an error if referenced before server boot.
 */
export const getSocketIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io server has not been initialized yet.');
  }
  return io;
};

/**
 * Broadcasts a structured reactive progress payload to all subscribed clients in a specific assignment room.
 * Mapped statuses: PENDING | GENERATING | COMPLETED | FAILED
 */
export const notifyAssignmentUpdate = (assignmentId: string, status: string, data?: any) => {
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
