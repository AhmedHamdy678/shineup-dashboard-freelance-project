import axiosClient from '../axiosClient';

export const getFinanceOverview = async () => {
  const { data } = await axiosClient.get('/admin/finance/overview');
  return data;
};
