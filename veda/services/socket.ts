import { io, Socket } from 'socket.io-client';

// Use same host for proxying websocket
export const connectSocket = (
  assignmentId: string,
  onUpdate: (data: { assignmentId: string; status: string; data?: any }) => void
): Socket => {
  const socket = io(); // empty string defaults to current host and path

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
