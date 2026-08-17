import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useConversations } from './useConversations';
import useChatStore from '../../store/chatStore';
import { getMessageHistory } from '../../api/endpoints/chat.api';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';

export default function ChatPage() {
  const { data: conversations = [], isLoading } = useConversations();

  const activeId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setHistory = useChatStore((s) => s.setHistory);
  const getActiveMessages = useChatStore((s) => s.getActiveMessages);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const { data: history } = useQuery({
    queryKey: ['messages', activeId],
    queryFn: () => getMessageHistory(activeId),
    enabled: !!activeId,
  });

  useEffect(() => {
    if (activeId && history) {
      setHistory(activeId, history);
    }
  }, [activeId, history, setHistory]);

  if (isLoading) return <div className="p-6 text-gray-500">Loading conversations...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-xl border border-gray-200 overflow-hidden m-6">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveConversation}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConversation && (
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
              {activeConversation.initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{activeConversation.participantName}</p>
              <p className="text-xs text-gray-400 capitalize">{activeConversation.participantRole}</p>
            </div>
          </div>
        )}

        <MessageThread
          messages={getActiveMessages()}
          participantName={activeConversation?.participantName}
        />

        {activeId && <MessageInput conversationId={activeId} />}
      </div>
    </div>
  );
}
