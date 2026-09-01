import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getConversationMessages } from '../../api/chat.api';

/**
 * Fetches all pages of messages for a conversation using infinite query.
 * Automatically loads all remaining pages after the initial fetch so the
 * newest messages are always visible — even after a hard page refresh.
 *
 * Returns { data, isLoading } where data?.items is the full sorted messages array.
 *
 * NOTE: The raw InfiniteData ({ pages, pageParams }) is kept in the React Query
 * cache WITHOUT a select transform so that setQueryData calls from useChatSocket
 * can safely append new messages to the pages array.
 */
export function useConversationMessages(conversationId) {
  const isMockId = conversationId?.startsWith('msg_local_');

  const query = useInfiniteQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: ({ pageParam = null }) => getConversationMessages(conversationId, pageParam, 30),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination || lastPage?.data?.pagination;
      if (pagination && pagination.nextCursor) {
        return pagination.nextCursor;
      }
      return undefined;
    },
    enabled: !!conversationId && !isMockId,
    staleTime: 1000 * 60, // 1 minute — WebSocket handles live updates
  });

  // Aggregate raw InfiniteData pages into the { items, conversation } shape
  // that ChatWindow already expects — without mutating the cache.
  const data = useMemo(() => {
    if (!query.data?.pages?.length) return undefined;

    const allMessages = query.data.pages.flatMap(
      (page) => page?.items ?? page?.data ?? []
    );

    const sorted = [...allMessages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const lastPage = query.data.pages[query.data.pages.length - 1];

    return {
      items: sorted,
      conversation: lastPage?.conversation,
      pagination: lastPage?.pagination,
    };
  }, [query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
