import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../../admin-dashboard/api/axiosClient';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight, Send, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import formatDate from '../../../shared/utils/formatDate';

const statusMap = {
  WAITING_REQUESTER: { text: 'في انتظار ردك', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  WAITING_SUPPORT: { text: 'قيد المراجعة', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  RESOLVED: { text: 'مغلقة', color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

export default function ConversationThread({ selectedConversationId, onBack, currentUserId }) {
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const observerTarget = useRef(null);

  // 1. Fetch Conversation Details
  const { data: conversationData } = useQuery({
    queryKey: ['provider-conversation-details', selectedConversationId],
    queryFn: async () => {
      const res = await axiosClient.get(`/conversations/${selectedConversationId}`);
      return res.data?.conversation || res.data;
    },
    enabled: !!selectedConversationId
  });

  const supportStatus = conversationData?.supportStatus || 'WAITING_SUPPORT';
  const statusInfo = statusMap[supportStatus] || statusMap.WAITING_SUPPORT;
  const isResolved = supportStatus === 'RESOLVED';

  // 2. Infinite Query for Messages
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading
  } = useInfiniteQuery({
    queryKey: ['provider-messages', selectedConversationId],
    queryFn: async ({ pageParam = null }) => {
      const url = `/conversations/${selectedConversationId}/messages?mode=cursor&limit=50${pageParam ? `&beforeMessageId=${pageParam}` : ''}`;
      const res = await axiosClient.get(url);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!selectedConversationId,
  });

  // Flat list of messages (reverse them for chat view)
  const messages = messagesData?.pages.flatMap((page) => page.items || page.data || []).reverse() || [];

  // Scroll to bottom on load/new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Intersection Observer to fetch older messages
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 3. Mark Read
  useEffect(() => {
    if (selectedConversationId) {
      axiosClient.post(`/conversations/${selectedConversationId}/read`).then(() => {
        queryClient.invalidateQueries(['provider-support-conversations']);
      }).catch(console.error);
    }
  }, [selectedConversationId, messages.length, queryClient]);

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      const res = await axiosClient.post(`/conversations/${selectedConversationId}/messages`, {
        body: text,
        clientMessageId: uuidv4(),
      });
      return res.data;
    },
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries(['provider-messages', selectedConversationId]);
      queryClient.invalidateQueries(['provider-support-conversations']);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessageMutation.mutate(inputText);
  };

  // 5. Close Ticket Mutation
  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post(`/conversations/${selectedConversationId}/close`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-conversation-details', selectedConversationId]);
      queryClient.invalidateQueries(['provider-support-conversations']);
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <ArrowRight size={20} />
          </button>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
            <ShieldCheck size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">الدعم الفني لـ ShineUp</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>

        {!isResolved && (
          <button
            onClick={() => {
              if (window.confirm("هل أنت متأكد من إغلاق التذكرة؟")) {
                closeTicketMutation.mutate();
              }
            }}
            disabled={closeTicketMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            إغلاق التذكرة
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {/* Intersection Observer Target for pagination */}
        <div ref={observerTarget} className="h-4 w-full flex justify-center">
          {isFetchingNextPage && <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full">جاري تحميل الرسائل...</span>}
        </div>

        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-full shadow-sm">جاري تحميل المحادثة...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-full shadow-sm">لا توجد رسائل حتى الآن</span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAdmin = msg.senderUserId === null;
            const isMe = msg.senderUserId === currentUserId;
            // Fallback for bubble position: If not admin and not me, we treat it as right-aligned (another provider member maybe?)
            const isRight = isMe || !isAdmin;

            return (
              <div key={msg.id || index} className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                <div className="flex max-w-[75%] gap-2 items-end">
                  {!isRight && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-white shadow-sm overflow-hidden">
                       <ShieldCheck size={16} className="text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl shadow-sm relative text-sm ${
                    isRight 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    <div className={`text-[10px] mt-1.5 flex justify-end gap-1 ${isRight ? 'text-blue-100' : 'text-gray-500'}`}>
                      <span dir="ltr">{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>

                  {isRight && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border border-white shadow-sm overflow-hidden">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isResolved ? (
        <form onSubmit={handleSend} className="bg-[#F0F2F5] p-3 flex items-end gap-2 shrink-0">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex items-center">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none p-3 text-sm max-h-32 custom-scrollbar"
              rows={1}
              placeholder="اكتب رسالتك هنا..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={sendMessageMutation.isPending || !inputText.trim()}
            className="w-12 h-12 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm disabled:opacity-50"
          >
            <Send size={20} className="rtl:-scale-x-100" />
          </button>
        </form>
      ) : (
        <div className="bg-[#F0F2F5] p-4 text-center text-sm text-gray-500 border-t border-gray-200 shrink-0">
          هذه التذكرة مغلقة. لا يمكنك إرسال رسائل جديدة. لطلب المساعدة مجدداً، يرجى فتح تذكرة جديدة.
        </div>
      )}
    </div>
  );
}
