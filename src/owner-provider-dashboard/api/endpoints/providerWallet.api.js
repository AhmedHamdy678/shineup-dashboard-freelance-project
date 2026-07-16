import providerAxiosClient from '../providerAxiosClient';

export async function getWalletOverview() {
  const { data } = await providerAxiosClient.get('/providers/me/wallet');
  return data;
}

export async function requestWithdrawal(payload, idempotencyKey) {
  const { data } = await providerAxiosClient.post('/providers/me/withdrawals', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });
  return data;
}

export async function getWithdrawalHistory(page = 1) {
  const { data } = await providerAxiosClient.get(`/providers/me/withdrawals?page=${page}&limit=10`);
  return data;
}

export async function getPayoutMethods() {
  const { data } = await providerAxiosClient.get('/providers/me/payout-methods');
  return data;
}

export async function addPayoutMethod(payload, idempotencyKey) {
  const { data } = await providerAxiosClient.post('/providers/me/payout-methods', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });
  return data;
}
