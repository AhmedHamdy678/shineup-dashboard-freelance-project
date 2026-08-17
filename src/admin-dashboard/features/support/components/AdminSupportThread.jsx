import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { MessageSquare, ShieldCheck, Clock, User, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import formatDate from '../../../../shared/utils/formatDate';
import useAuthStore from '../../../store/authStore';

const statusConfig = {
  UNASSIGNED: { label: 'تذكرة جديدة', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  WAITING_SUPPORT: { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  WAITING_REQUESTER: { label: 'بانتظار الرد', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  RESOLVED: { label: 'مغلقة', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function AdminSupportThread({ selectedConversation, onConversationUpdated }) {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuthStore();
  const currentAdminId = currentAdmin?.id;
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const isUnassigned = selectedConversation?.supportStatus === 'UNASSIGNED';
  const isResolved = selectedConversation?.supportStatus === 'RESOLVED';
  const conversationId = selectedConversation?.conversationId;

  // 1. Fetch Conversation Details
  const { data: conversationDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['admin-conversation-details', conversationId],
    queryFn: async () => {
      const res = await axiosClient.get(`/conversations/${conversationId}`);
      return res.data;
    },
    enabled: !!conversationId && !isUnassigned,
  });

  // 2. Fetch Messages
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading
  } = useInfiniteQuery({
    queryKey: ['admin-messages', conversationId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosClient.get(`/conversations/${conversationId}/messages`, {
        params: { page: pageParam, limit: 50 }
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.page < lastPage?.pagination?.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!conversationId && !isUnassigned,
    select: (data) => {
      // Flatten all pages into one array and sort by createdAt ascending (oldest first at top, newest at bottom)
      const allMessages = data.pages.flatMap((page) => page.items || page.data || []);
      return allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  });

  const messages = messagesData || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length, conversationId]);

  // 3. Mark as Read
  useEffect(() => {
    if (conversationId && !isUnassigned) {
      axiosClient.post(`/conversations/${conversationId}/read`)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'] });
        })
        .catch(err => console.error("Failed to mark as read", err));
    }
  }, [conversationId, isUnassigned, messages.length, queryClient]);

  // 4. Claim Mutation
  const claimMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosClient.post(`/admin/support-conversations/${id}/claim`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم استلام التذكرة بنجاح");
      if (onConversationUpdated) onConversationUpdated();
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error("عفواً، قام مشرف آخر باستلام هذه التذكرة قبلك!");
        if (onConversationUpdated) onConversationUpdated();
      } else {
        toast.error(error.response?.data?.message || error.message || "حدث خطأ أثناء استلام التذكرة");
      }
    }
  });

  // 5. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      const clientMessageId = crypto.randomUUID();
      const res = await axiosClient.post(`/conversations/${conversationId}/messages`, {
        body: text,
        clientMessageId
      });
      return res.data;
    },
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['admin-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "فشل إرسال الرسالة");
    }
  });

  // 6. Resolve Ticket Mutation
  const resolveMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post(`/admin/support-conversations/${conversationId}/resolve`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.resolvedNow || data?.supportStatus === 'RESOLVED') {
        toast.success("تم حل المشكلة وإغلاق التذكرة بنجاح");
      }
      queryClient.invalidateQueries({ queryKey: ['admin-conversation-details', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'] });
      if (onConversationUpdated) onConversationUpdated();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "حدث خطأ أثناء إغلاق التذكرة");
    }
  });

  const handleClaim = () => {
    if (!conversationId) return;
    claimMutation.mutate(conversationId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isUnassigned || isResolved) return;
    sendMessageMutation.mutate(inputText);
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-6 text-center" dir="rtl">
        <div className="w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300" />
        </div>
        <p className="text-xl font-bold text-gray-900 mb-2">صندوق الدعم الفني</p>
        <p className="text-sm">اختر تذكرة من القائمة لعرض التفاصيل والتواصل مع المزود</p>
      </div>
    );
  }

  const status = statusConfig[selectedConversation.supportStatus] || statusConfig.WAITING_SUPPORT;
  const assignedAdmin = conversationDetails?.assignedAdmin || selectedConversation.assignedAdmin;

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 shrink-0">
            {selectedConversation.requester?.avatarUrl ? (
              <img src={selectedConversation.requester.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedConversation.requester?.displayName || 'مزود خدمة'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              {selectedConversation.createdAt && (
                <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span dir="ltr">{formatDate(selectedConversation.createdAt, true)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {assignedAdmin && !isUnassigned && (
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <span className="text-gray-500 block text-[10px]">المشرف المسؤول:</span>
                <span className="font-semibold text-gray-900">{assignedAdmin.displayName || assignedAdmin.fullName || 'أنت'}</span>
              </div>
            </div>
          )}

          {!isUnassigned && !isResolved && (
            <button
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {resolveMutation.isPending ? 'جاري الإنهاء...' : 'إنهاء التذكرة'}
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#F0F2F5] flex flex-col p-4 custom-scrollbar">
         {isDetailsLoading || isMessagesLoading ? (
           <div className="space-y-4 w-full">
             <div className="flex gap-3">
               <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
               <div className="w-64 h-24 bg-gray-200 rounded-2xl rounded-tr-sm animate-pulse"></div>
             </div>
             <div className="flex gap-3 flex-row-reverse">
               <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
               <div className="w-48 h-16 bg-gray-200 rounded-2xl rounded-tl-sm animate-pulse"></div>
             </div>
           </div>
         ) : messages.length === 0 && !isUnassigned ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <div className="text-center text-gray-400">
               <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
               <p className="text-sm">لا توجد رسائل بعد. يمكنك بدء المحادثة الآن.</p>
             </div>
           </div>
         ) : (
           <>
             {hasNextPage && (
               <button 
                 onClick={() => fetchNextPage()} 
                 disabled={isFetchingNextPage}
                 className="mx-auto mb-4 px-3 py-1 text-xs bg-white text-blue-600 rounded-full shadow-sm hover:bg-blue-50"
               >
                 {isFetchingNextPage ? 'جاري التحميل...' : 'تحميل الرسائل السابقة'}
               </button>
             )}
             
             <div className="space-y-4">
               {messages.map((msg, idx) => {
                 const isAdmin = msg.senderUserId === currentAdminId;
                 return (
                   <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                       <span className="text-[10px] text-gray-500 mb-1 px-1 font-medium">
                         {msg.sender?.fullName || msg.sender?.name || (isAdmin ? 'أنت' : 'مزود الخدمة')}
                       </span>
                       <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                         isAdmin 
                           ? 'bg-blue-600 text-white rounded-tr-sm' 
                           : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                       }`}>
                         <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                         <div className={`text-[10px] mt-1 ${isAdmin ? 'text-blue-100 text-left' : 'text-gray-400 text-right'}`} dir="ltr">
                           {formatDate(msg.createdAt, true)}
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })}
               <div ref={messagesEndRef} />
             </div>
           </>
         )}
      </div>

      {/* Claim State CTA or Chat Input Area */}
      {isUnassigned ? (
        <div className="p-6 bg-amber-50 border-t border-amber-200 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-amber-900 font-bold">تذكرة جديدة غير مسندة</h4>
                <p className="text-amber-700 text-sm mt-0.5">هذه التذكرة جديدة ولم يتم استلامها بعد من قبل أي مشرف.</p>
              </div>
            </div>
            
            <button
              onClick={handleClaim}
              disabled={claimMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {claimMutation.isPending ? 'جاري الاستلام...' : 'استلام التذكرة وبدء الرد'}
            </button>
          </div>
        </div>
      ) : isResolved ? (
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            تم إغلاق هذه التذكرة. لا يمكن إرسال المزيد من الرسائل.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 shrink-0 z-10">
           <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
             <textarea
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="اكتب ردك هنا..."
               className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-3 text-sm text-gray-800 placeholder-gray-400 custom-scrollbar"
               rows={1}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSendMessage(e);
                 }
               }}
             />
             <button
               type="submit"
               disabled={!inputText.trim() || sendMessageMutation.isPending}
               className="w-10 h-10 mb-0.5 rounded-lg flex items-center justify-center shrink-0 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
             >
               {sendMessageMutation.isPending ? (
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                 <Send className="w-4 h-4 rtl:rotate-180" />
               )}
             </button>
           </div>
        </form>
      )}
    </div>
  );
}
