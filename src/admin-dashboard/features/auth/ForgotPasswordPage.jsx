import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword, useResetPassword } from '../../hooks/useAuthMutations';
import loginImage from '../../img/WhatsApp Image 2026-06-12 at 6.40.39 PM.jpeg';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: Request OTP ──────────────────────────────────────────────────
  const forgotMutation = useForgotPassword({
    onSuccess: () => {
      setError('');
      setStep(2);
    },
    onError: (err) => {
      setError(
        err?.response?.data?.message ||
        'حدث خطأ أثناء الإرسال. تحقق من رقم الجوال وحاول مرة أخرى.'
      );
    },
  });

  // ── Step 2: Reset Password ───────────────────────────────────────────────
  const resetMutation = useResetPassword({
    onSuccess: () => {
      navigate('/login', { replace: true });
    },
    onError: (err) => {
      setError(
        err?.response?.data?.message ||
        'الرمز غير صحيح أو انتهت صلاحيته. حاول مرة أخرى.'
      );
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');
    forgotMutation.mutate(identifier);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    setError('');
    resetMutation.mutate({ identifier, code, newPassword });
  };

  const isStep1Loading = forgotMutation.isPending;
  const isStep2Loading = resetMutation.isPending;


  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left decorative image panel */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img
          src={loginImage}
          alt="ShineUp"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
          <h2 className="text-3xl font-bold">ShineUp</h2>
          <p className="text-lg text-white/80 mt-2">منصة شاين أب</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'نسيت كلمة المرور؟' : 'إعادة تعيين كلمة المرور'}
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              {step === 1
                ? 'أدخل رقم جوالك وسنرسل لك رمز التحقق'
                : `تم إرسال الرمز إلى ${identifier}`}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
              {step > 1 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : '١'}
            </div>
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
              ٢
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ── STEP 1: Enter Phone ─────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div>
                <label htmlFor="fp-identifier" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  رقم الجوال
                </label>
                <input
                  id="fp-identifier"
                  type="tel"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  dir="ltr"
                  disabled={isStep1Loading}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-60"
                  placeholder="05xxxxxxxxx"
                />
              </div>

              <button
                id="fp-send-otp-btn"
                type="submit"
                disabled={isStep1Loading || !identifier}
                className="w-full py-2.5 mt-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isStep1Loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    جاري الإرسال...
                  </>
                ) : 'إرسال رمز التحقق'}
              </button>
            </form>
          )}

          {/* ── STEP 2: Enter OTP + New Password ───────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div>
                <label htmlFor="fp-otp-code" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  رمز التحقق
                </label>
                <input
                  id="fp-otp-code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  dir="ltr"
                  disabled={isStep2Loading}
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-center tracking-[0.4em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-60"
                  placeholder="• • • • • •"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  أدخل الرمز المكون من 6 أرقام الذي أُرسل إلى هاتفك
                </p>
              </div>

              <div>
                <label htmlFor="fp-new-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    id="fp-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    dir="ltr"
                    disabled={isStep2Loading}
                    minLength={8}
                    className="w-full px-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-60"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">يجب أن تكون 8 أحرف على الأقل</p>
              </div>

              <button
                id="fp-reset-password-btn"
                type="submit"
                disabled={isStep2Loading || !code || !newPassword}
                className="w-full py-2.5 mt-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isStep2Loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    جاري التغيير...
                  </>
                ) : 'تغيير كلمة المرور'}
              </button>

              {/* Resend OTP */}
              <p className="text-center text-sm text-gray-500">
                لم يصلك الرمز؟{' '}
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setNewPassword(''); setError(''); }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  إعادة الإرسال
                </button>
              </p>
            </form>
          )}

          {/* Back to login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-semibold flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة إلى تسجيل الدخول
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
