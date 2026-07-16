// v4 — force Vite HMR rebuild
/**
 * React Query hooks for provider notifications.
 *
 * useProviderNotifications() — fetches all notifications and derives unreadCount.
 * useMarkAllRead()           — mutation that marks all as read + invalidates cache.
 * useDeleteNotification()    — mutation that removes a single notification.
 *
 * When the real API is unavailable (no backend), mock data is loaded directly
 * so the UI is fully functional during development.
 */
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '../../api/notifications.api';

const QUERY_KEY = ['provider-notifications'];

/**
 * Fetches all notifications.
 * Returns raw data list plus a derived `unreadCount` for the bell badge.
 */
export function useProviderNotifications() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getNotifications({ page: 1, limit: 20 }),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 10000, // Poll every 10 seconds to enable real-time unlocking
    retry: false,          // Don't retry on error — fallback is handled in the API layer
  });

  const notifications = query.data?.data ?? [];
  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  // Real-Time Unlocking Trick:
  // If a PROVIDER_APPROVED notification is received, invalidate the provider profile query.
  // This triggers a background refetch, updating the profile status to APPROVED,
  // which instantly unlocks the dashboard layout.
  useEffect(() => {
    const isApproved = notifications.some((n) => n.type === 'PROVIDER_APPROVED');
    if (isApproved) {
      queryClient.invalidateQueries({ queryKey: ['providerProfile'] });
    }
  }, [notifications, queryClient]);

  return { ...query, notifications, unreadCount };
}

/**
 * Marks all notifications as read on the server,
 * then optimistically updates local cache so the bell badge clears instantly.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      // Optimistically update the cache so the badge clears immediately
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previous = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old;
        const now = new Date().toISOString();
        return {
          ...old,
          data: (old.data ?? []).map((n) => ({
            ...n,
            readAt: n.readAt ?? now,
          })),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Deletes a single notification by ID, optimistically removing it from the list.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: (old.data ?? []).filter((n) => n.id !== id),
          total: (old.total ?? 0) - 1,
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Marks a single notification as read on the server,
 * and optimistically updates the local cache.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old;
        const now = new Date().toISOString();
        return {
          ...old,
          data: (old.data ?? []).map((n) =>
            n.id === id ? { ...n, readAt: n.readAt ?? now } : n
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
