import providerAxiosClient from '../providerAxiosClient';

export const registerProvider = async (payload) => {
  const { data } = await providerAxiosClient.post('/auth/register', payload);
  return data;
};

export const verifyProviderOTP = async (payload) => {
  const { data } = await providerAxiosClient.post('/auth/otp/verify', payload);
  return data;
};

export const resendProviderOTP = async (payload) => {
  const { data } = await providerAxiosClient.post('/auth/phone/resend-verification', payload);
  return data;
};

export const providerLogin = async (phone, password) => {
  const { data } = await providerAxiosClient.post('/auth/login', {
    identifier: phone,
    password,
  });
  return { token: data.accessToken, user: data.user };
};

export const providerLogout = async () => {
  const { data } = await providerAxiosClient.post('/auth/logout');
  return data;
};
