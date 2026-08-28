import React, { useRef, useEffect, useState } from 'react';
import { Send, MessageSquare, PlusCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConversationMessages } from '../useConversationMessages';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ 
  selectedConversationId, 
  currentUserId, 
  activeConversation, 
  onSendMessage, 
  isCreating,
  isTeamChat,
  members = []
}) {
  const { data, isLoading } = useConversationMessages(selectedConversationId !== "NEW" ? selectedConversationId : null);
  const messagesEndRef = useRef(null);
  const [text, setText] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  
  // Use backend data if available, otherwise fallback to activeConversation messages
  const messages = selectedConversationId === "NEW" ? [] : (data?.items || activeConversation?.messages || []);
  const conversationMeta = selectedConversationId === "NEW" ? { title: isTeamChat ? "محادثة جديدة مع الفريق" : "تذكرة دعم جديدة", status: "NEW" } : (data?.conversation || activeConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isCreating) return;
    if (selectedConversationId === "NEW" && isTeamChat && !selectedMemberId) {
      toast.error('يرجى اختيار عضو من الفريق للبدء بالمحادثة');
      return;
    }
    
    // Pass a callback to clear the text only if the message is sent successfully
    onSendMessage(selectedConversationId, text.trim(), () => {
      setText("");
      if (selectedConversationId === "NEW") {
        setSelectedMemberId("");
      }
    }, selectedMemberId);
  };

  if (!selectedConversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {isTeamChat ? 'محادثات فريق العمل' : 'صندوق بريد الدعم'}
        </h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm text-center mb-6">
          اختر محادثة من القائمة لعرض رسائلك والتواصل.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50/30 rounded-2xl border border-gray-200 overflow-hidden relative">
      {/* Header */}
      <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            {selectedConversationId === "NEW" ? <PlusCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {(() => {
                if (selectedConversationId === "NEW") {
                  return isTeamChat ? 'محادثة جديدة' : 'تذكرة دعم جديدة';
                }
                if (conversationMeta?.type === "PROVIDER_INTERNAL") {
                  const memberParticipant = conversationMeta.participants?.find(p => p.providerMemberId);
                  let memberInfo = null;
                  if (memberParticipant?.providerMemberId) {
                    memberInfo = members?.find(m => m.id === memberParticipant.providerMemberId);
                  }

                  const otherParticipant = conversationMeta.participants?.find(p => p.userId !== currentUserId) || conversationMeta.participants?.[0];
                  
                  return memberInfo?.name
                      || memberInfo?.displayName
                      || memberInfo?.user?.fullName
                      || otherParticipant?.user?.fullName 
                      || otherParticipant?.user?.name
                      || otherParticipant?.fullName
                      || otherParticipant?.displayName
                      || otherParticipant?.name 
                      || conversationMeta.participant?.name
                      || conversationMeta.sender?.fullName
                      || "محادثة مع عضو";
                }
                return conversationMeta?.title 
                    || (conversationMeta?.createdAt 
                        ? `تذكرة - ${new Date(conversationMeta.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` 
                        : 'محادثة دعم');
              })()}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedConversationId === "NEW" ? 'أرسل رسالة للبدء' : (conversationMeta?.status === 'OPEN' ? 'محادثة مفتوحة' : (conversationMeta?.status === 'CLOSED' ? 'محادثة مغلقة' : 'نشط'))}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col">
        {isLoading && selectedConversationId !== "NEW" ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="h-16 w-64 bg-gray-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="text-sm">لا توجد رسائل بعد. أرسل رسالة لبدء المحادثة.</p>
          </div>
        ) : (
          <div className="flex flex-col mt-auto">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderUserId === currentUserId;
              const isRead = conversationMeta?.participants?.some(participant => 
                participant.userId !== currentUserId && 
                participant.lastReadAt && 
                new Date(participant.lastReadAt) >= new Date(msg.createdAt)
              );

              return (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isOwnMessage={isOwnMessage} 
                  isRead={isRead}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form className="flex items-end gap-2" onSubmit={handleSubmit}>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="اكتب رسالتك هنا..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none max-h-32 min-h-[48px] disabled:opacity-50 disabled:bg-gray-100"
              rows={1}
            />
          </div>
          <button 
            type="submit"
            disabled={!text.trim() || isCreating}
            className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed rtl:rotate-180"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin rtl:rotate-180" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
