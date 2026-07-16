/**
 * React Query hooks for provider chat conversations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, createConversation, sendMessage } from '../../api/chat.api';

const getQueryKey = (type) => ['provider-conversations', type];

/**
 * Fetches paginated conversations for a specific type.
 */
export function useProviderConversations(type = 'PROVIDER_SUPPORT', page = 1, limit = 20) {
  const queryClient = useQueryClient();
  const queryKey = [...getQueryKey(type), page, limit];
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getConversations({ type, page, limit });
      // Preserve latestMessage from cache if the backend response lacks it
      const oldData = queryClient.getQueryData(queryKey);
      if (oldData?.items && response?.items) {
        response.items = response.items.map(conv => {
          const oldConv = oldData.items.find(c => c.id === conv.id);
          if (oldConv?.latestMessage && !conv.latestMessage) {
            return { ...conv, latestMessage: oldConv.latestMessage };
          }
          return conv;
        });
      }
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds
    keepPreviousData: true, // Keep old data while fetching new page
  });

  const conversations = query.data?.items || query.data?.conversations || query.data?.data || (Array.isArray(query.data) ? query.data : []);
  const pagination = query.data?.pagination || query.data?.meta?.pagination || { page, limit, total: conversations.length };

  return { ...query, conversations, pagination };
}

/**
 * Mutation to create a new conversation (support or internal).
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createConversation,
    onSuccess: (data, variables) => {
      const type = variables.type || 'PROVIDER_SUPPORT';
      const qKey = getQueryKey(type);

      // Create a composite conversation object that includes the initial message as latestMessage
      const convData = data?.conversation || data?.data?.conversation;
      const msgData = data?.message || data?.data?.message;

      if (convData && msgData) {
        const newConv = {
          ...convData,
          latestMessage: msgData,
          lastMessageAt: msgData.createdAt || new Date().toISOString()
        };

        // Prepend it to the first page of conversations in the cache safely
        queryClient.setQueryData([...qKey, 1, 20], (oldData) => {
          const oldList = oldData?.items || oldData?.conversations || oldData?.data || (Array.isArray(oldData) ? oldData : []);
          const newItems = [newConv, ...oldList];
          return {
            ...oldData,
            items: newItems, // normalize to items for the extraction above
            pagination: oldData?.pagination || { page: 1, limit: 20, total: 1 }
          };
        });

        // Pre-seed the messages cache so the ChatWindow opens instantly
        queryClient.setQueryData(['conversation-messages', convData.id], {
          items: [msgData],
          conversation: newConv,
          pagination: { page: 1, limit: 30, total: 1 }
        });
      }

      // Invalidate to ensure background sync
      queryClient.invalidateQueries({ queryKey: qKey });
    },
  });
}

/**
 * Mutation to send a message to an existing conversation.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      // 1. Optimistically update the specific conversation's messages list
      queryClient.setQueryData(['conversation-messages', variables.conversationId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: [...oldData.items, data]
        };
      });

      // 2. We don't know the type here directly, so we'll just invalidate all conversation lists
      // so they refetch and show the updated latest message.
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', variables.conversationId] });
    },
  });
}
