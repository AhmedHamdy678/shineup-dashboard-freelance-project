/**
 * Chat API service for the Owner Provider Dashboard.
 */
import providerAxiosClient from './providerAxiosClient';

/**
 * Fetch paginated conversations for the currently authenticated provider.
 * Endpoint: GET /api/v1/conversations?type={type}&page={page}&limit={limit}
 * 
 * @param {{ type?: string, page?: number, limit?: number }} params
 */
export async function getConversations(params = { type: 'PROVIDER_SUPPORT', page: 1, limit: 20 }) {
  const { data } = await providerAxiosClient.get('/conversations', {
    params: {
      ...params,
    },
  });
  return data?.data || data;
}

/**
 * Fetch paginated messages for a specific conversation.
 * Endpoint: GET /api/v1/conversations/{conversationId}/messages
 * 
 * @param {string} conversationId
 * @param {number} page 
 * @param {number} limit 
 */
export async function getConversationMessages(conversationId, page = 1, limit = 30) {
  const { data } = await providerAxiosClient.get(`/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });
  return data?.data || data;
}

/**
 * Create a new conversation.
 * Endpoint: POST /api/v1/conversations
 * 
 * @param {Object} payload 
 * @param {string} payload.type
 * @param {string} payload.providerId
 * @param {string} [payload.providerMemberId]
 * @param {string} payload.message
 */
export async function createConversation({ type = 'PROVIDER_SUPPORT', providerId, providerMemberId, message }) {
  const payload = { type, providerId, message };
  if (providerMemberId) payload.providerMemberId = providerMemberId;

  const { data } = await providerAxiosClient.post('/conversations', payload);
  return data;
}

/**
 * Send a message to an existing conversation.
 * Endpoint: POST /api/v1/conversations/{conversationId}/messages
 * 
 * @param {Object} payload 
 * @param {string} payload.conversationId
 * @param {string} payload.body
 */
export async function sendMessage({ conversationId, body }) {
  const { data } = await providerAxiosClient.post(`/conversations/${conversationId}/messages`, {
    body,
  });
  return data;
}
