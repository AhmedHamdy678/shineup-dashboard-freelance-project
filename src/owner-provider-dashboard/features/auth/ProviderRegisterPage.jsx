import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useProviderAuthStore from '../../store/providerAuthStore';
import { useRegister, useVerifyOTP, useResendOTP } from './hooks/useProviderAuth';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { login } = useProviderAuthStore();
  
  const [step, setStep] = useState(1); // 1: REGISTER, 2: VERIFY_OTP
  const [savedUserId, setSavedUserId] = useState(null);
  const [savedEmail, setSavedEmail] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(60);

  const registerMutation = useRegister();
  const verifyMutation = useVerifyOTP();
  const resendMutation = useResendOTP();

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
  } = useForm({
    defaultValues: { accountType: 'provider_owner' }
  });

  const passwordValue = watch('password');

  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (step !== 2) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [step]);

  const onRegister = (data) => {
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        setSavedUserId(res.userId);
        setSavedEmail(res.email);
        setSavedPhone(payload.phone);
        setStep(2);
        setTimer(60);
        toast.success('تم التسجيل بنجاح، يرجى إدخال رمز التحقق');
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, 'حدث خطأ أثناء التسجيل'));
      }
    });
  };

  const onVerifyOTP = (e) => {
    e.preventDefault();
    verifyMutation.mutate({
      userId: savedUserId,
      code: otpCode
    }, {
      onSuccess: (res) => {
        toast.success('تم التحقق بنجاح، يرجى تسجيل الدخول');
        navigate('/login', { replace: true });
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, 'رمز التحقق غير صحيح'));
      }
    });
  };

  const onResendOTP = () => {
    resendMutation.mutate({ phone: savedPhone }, {
      onSuccess: () => {
        toast.success('تم إرسال رمز التحقق بنجاح!');
        setTimer(60);
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, 'حدث خطأ، يرجى المحاولة لاحقاً'));
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center px-12">
            <h2 className="text-4xl font-bold">ShineUp</h2>
            <p className="text-xl text-white/80 mt-3">منصة مزودي الخدمات</p>
            <p className="text-white/60 mt-2 max-w-md">انضم إلينا وابدأ في إدارة أعمالك بسهولة</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'إنشاء حساب جديد' : 'التحقق من الحساب'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 ? 'سجل كمزود خدمة في المنصة' : `أدخل الرمز المرسل إلى ${savedEmail}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  {...registerForm('fullName', { required: 'الاسم مطلوب' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="أحمد خليل"
                />
                {registerErrors.fullName && <p className="text-red-500 text-xs mt-1">{registerErrors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  {...registerForm('email', { required: 'البريد الإلكتروني مطلوب' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="example@mail.com"
                  dir="ltr"
                />
                {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الجوال</label>
                <input
                  type="tel"
                  {...registerForm('phone', { required: 'رقم الجوال مطلوب' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
                {registerErrors.phone && <p className="text-red-500 text-xs mt-1">{registerErrors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...registerForm('password', { required: 'كلمة المرور مطلوبة', minLength: { value: 6, message: '6 أحرف على الأقل' } })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                    placeholder="********"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                {registerErrors.password && <p className="text-red-500 text-xs mt-1">{registerErrors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerForm('confirmPassword', { 
                      required: 'تأكيد كلمة المرور مطلوب',
                      validate: (value) => value === passwordValue || 'كلمتا المرور غير متطابقتين'
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                    placeholder="********"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? (
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
                {registerErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerErrors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition mt-2"
              >
                {registerMutation.isPending ? 'جاري التسجيل...' : 'إنشاء حساب'}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز التحقق (6 أرقام)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="------"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={verifyMutation.isPending || otpCode.length !== 6}
                className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {verifyMutation.isPending ? 'جاري التحقق...' : 'تأكيد الرمز'}
              </button>

              <div className="text-center mt-4">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500 font-medium">
                    يمكنك إعادة الإرسال بعد {timer} ثانية
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={onResendOTP}
                    disabled={resendMutation.isPending}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition"
                  >
                    {resendMutation.isPending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                  </button>
                )}
              </div>
            </form>
          )}
          
          {step === 1 && (
            <p className="mt-6 text-center text-sm text-gray-500">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
