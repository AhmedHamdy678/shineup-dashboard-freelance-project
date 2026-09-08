/**
 * React Query mutation hooks for authentication flows.
 *
 * Covers:
 *  - useForgotPassword  → POST /auth/password/forgot
 *  - useResetPassword   → POST /auth/password/reset
 *  - useVerifyOtp       → POST /auth/otp/verify
 *
 * Error handling is delegated to the global Axios interceptor in axiosClient.js.
 * Each hook also exposes `error` so callers can render inline messages if needed.
 */
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../api/axiosClient';
import {
  forgotPassword,
  resetPassword,
  verifyOtp as verifyOtpApi,
} from '../api/endpoints/auth.api';

// ── Forgot Password ────────────────────────────────────────────────────────

/**
 * Sends an OTP to the given identifier (phone number).
 *
 * Usage:
 *   const { mutate, isPending, error } = useForgotPassword({
 *     onSuccess: (data) => setStep(2),
 *   });
 *   mutate(identifier);
 */
export function useForgotPassword(options = {}) {
  return useMutation({
    mutationFn: (identifier) => forgotPassword(identifier),
    onSuccess: (data, ...args) => {
      toast.success(data?.message || 'تم إرسال رمز التحقق إلى هاتفك.');
      options.onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      toast.error(getApiErrorMessage(error, 'فشل إرسال رمز التحقق'));
      options.onError?.(error, ...args);
    },
  });
}

// ── Reset Password ─────────────────────────────────────────────────────────

/**
 * Resets the password using the OTP code received via SMS.
 *
 * Usage:
 *   const { mutate, isPending, error } = useResetPassword({
 *     onSuccess: () => navigate('/login'),
 *   });
 *   mutate({ identifier, code, newPassword });
 */
export function useResetPassword(options = {}) {
  return useMutation({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: (data, ...args) => {
      toast.success(data?.message || 'تم تغيير كلمة المرور بنجاح.');
      options.onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      toast.error(getApiErrorMessage(error, 'فشل تغيير كلمة المرور'));
      options.onError?.(error, ...args);
    },
  });
}

// ── Verify OTP ─────────────────────────────────────────────────────────────

/**
 * Verifies a one-time password code for a specific userId.
 *
 * Usage:
 *   const { mutate, isPending, error } = useVerifyOtp({
 *     onSuccess: (data) => { /* proceed to next step *\/ },
 *   });
 *   mutate({ userId, code });
 *
 * @param {object}   options
 * @param {function} [options.onSuccess]  - called with (data) on success
 * @param {function} [options.onError]    - called with (error) on failure
 * @param {boolean}  [options.silent]     - if true, suppresses the success toast
 */
export function useVerifyOtp(options = {}) {
  return useMutation({
    mutationFn: (payload) => verifyOtpApi(payload),
    onSuccess: (data, ...args) => {
      if (!options.silent) {
        toast.success(data?.message || 'تم التحقق بنجاح.');
      }
      options.onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      toast.error(getApiErrorMessage(error, 'فشل التحقق من الرمز'));
      options.onError?.(error, ...args);
    },
  });
}
