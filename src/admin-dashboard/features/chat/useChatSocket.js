import { useEffect } from 'react';
import { connectSocket, disconnectSocket, onNewMessage, onConnectionError } from '../../services/socket.service';
import useChatStore from '../../store/chatStore';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useChatSocket() {
  const appendMessage = useChatStore((s) => s.appendMessage);

  useEffect(() => {
    if (useMock) return;

    connectSocket();

    const unsubMessage = onNewMessage((message) => {
      appendMessage(message.conversationId, message);
    });

    const unsubError = onConnectionError((err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return () => {
      unsubMessage();
      unsubError();
      disconnectSocket();
    };
  }, [appendMessage]);
}
