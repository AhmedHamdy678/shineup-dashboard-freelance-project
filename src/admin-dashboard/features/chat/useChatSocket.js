/**
 * useChatSocket — Global WebSocket hook for real-time chat.
 *
 * Mounted once in DashboardLayout (admin) and ProviderLayout (provider).
 *
 * HOW IT WORKS:
 * ─────────────
 * - Backend auto-joins the authenticated user to their personal room
 *   (user:{userId}) upon successful socket authentication — no manual join needed.
 *
 * - When a conversation is opened, we emit 'conversation:join' so the server
 *   also delivers messages scoped to that conversation room.
 *
 * - On 'message:created' event → directly updates React Query caches for
 *   zero-latency UI updates without a full query refetch.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  connectSocket,
  disconnectSocket,
  onNewMessage,
  onNewNotification,
  onConnectionError,
  joinConversation,
  leaveConversation,
} from '../../services/socket.service';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import useProviderAuthStore from '../../../owner-provider-dashboard/store/providerAuthStore';
import { useLocation } from 'react-router-dom';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useChatSocket(options = {}) {
  const queryClient = useQueryClient();
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const appendMessage = useChatStore((s) => s.appendMessage);

  const location = useLocation();
  const adminToken = useAuthStore((s) => s.token);
  const providerToken = useProviderAuthStore((s) => s.token);

  let currentToken = null;
  const isAdminPath = location.pathname.startsWith('/admin');
  const isProviderPath = location.pathname.startsWith('/provider') || location.pathname.startsWith('/owner');

  if (options.role === 'admin' || isAdminPath) currentToken = adminToken;
  else if (options.role === 'provider' || isProviderPath) currentToken = providerToken;
  else currentToken = adminToken || providerToken; // fallback

  // ── Connect when token is available ────────────────────────────────────────
  // Backend handles user room join automatically via token auth.
  useEffect(() => {
    if (useMock || !currentToken) return;

    connectSocket(currentToken);

    const unsubError = onConnectionError((err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    return () => {
      unsubError();
      disconnectSocket();
    };
  }, [currentToken]); 

  // ── Join / leave conversation room when active conversation changes ─────────
  // Emits 'conversation:join' so the server delivers conversation-scoped events.
  useEffect(() => {
    if (useMock || !activeConversationId) return;

    joinConversation(activeConversationId); // emits 'conversation:join'

    return () => {
      leaveConversation(activeConversationId); // emits 'conversation:leave'
    };
  }, [activeConversationId]);

  // ── Handle incoming 'message:created' events ───────────────────────────────
  useEffect(() => {
    if (useMock) return;

    const unsub = onNewMessage((payload) => {
      // Extract the actual message object from the payload wrapper if it exists
      const actualMessage = payload.message ? payload.message : payload;
      
      // Sometimes the backend uses chatId instead of conversationId, let's be safe
      const convId = actualMessage.conversationId || actualMessage.chatId; 

      if (!convId) {
        console.warn('⚠️ Received message without conversationId:', payload);
        return;
      }

      // 1. Update Zustand store (used by legacy chat components)
      appendMessage(convId, actualMessage);

      // 2. Refresh AdminSupportThread messages (useInfiniteQuery + select transform).
      //    Partial key match — invalidates ['admin-messages', ANY_ID].
      queryClient.invalidateQueries({ queryKey: ['admin-messages'], refetchType: 'all' });

      // 3. Refresh AdminChatPage customer-tab messages.
      //    This uses useInfiniteQuery, so we must mutate the InfiniteData structure safely
      queryClient.setQueryData(['messages', convId], (old) => {
        if (!old || !old.pages || old.pages.length === 0) return old;
        
        // Deduplicate
        const exists = old.pages.some(page => 
          (page.items || page.data || []).some(m => m.id === actualMessage.id)
        );
        if (exists) return old;
        
        // Append to the last page's items
        const newPages = [...old.pages];
        const lastPageIndex = newPages.length - 1;
        const lastPage = newPages[lastPageIndex];
        const lastPageItems = lastPage.items || lastPage.data || [];
        
        newPages[lastPageIndex] = {
          ...lastPage,
          items: [...lastPageItems, actualMessage]
        };
        
        return {
          ...old,
          pages: newPages
        };
      });

      // 4. Update Provider ChatWindow (InfiniteData)
      queryClient.setQueryData(['conversation-messages', convId], (old) => {
        if (!old || !old.pages || old.pages.length === 0) return old;
        
        // Check if message already exists anywhere to deduplicate
        const exists = old.pages.some(page => 
          (page.items || page.data || []).some(m => m.id === actualMessage.id)
        );
        if (exists) return old;
        
        // Append to the last page's items
        const newPages = [...old.pages];
        const lastPageIndex = newPages.length - 1;
        const lastPage = newPages[lastPageIndex];
        const lastPageItems = lastPage.items || lastPage.data || [];
        
        newPages[lastPageIndex] = {
          ...lastPage,
          items: [...lastPageItems, actualMessage]
        };
        
        return {
          ...old,
          pages: newPages
        };
      });

      // 5. Refresh sidebar lists so last-message preview + unread count updates
      queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'], refetchType: 'all' });

      // 6. Refresh global notifications in topbar (bell icon badge)
      queryClient.invalidateQueries({ queryKey: ['provider-notifications'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'], refetchType: 'all' });
    });

    return () => unsub();
  }, [queryClient, appendMessage]);

  // ── Handle incoming 'notification:created' events ──────────────────────────
  // Fires whenever the backend creates a new notification for this user.
  // We invalidate every notification-related query key so the bell badge
  // and notification lists update instantly — no page refresh needed.
  useEffect(() => {
    if (useMock) return;

    const unsub = onNewNotification((payload) => {
      // Provider bell badge + notifications page
      queryClient.invalidateQueries({ queryKey: ['provider-notifications'], refetchType: 'all' });

      // Admin bell badge (unread-count endpoint)
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'], refetchType: 'all' });

      // Admin notifications page list (if it exists in cache)
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'], refetchType: 'all' });
    });

    return () => unsub();
  }, [queryClient]);
}
