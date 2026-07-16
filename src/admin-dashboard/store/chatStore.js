import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  messagesByConversation: {},

  activeConversationId: null,

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setHistory: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  appendMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...existing, message],
        },
      };
    }),

  getActiveMessages: () => {
    const { messagesByConversation, activeConversationId } = get();
    return messagesByConversation[activeConversationId] ?? [];
  },
}));

export default useChatStore;
