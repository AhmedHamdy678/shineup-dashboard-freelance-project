import { io } from 'socket.io-client';

// Prefer the configured API origin; same-origin is a safe fallback for the Nginx Socket.IO proxy.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    const token = localStorage.getItem('auth_token');
    cb({ token });
  },
});

export function connectSocket() {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

export function joinConversation(conversationId) {
  socket.emit('join_conversation', { conversationId });
}

export function leaveConversation(conversationId) {
  socket.emit('leave_conversation', { conversationId });
}

export function sendMessage({ conversationId, content }) {
  socket.emit('send_message', { conversationId, content });
}

export function onNewMessage(callback) {
  socket.on('new_message', callback);
  return () => socket.off('new_message', callback);
}

export function onConnectionError(callback) {
  socket.on('connect_error', callback);
  return () => socket.off('connect_error', callback);
}

export function isConnected() {
  return socket.connected;
}

export default socket;
