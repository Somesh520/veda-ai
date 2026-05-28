import { io, Socket } from 'socket.io-client';

// Always connect directly to the backend since Vercel/NextJS serverless does not support proxying open WebSockets via rewrites
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veda-ai-drcn.onrender.com';

export const connectSocket = (
  assignmentId: string,
  onUpdate: (data: { assignmentId: string; status: string; data?: any }) => void
): Socket => {
  const socket = io(SOCKET_SERVER_URL);

  socket.on('connect', () => {
    console.log(`🔌 Connected to WebSocket Server for assignment: ${assignmentId}`);
    socket.emit('join_assignment', assignmentId);
  });

  socket.on('assignment_update', (update) => {
    console.log('📡 Received WebSocket update:', update);
    onUpdate(update);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from WebSocket Server');
  });

  return socket;
};
