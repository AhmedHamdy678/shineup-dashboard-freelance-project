import providerAxiosClient from './providerAxiosClient';
import {
  getMockMembers,
  addMockMember,
  updateMockMember,
  deleteMockMember
} from '../mocks/team.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export async function getMembers() {
  if (useMock) {
    return Promise.resolve(getMockMembers());
  }
  const { data } = await providerAxiosClient.get('/providers/me/members');
  return (data.items || []).map((item) => ({
    id: item.id,
    userId: item.userId,
    name: item.displayName,
    email: item.user?.email || '',
    phone: item.user?.phone || '',
    status: item.statusCode,
    userIsActive: item.user?.isActive,
    joinedAt: item.joinedAt,
  }));
}

export async function addMember(payload) {
  if (useMock) {
    return Promise.resolve(addMockMember(payload));
  }
  const { data } = await providerAxiosClient.post('/providers/me/members', {
    fullName: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
  });
  const m = data.member;
  return {
    id: m.id,
    name: m.displayName || m.user?.fullName,
    email: m.user?.email || '',
    phone: m.user?.phone || '',
    status: m.statusCode,
    userIsActive: m.user?.isActive,
    joinedAt: m.joinedAt,
  };
}

export async function updateMember({ id, ...payload }) {
  if (useMock) {
    return Promise.resolve(updateMockMember(id, payload));
  }
  const body = {
    fullName: payload.name,
    email: payload.email,
    phone: payload.phone,
  };
  if (payload.status) body.statusCode = payload.status;
  const { data } = await providerAxiosClient.patch(`/providers/me/members/${id}`, body);
  return data;
}

export async function deleteMember(id) {
  if (useMock) {
    return Promise.resolve(deleteMockMember(id));
  }
  const { data } = await providerAxiosClient.delete(`/providers/me/members/${id}`);
  return data;
}

export async function activateMember(id) {
  const { data } = await providerAxiosClient.post(`/providers/me/members/${id}/activate`);
  return data;
}

export async function suspendMember(id) {
  const { data } = await providerAxiosClient.post(`/providers/me/members/${id}/suspend`);
  return data;
}

export async function getMemberAnalytics(id) {
  if (useMock) {
    // Return empty mock for now
    return Promise.resolve({
      member: { displayName: "Mock User", user: {} },
      period: { from: new Date().toISOString(), to: new Date().toISOString() },
      summary: {},
      dailyBreakdown: [],
      recentSessions: []
    });
  }
  const { data } = await providerAxiosClient.get(`/providers/me/dashboard/staff-analytics/${id}`);
  return data;
}
