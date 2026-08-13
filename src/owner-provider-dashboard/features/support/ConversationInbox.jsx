import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../../admin-dashboard/api/axiosClient'; // Re-use the existing axiosClient
import { MessageSquarePlus, MessageCircle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import formatDate from '../../../shared/utils/formatDate';

const statusMap = {
  WAITING_REQUESTER: { text: 'في انتظار ردك', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  WAITING_SUPPORT: { text: 'قيد المراجعة', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  RESOLVED: { text: 'مغلقة', color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

export default function ConversationInbox({ selectedConversationId, setSelectedConversationId, providerId }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-support-conversations', providerId],
    queryFn: async () => {
      const res = await axiosClient.get(`/conversations?type=PROVIDER_SUPPORT&status=open&page=1&limit=20`);
      return res.data;
    },
    enabled: !!providerId
  });

  const createTicketMutation = useMutation({
    mutationFn: async (message) => {
      const res = await axiosClient.post('/conversations', {
        type: "PROVIDER_SUPPORT",
        providerId: providerId,
        message: message
      });
      return res.data;
    },
    onSuccess: (data) => {
      const newConv = data?.conversation || data?.data?.conversation || data;
      queryClient.invalidateQueries(['provider-support-conversations']);
      setIsModalOpen(false);
      setNewMessage('');
      if (newConv?.id) {
        setSelectedConversationId(newConv.id);
      }
    }
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    createTicketMutation.mutate(newMessage);
  };

  const conversations = data?.items || data?.data || (Array.isArray(data) ? data : []);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50 shrink-0">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          <MessageSquarePlus size={18} />
          تذكرة دعم جديدة
        </button>
      </div>

      {/* Inbox List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
        ) : isError ? (
          <div className="p-4 text-center text-red-500">حدث خطأ أثناء جلب المحادثات.</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center">
            <MessageCircle size={40} className="mb-3 opacity-50" />
            <p>لا توجد تذاكر دعم مفتوحة.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isSelected = selectedConversationId === conv.id;
              const status = statusMap[conv.supportStatus] || statusMap.WAITING_SUPPORT;
              const unreadCount = conv.unreadCount || 0;
              const lastMessage = conv.latestMessage?.body || 'تذكرة جديدة';
              const time = conv.latestMessage?.createdAt || conv.updatedAt;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full text-right p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    {time && (
                      <span className="text-xs text-gray-400" dir="ltr">
                        {formatDate(time)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <p className={`text-sm truncate ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {lastMessage}
                    </p>
                    {unreadCount > 0 && (
                      <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">فتح تذكرة دعم جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">كيف يمكننا مساعدتك؟</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-32 custom-scrollbar"
                  placeholder="اكتب مشكلتك أو استفسارك هنا بوضوح..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={createTicketMutation.isPending}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  disabled={createTicketMutation.isPending}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending || !newMessage.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {createTicketMutation.isPending ? 'جاري الإرسال...' : 'إرسال التذكرة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
