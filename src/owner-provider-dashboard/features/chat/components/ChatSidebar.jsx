// Trigger Vite watcher rebuild
import { useState } from "react";
import { Search, LifeBuoy, Users, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isLoading,
  currentPage,
  setCurrentPage,
  pagination,
  currentUserId,
  members = []
}) {
  // Format dates nicely
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      
      if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  return (
    <aside className="w-[320px] flex flex-col bg-white border-r rtl:border-r-0 rtl:border-l border-gray-200 h-full shrink-0">
      {/* Header and Search */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="relative">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن محادثة..."
            className="w-full ltr:pl-9 ltr:pr-4 rtl:pr-9 rtl:pl-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Segmented Control (Tabs) */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab("ADMIN"); setCurrentPage?.(1); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === "ADMIN"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            الدعم والإدارة
          </button>
          <button
            onClick={() => { setActiveTab("TEAM"); setCurrentPage?.(1); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === "TEAM"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            الفريق
          </button>
        </div>

        <button 
          onClick={() => onSelect("NEW")}
          className={`w-full flex items-center justify-center gap-2 py-2 mt-2 text-xs font-bold rounded-lg border transition-colors ${
            activeTab === "ADMIN" 
              ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" 
              : "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
          }`}
        >
          <span>{activeTab === "ADMIN" ? "+ تذكرة دعم جديدة" : "+ محادثة جديدة مع فريقك"}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-400 font-medium mt-2">جاري التحميل...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
            <p className="text-sm text-gray-500 font-medium mb-3">لا توجد محادثات مطابقة</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            let hasUnread = false;
            let chatName = "";
            let snippet = "";
            let time = "";
            let avatarInitials = "";
            
            // Map colors to names to look beautiful
            const bgColors = [
              "bg-blue-50 text-blue-600 border-blue-100",
              "bg-purple-50 text-purple-600 border-purple-100",
              "bg-rose-50 text-rose-600 border-rose-100",
              "bg-amber-50 text-amber-600 border-amber-100",
              "bg-indigo-50 text-indigo-600 border-indigo-100",
            ];

            const createdAtDate = conv.createdAt ? new Date(conv.createdAt) : new Date();
            time = conv.lastMessageAt || conv.createdAt || conv.lastMessageTime;
            snippet = conv.latestMessage?.body || conv.latestMessage?.text || conv.lastMessage?.body || conv.message?.body || conv.lastMessage || "بدء محادثة جديدة";

            if (conv.type === "PROVIDER_SUPPORT") {
              chatName = `تذكرة - ${createdAtDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
              avatarInitials = "د";
            } else if (conv.type === "PROVIDER_INTERNAL") {
              // The API may not return participant names, but it does return providerMemberId!
              const memberParticipant = conv.participants?.find(p => p.providerMemberId);
              let memberInfo = null;
              if (memberParticipant?.providerMemberId) {
                memberInfo = members?.find(m => m.id === memberParticipant.providerMemberId);
              }
              
              const otherParticipant = conv.participants?.find(p => p.userId !== currentUserId) || conv.participants?.[0];

              chatName = memberInfo?.name
                      || memberInfo?.displayName
                      || memberInfo?.user?.fullName
                      || otherParticipant?.user?.fullName 
                      || otherParticipant?.user?.name
                      || otherParticipant?.fullName
                      || otherParticipant?.displayName
                      || otherParticipant?.name 
                      || conv.participant?.name
                      || conv.sender?.fullName
                      || "عضو";
              avatarInitials = chatName.charAt(0);
            } else {
              // Fallback
              chatName = conv.participant?.name || "محادثة";
              avatarInitials = chatName.charAt(0);
            }
              
            // Unread Logic
            const me = conv.participants?.find(p => p.userId === currentUserId);
            if (me) {
              if (!me.lastReadAt) hasUnread = true;
              else {
                const readTime = new Date(me.lastReadAt).getTime();
                const msgTime = new Date(conv.lastMessageAt).getTime();
                if (readTime < msgTime) hasUnread = true;
              }
            } else if (conv.unreadCount > 0) {
              hasUnread = true;
            }

            const colorIndex = chatName.charCodeAt(0) % bgColors.length;
            const avatarColor = bgColors[colorIndex];

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer border-l-2 transition-all ${
                  isActive
                    ? "bg-emerald-50/40 border-l-emerald-600 border-y-transparent"
                    : "border-l-transparent hover:bg-gray-50/70"
                }`}
              >
                {/* Avatar with Initials */}
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-sm ${avatarColor}`}>
                    {avatarInitials}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-semibold truncate ${isActive ? "text-emerald-950" : "text-gray-900"}`}>
                      {chatName}
                    </h3>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                      {formatTime(time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p dir="auto" className={`text-start truncate text-xs flex-1 ${hasUnread ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                      {snippet}
                    </p>
                    {hasUnread && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-emerald-600 rounded-full shrink-0">
                        {activeTab === "ADMIN" ? "جديد" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls for ADMIN Tab */}
      {activeTab === "ADMIN" && pagination && pagination.total > pagination.limit && (
        <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-xs font-medium text-gray-500">
            صفحة {currentPage} من {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button 
            disabled={currentPage >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
}
