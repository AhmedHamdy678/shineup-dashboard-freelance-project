import providerAxiosClient from '../providerAxiosClient';

export async function getTeamMembers() {
  const { data } = await providerAxiosClient.get('/provider/team');
  return data;
}

export async function inviteTeamMember(payload) {
  const { data } = await providerAxiosClient.post('/provider/team/invite', payload);
  return data;
}

export async function removeTeamMember(id) {
  const { data } = await providerAxiosClient.delete(`/provider/team/${id}`);
  return data;
}
