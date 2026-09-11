/**
 * React Query hooks for provider chat conversations.
 */
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
    staleTime: 1000 * 60, // 1 minute — WebSocket handles live updates
    placeholderData: keepPreviousData,
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
        // Uses InfiniteData shape { pages: [], pageParams: [] } to match useInfiniteQuery
        queryClient.setQueryData(['conversation-messages', convData.id], {
          pages: [
            {
              items: [msgData],
              conversation: newConv,
              pagination: { page: 1, limit: 30, total: 1, totalPages: 1 }
            }
          ],
          pageParams: [1]
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
      // The backend API might wrap the message in a 'message' object
      const actualMessage = data?.message ? data.message : data;

      // 1. Optimistically append the sent message to the chat window cache.
      //    Must mutate the InfiniteData { pages } shape.
      queryClient.setQueryData(['conversation-messages', variables.conversationId], (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
        
        // Deduplicate
        const exists = oldData.pages.some(page => 
          (page.items || page.data || []).some(m => m.id === actualMessage.id)
        );
        if (exists) return oldData;
        
        // Append to the last page's items
        const newPages = [...oldData.pages];
        const lastPageIndex = newPages.length - 1;
        const lastPage = newPages[lastPageIndex];
        const lastPageItems = lastPage.items || lastPage.data || [];
        
        newPages[lastPageIndex] = {
          ...lastPage,
          items: [...lastPageItems, actualMessage]
        };
        
        return {
          ...oldData,
          pages: newPages
        };
      });

      // 2. Refresh sidebar conversation list so the latest-message preview updates.
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] });
    },
  });
}
