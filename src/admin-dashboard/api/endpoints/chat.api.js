import axiosClient from '../axiosClient';
import { mockConversations, mockMessages } from '../../mocks/chat.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getConversations = async () => {
  if (useMock) return Promise.resolve(mockConversations);
  const { data } = await axiosClient.get('/admin/conversations');
  return data;
};

export const getSupportConversations = async () => {
  const { data } = await axiosClient.get('/conversations?type=SUPPORT');
  return data;
};

export const getMessageHistory = async (conversationId, cursor = null, limit = 30) => {
  if (useMock) return Promise.resolve({ items: mockMessages[conversationId] ?? [] });
  
  const params = new URLSearchParams({
    mode: 'cursor',
    limit: limit.toString(),
  });
  if (cursor) {
    params.append('beforeMessageId', cursor);
  }
  
  const { data } = await axiosClient.get(`/conversations/${conversationId}/messages?${params.toString()}`);
  return data;
};

export const getConversationDetails = async (conversationId) => {
  const { data } = await axiosClient.get(`/conversations/${conversationId}`);
  return data;
};

export const sendMessage = async (conversationId, payload) => {
  const { data } = await axiosClient.post(`/conversations/${conversationId}/messages`, payload);
  return data;
};
