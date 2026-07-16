import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWalletOverview, requestWithdrawal, getWithdrawalHistory, getPayoutMethods, addPayoutMethod } from "../../api/endpoints/providerWallet.api";

export function useWallet() {
  return useQuery({
    queryKey: ["provider-wallet"],
    queryFn: getWalletOverview,
    staleTime: 1000 * 60,
  });
}

export function useWithdrawalHistory(page = 1) {
  return useQuery({
    queryKey: ["provider-withdrawals", page],
    queryFn: () => getWithdrawalHistory(page),
    staleTime: 1000 * 60,
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => requestWithdrawal(payload, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["provider-withdrawals"] });
    },
  });
}

export function usePayoutMethods() {
  return useQuery({
    queryKey: ["provider-payout-methods"],
    queryFn: getPayoutMethods,
    staleTime: 1000 * 60,
  });
}

export function useAddPayoutMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => addPayoutMethod(payload, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-payout-methods"] });
    },
  });
}
