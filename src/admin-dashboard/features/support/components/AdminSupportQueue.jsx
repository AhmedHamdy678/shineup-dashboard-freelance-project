import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../../api/axiosClient';
import { MessageSquare, Clock, CheckCircle2, User, HelpCircle, Loader2 } from 'lucide-react';
import formatDate from '../../../../shared/utils/formatDate';

const statusConfig = {
  UNASSIGNED: { label: 'تذكرة جديدة', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  WAITING_SUPPORT: { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  WAITING_REQUESTER: { label: 'بانتظار الرد', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  RESOLVED: { label: 'مغلقة', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function AdminSupportQueue({ onSelectConversation, selectedId, targetConversationId, onAutoSelected }) {
  const [filter, setFilter] = useState('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-support-conversations', filter],
    queryFn: async () => {
      let url = '/admin/support-conversations?type=PROVIDER_SUPPORT&page=1&limit=20';
      if (filter === 'UNASSIGNED') {
        url += '&status=UNASSIGNED';
      } else if (filter === 'MY_TICKETS') {
        url += '&assignedTo=ME';
      }
      const res = await axiosClient.get(url);
      return res.data;
    }
  });

  const conversations = data?.items || [];

  // Auto-select the target conversation (from notification click) once data loads
  useEffect(() => {
    if (!targetConversationId || !conversations.length || !onAutoSelected) return;
    const match = conversations.find((c) => c.conversationId === targetConversationId);
    if (match) {
      onAutoSelected(match);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length, targetConversationId]);

  return (
    <div className="flex flex-col h-full bg-white shrink-0" dir="rtl">
      {/* Header & Filters */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          تذاكر الدعم الفني
        </h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('UNASSIGNED')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === 'UNASSIGNED'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            جديدة
          </button>
          <button
            onClick={() => setFilter('MY_TICKETS')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === 'MY_TICKETS'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            تذاكري
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-500 font-medium">جاري تحميل التذاكر...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-2 text-center p-4">
            <HelpCircle className="w-8 h-8 text-red-400" />
            <span className="text-sm text-red-600 font-medium">حدث خطأ أثناء جلب التذاكر.</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center p-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-gray-300" />
            </div>
            <span className="text-sm text-gray-500 font-medium">لا توجد تذاكر حالياً</span>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isSelected = selectedId === conv.conversationId;
              const status = statusConfig[conv.supportStatus] || statusConfig.WAITING_SUPPORT;
              const unread = conv.unreadCount > 0;

              return (
                <button
                  key={conv.conversationId}
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full text-right p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        {conv.requester?.avatarUrl ? (
                          <img src={conv.requester.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm truncate max-w-[140px] ${unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                          {conv.requester?.displayName || 'مزود خدمة'}
                        </h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {conv.lastMessageAt && (
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span dir="ltr">{formatDate(conv.lastMessageAt, true)}</span>
                        </span>
                      )}
                      {unread && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse"></span>
                      )}
                    </div>
                  </div>

                  <p className={`text-xs truncate ${unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {conv.lastMessage?.body || 'تذكرة جديدة فارغة'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
