import React, { useEffect, useRef, useState, useMemo } from 'react';
import SupportConversationsList from './SupportConversationsList';
import useChatStore from '../../../store/chatStore';
import useAuthStore from '../../../store/authStore';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversationDetails, getMessageHistory, sendMessage } from '../../../api/endpoints/chat.api';
import { useChatSocket } from '../useChatSocket';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChatPage() {
  useChatSocket();

  const activeId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('CUSTOMER'); // 'CUSTOMER' | 'PROVIDER'
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // 1. Fetch metadata (Header)
  const { data: conversationData } = useQuery({
    queryKey: ['conversation', activeId],
    queryFn: () => getConversationDetails(activeId),
    enabled: !!activeId,
  });

  // 2. Fetch messages (Infinite Scroll)
  const { 
    data: messagesData, 
    isLoading: isMessagesLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['messages', activeId],
    queryFn: ({ pageParam = 1 }) => getMessageHistory(activeId, pageParam, 30),
    getNextPageParam: (lastPage) => {
      const { page, total, limit } = lastPage?.pagination || {};
      const totalPages = Math.ceil((total || 0) / (limit || 30));
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!activeId,
    refetchInterval: 5000 // Temporary polling
  });

  const displayMessages = useMemo(() => {
    if (!messagesData) return [];
    const allMessages = messagesData.pages.flatMap((page) => page.items || []);
    // Sort chronologically (oldest first, newest at the bottom)
    return allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messagesData]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (body) => sendMessage(activeId, { body }),
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      queryClient.invalidateQueries({ queryKey: ['support-conversations'] });
      // The auto-scroll hook will trigger automatically when messages array length increases
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(`حدث خطأ أثناء إرسال الرسالة: ${msg}`);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(inputText.trim());
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (activeId) {
      setActiveConversation(null); // Reset active conversation when switching tabs
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-xl border border-gray-200 overflow-hidden m-6 shadow-sm">
      {/* Left Pane (Sidebar) */}
      <div className="w-1/3 flex flex-col border-l border-gray-200 bg-gray-50 overflow-hidden">
        {/* Tabs UI */}
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-20">
          <h3 className="text-lg font-bold text-gray-800 mb-4">المحادثات</h3>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleTabChange('CUSTOMER')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'CUSTOMER'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              العملاء
            </button>
            <button
              onClick={() => handleTabChange('PROVIDER')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'PROVIDER'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              مقدمو الخدمات
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'CUSTOMER' ? (
            <SupportConversationsList />
          ) : (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <p className="text-gray-500 font-medium">سيتم ربط محادثات مقدمي الخدمات قريباً</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane (Main Area) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {activeId ? (
          <>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 bg-white">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {conversationData?.participantName || 'محادثة الدعم الفني'}
                </h2>
                <span className="text-xs text-gray-500">رقم التذكرة: {activeId.slice(0, 8)}</span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">مفتوحة</span>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">جاري تحميل الرسائل...</span>
                  </div>
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  لا توجد رسائل في هذه المحادثة حتى الآن.
                </div>
              ) : (
                <>
                  {hasNextPage && (
                    <div className="flex justify-center mb-4">
                      <button 
                        onClick={() => fetchNextPage()} 
                        disabled={isFetchingNextPage}
                        className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            جاري التحميل...
                          </>
                        ) : 'تحميل الرسائل السابقة'}
                      </button>
                    </div>
                  )}
                  {displayMessages.map((msg) => {
                    const isAdmin = (user?.id && (msg.sender?.id === user.id || msg.senderUserId === user.id)) || 
                                    msg.sender?.roles?.some(r => r.name?.toLowerCase() === 'admin' || r.name?.toLowerCase() === 'super_admin') ||
                                    msg.senderRole?.toUpperCase() === 'ADMIN' || 
                                    msg.sender?.role?.toUpperCase() === 'ADMIN' || 
                                    msg.sender?.role?.toUpperCase() === 'SUPER_ADMIN' ||
                                    msg.senderType?.toUpperCase() === 'ADMIN' ||
                                    msg.sender?.fullName?.toLowerCase().includes('admin');
                    
                    return (
                      <div key={msg.id || Math.random()} className={`flex flex-col max-w-[75%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className="text-xs text-gray-400 mb-1 mx-1">
                          {isAdmin ? 'أنت' : (msg.sender?.fullName || 'مستخدم')}
                        </div>
                        <div 
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isAdmin 
                              ? 'bg-blue-600 text-white rounded-tr-sm' 
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                          }`}
                        >
                          {msg.body}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 mx-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all overflow-hidden">
                  <textarea
                    rows="1"
                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none max-h-32"
                    placeholder="اكتب رسالتك هنا..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim() || sendMessageMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white p-3 rounded-xl transition-colors flex shrink-0 items-center justify-center shadow-sm"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin rtl:-scale-x-100" />
                  ) : (
                    <Send className="w-5 h-5 rtl:-scale-x-100" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 bg-slate-50">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className="text-lg font-medium text-gray-500">اختر محادثة للبدء</p>
            <p className="text-sm mt-2 text-center max-w-sm">قم بتحديد إحدى المحادثات من القائمة الجانبية لعرض الرسائل والرد عليها.</p>
          </div>
        )}
      </div>
    </div>
  );
}
