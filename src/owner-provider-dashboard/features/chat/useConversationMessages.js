import { useQuery } from '@tanstack/react-query';
import { getConversationMessages } from '../../api/chat.api';

export function useConversationMessages(conversationId) {
  const isMockId = conversationId?.startsWith('msg_local_');
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => getConversationMessages(conversationId),
    enabled: !!conversationId && !isMockId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
