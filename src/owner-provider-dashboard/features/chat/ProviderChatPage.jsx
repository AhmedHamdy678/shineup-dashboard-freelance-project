// Trigger Vite watcher rebuild - update 3
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import NewInternalChatModal from "./components/NewInternalChatModal";
import { useProviderConversations, useCreateConversation, useSendMessage } from "./useProviderChat";
import useProviderAuthStore from "../../store/providerAuthStore";
import { useDashboardOverview } from "../dashboard/useDashboardOverview";
import { useTeam } from "../team/useTeam";
import useChatStore from "../../../admin-dashboard/store/chatStore";

export default function ProviderChatPage() {
  const [activeTab, setActiveTab] = useState("ADMIN"); // "ADMIN" or "TEAM"
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const { user } = useProviderAuthStore();
  const setActiveConversationInStore = useChatStore((s) => s.setActiveConversation);
  
  // Fetch dashboard data safely to ensure we have the providerId
  const { data: dashboardData } = useDashboardOverview();
  const safeProviderId = dashboardData?.provider?.id || user?.provider?.id || user?.providerId || user?.id;

  // Fetch Team Members
  const { data: teamMembersData } = useTeam();
  const members = Array.isArray(teamMembersData) ? teamMembersData : (teamMembersData?.items || []);

  // Fetch real data for both tabs
  const type = activeTab === "ADMIN" ? "PROVIDER_SUPPORT" : "PROVIDER_INTERNAL";
  const { 
    conversations: backendConversations, 
    pagination, 
    isLoading: isConversationsLoading 
  } = useProviderConversations(type, currentPage, 20);

  // Filter conversations based on current tab and search query
  const displayedConversations = backendConversations.filter((conv) => {
    if (!searchQuery) return true;
    const participantName = conv.participant?.name || conv.sender?.fullName || "";
    const lastMessage = conv.latestMessage?.body || conv.latestMessage?.text || "";
    return participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // When activeTab changes or displayed list changes, validate activeId
  useEffect(() => {
    if (displayedConversations.length > 0) {
      if (activeId && activeId !== "NEW") {
        const exists = displayedConversations.some((c) => c.id === activeId);
        if (!exists) {
          setActiveId(null);
          setActiveConversationInStore(null);
        }
      }
    } else {
      if (activeId !== "NEW") {
        setActiveId(null);
        setActiveConversationInStore(null);
      }
    }
  }, [activeTab, displayedConversations, activeId]);

  // Sync activeId → chatStore so useChatSocket emits conversation:join/leave
  useEffect(() => {
    setActiveConversationInStore(activeId !== "NEW" ? activeId : null);
  }, [activeId, setActiveConversationInStore]);

  // Find currently active conversation
  const activeConversation = displayedConversations.find((c) => c.id === activeId);

  const { mutate: createConversation, isLoading: isCreating } = useCreateConversation();
  const { mutate: sendMessageMutation, isLoading: isSendingMessage } = useSendMessage();

  // Handle sending a message
  const handleSendMessage = (convId, text, onSuccessCallback) => {
    if (convId === "NEW") {
      if (!safeProviderId) {
        toast.error('تعذر العثور على معرف مزود الخدمة. يرجى إعادة تحميل الصفحة.');
        return;
      }
      
      // Create new SUPPORT conversation (TEAM is handled by Modal)
      createConversation(
        { 
          type: "PROVIDER_SUPPORT", 
          providerId: safeProviderId, 
          message: text
        },
        {
          onSuccess: (response) => {
            // Extract conversation safely
            const createdConv = response?.conversation || response?.data?.conversation;
            
            if (createdConv?.id) {
              setActiveId(createdConv.id);
              if (onSuccessCallback) onSuccessCallback();
            } else {
              toast.error('تم الإنشاء لكن لم يتم استلام معرف المحادثة. يرجى تحديث الصفحة.');
            }
          },
          onError: (err) => {
            console.error("Failed to create conversation", err);
            toast.error(err?.response?.data?.message || 'فشل إنشاء المحادثة');
          }
        }
      );
    } else {
      // Call API to send a message to an existing conversation
      sendMessageMutation(
        { conversationId: convId, body: text },
        {
          onSuccess: () => {
            if (onSuccessCallback) onSuccessCallback();
          },
          onError: (err) => {
            console.error("Failed to send message", err);
            toast.error(err?.response?.data?.message || 'فشل إرسال الرسالة');
          }
        }
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm relative">
      <ChatSidebar
        conversations={displayedConversations}
        activeId={activeId}
        onSelect={(id) => {
          if (id === "NEW" && activeTab === "TEAM") {
            setIsTeamModalOpen(true);
          } else {
            setActiveId(id);
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isConversationsLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
        currentUserId={user?.id}
        members={members}
      />
      <ChatWindow
        selectedConversationId={activeId}
        currentUserId={user?.id}
        activeConversation={activeConversation}
        onSendMessage={handleSendMessage}
        isCreating={isCreating || isSendingMessage}
        isTeamChat={activeTab === "TEAM"}
        members={members}
      />

      <NewInternalChatModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        members={members}
        providerId={safeProviderId}
        onSuccess={(newConvId) => {
          setActiveId(newConvId);
        }}
      />
    </div>
  );
}
