import { useState } from 'react';
import { Send } from 'lucide-react';
import { sendMessage } from '../../services/socket.service';
import useChatStore from '../../store/chatStore';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export default function MessageInput({ conversationId }) {
  const [text, setText] = useState('');
  const appendMessage = useChatStore((s) => s.appendMessage);

  const handleSend = () => {
    const content = text.trim();
    if (!content || !conversationId) return;

    if (useMock) {
      appendMessage(conversationId, {
        id: `msg_mock_${Date.now()}`,
        conversationId,
        senderId: 'admin_1',
        senderName: 'Admin',
        senderRole: 'admin',
        content,
        createdAt: new Date().toISOString(),
      });
    } else {
      sendMessage({ conversationId, content });
    }

    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-3 bg-gray-50 rounded-xl px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center
            hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
