import { useMutation } from '@tanstack/react-query';
import {
  registerProvider,
  verifyProviderOTP,
  resendProviderOTP,
} from '../../../api/endpoints/providerAuth.api';

export function useRegister() {
  return useMutation({
    mutationFn: (payload) => registerProvider(payload),
  });
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: (payload) => verifyProviderOTP(payload),
  });
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (payload) => resendProviderOTP(payload),
  });
}
