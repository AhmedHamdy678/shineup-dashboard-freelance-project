import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { KeyRound, ShieldCheck, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Modal from '../../../shared/components/ui/Modal';
import useProviderAuthStore from '../../store/providerAuthStore';
import {
  forgotProviderPassword,
  resetProviderPassword,
} from '../../api/endpoints/providerAuth.api';

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step > s ? <CheckCircle className="w-4 h-4" /> : s}
          </div>
          {s < 2 && (
            <div
              className={`w-12 h-0.5 rounded transition-all ${
                step > s ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Password visibility toggle input ─────────────────────────────────────────
function PasswordInput({ id, placeholder, value, onChange, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400 pr-10"
        dir="ltr"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ChangePasswordModal({ onClose }) {
  const user = useProviderAuthStore((s) => s.user);
  const identifier = user?.phone || user?.email || user?.identifier || '';

  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const sendOtpMutation = useMutation({
    mutationFn: () => forgotProviderPassword(identifier),
    onSuccess: () => {
      toast.success('تم إرسال رمز التحقق بنجاح');
      setStep(2);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || 'حدث خطأ أثناء إرسال رمز التحقق';
      toast.error(msg);
    },
  });

  // ── Auto-fire OTP on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (identifier) {
      sendOtpMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 2: Reset password ──────────────────────────────────────────────────
  const resetMutation = useMutation({
    mutationFn: (payload) => resetProviderPassword(payload),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      onClose();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        'حدث خطأ أثناء تغيير كلمة المرور. تحقق من الرمز وحاول مجدداً.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!otpCode.trim()) {
      setPasswordError('يرجى إدخال رمز التحقق');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    resetMutation.mutate({
      identifier,
      code: otpCode.trim(),
      newPassword,
    });
  };

  const isLoading = sendOtpMutation.isPending || resetMutation.isPending;

  return (
    <Modal title="تغيير كلمة المرور" onClose={() => !isLoading && onClose()} size="sm">
      <StepIndicator step={step} />

      {/* ── Step 1: Sending OTP ── */}
      {step === 1 && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {sendOtpMutation.isPending ? (
            <>
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-500">جارٍ إرسال رمز التحقق إلى رقمك المسجل…</p>
            </>
          ) : sendOtpMutation.isError ? (
            <>
              <p className="text-sm text-red-500">تعذر إرسال رمز التحقق.</p>
              <button
                onClick={() => sendOtpMutation.mutate()}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                إعادة الإرسال
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* ── Step 2: OTP + New Password Form ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              تم إرسال رمز التحقق إلى رقمك المسجل. أدخله أدناه مع كلمة المرور الجديدة.
            </p>
          </div>

          {/* OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رمز التحقق (OTP) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="xxxxxx"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              disabled={resetMutation.isPending}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest font-mono disabled:bg-gray-50"
              dir="ltr"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور الجديدة <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="new-password"
              placeholder="8 أحرف على الأقل"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={resetMutation.isPending}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="confirm-password"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={resetMutation.isPending}
            />
          </div>

          {/* Validation error */}
          {passwordError && (
            <p className="text-xs text-red-500 font-medium">{passwordError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ التغيير…
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  تغيير كلمة المرور
                </>
              )}
            </button>
          </div>

          {/* Resend OTP */}
          <p className="text-center text-xs text-gray-400">
            لم يصلك الرمز؟{' '}
            <button
              type="button"
              disabled={sendOtpMutation.isPending}
              onClick={() => sendOtpMutation.mutate()}
              className="text-emerald-600 font-medium hover:underline disabled:opacity-50"
            >
              إعادة الإرسال
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
}
