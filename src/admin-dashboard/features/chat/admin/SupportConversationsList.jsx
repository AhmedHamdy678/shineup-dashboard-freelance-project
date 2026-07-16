import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupportConversations } from '../../../api/endpoints/chat.api';
import useChatStore from '../../../store/chatStore';

export default function SupportConversationsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['support-conversations'],
    queryFn: getSupportConversations,
    refetchInterval: 15000 // Poll every 15s to keep it fresh
  });

  const activeId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3 items-center animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-500 text-sm text-center">تعذر جلب محادثات الدعم الفني.</div>;
  }

  const conversations = data?.items || data || [];

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <p className="text-gray-500 font-medium">لا توجد محادثات دعم فني حالياً</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      
      <div className="overflow-y-auto">
        {conversations.map((conv) => {
          const isActive = activeId === conv.id;
          
          return (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors flex gap-4 items-start ${
                isActive ? 'bg-blue-50 border-r-4 border-blue-600' : 'bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                {conv.latestMessage?.sender?.fullName ? conv.latestMessage.sender.fullName.slice(0, 2).toUpperCase() : 'U'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {conv.latestMessage?.sender?.fullName || 'مستخدم غير معروف'}
                  </h4>
                  {(conv.latestMessage?.createdAt || conv.lastMessageAt) && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap mr-2">
                      {new Date(conv.latestMessage?.createdAt || conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {conv.latestMessage?.body || 'بدأت المحادثة...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
