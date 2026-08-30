import { io } from 'socket.io-client';

// Prefer the configured API origin; same-origin is a safe fallback for the Nginx Socket.IO proxy.
const SOCKET_URL = import.meta.env.DEV 
  ? window.location.origin 
  : (import.meta.env.VITE_SOCKET_URL || window.location.origin);

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export function connectSocket(token) {
  if (token) {
    socket.auth = { token };
  } else {
    // Fallback if no token passed
    socket.auth = { token: localStorage.getItem('auth_token') || localStorage.getItem('provider_token') };
  }
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

export function joinConversation(conversationId) {
  socket.emit('conversation:join', { conversationId });
}

export function leaveConversation(conversationId) {
  socket.emit('conversation:leave', { conversationId });
}

export function sendMessage({ conversationId, content }) {
  socket.emit('send_message', { conversationId, content });
}

export function onNewMessage(callback) {
  socket.on('message:created', callback);
  return () => socket.off('message:created', callback);
}

/**
 * Subscribe to global notification broadcasts.
 * The backend emits 'notification.created' (dot separator) whenever a new
 * notification is created for the authenticated user (any role).
 * Returns an unsubscribe function — call it in the useEffect cleanup.
 */
export function onNewNotification(callback) {
  socket.on('notification.created', callback);
  return () => socket.off('notification.created', callback);
}

export function onConnectionError(callback) {
  socket.on('connect_error', callback);
  return () => socket.off('connect_error', callback);
}

export function isConnected() {
  return socket.connected;
}

export default socket;

