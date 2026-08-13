import React, { useState } from 'react';
import ConversationInbox from './ConversationInbox';
import ConversationThread from './ConversationThread';
import useProviderAuthStore from '../../../store/providerAuthStore';

export default function SupportChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  
  // Safe extraction of providerId depending on the auth store structure
  const { user } = useProviderAuthStore();
  const providerId = user?.provider?.id || user?.providerId || user?.id;

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm relative" dir="rtl">
      {/* Left Pane - Inbox */}
      <div className={`w-full md:w-1/3 border-l border-gray-200 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationInbox 
          selectedConversationId={selectedConversationId} 
          setSelectedConversationId={setSelectedConversationId}
          providerId={providerId}
        />
      </div>

      {/* Right Pane - Thread */}
      <div className={`w-full md:w-2/3 flex flex-col bg-gray-50 relative ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversationId ? (
          <ConversationThread 
            selectedConversationId={selectedConversationId} 
            onBack={() => setSelectedConversationId(null)}
            currentUserId={user?.id}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">دعم ShineUp الفني</p>
            <p className="text-sm">اختر محادثة من القائمة أو ابدأ تذكرة جديدة للتواصل مع فريق الدعم.</p>
          </div>
        )}
      </div>
    </div>
  );
}
