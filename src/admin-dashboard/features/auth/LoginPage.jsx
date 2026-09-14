import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useProviderAuthStore from '../../../owner-provider-dashboard/store/providerAuthStore';
import { login as loginApi } from '../../api/endpoints/auth.api';
import loginImage from '../../img/WhatsApp Image 2026-06-12 at 6.40.39 PM.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();
  const adminLogin = useAuthStore((s) => s.login);
  const providerLogin = useProviderAuthStore((s) => s.login);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isAdminAuth = !!localStorage.getItem('auth_token');
    const isProviderAuth = !!localStorage.getItem('provider_token');

    if (isAdminAuth) {
      navigate('/admin', { replace: true });
    } else if (isProviderAuth) {
      navigate('/provider', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token, role, owner_type } = await loginApi(mobile, password);
      
      const userRoles = user?.roles || [];
      const roleNames = userRoles.map((r) => (typeof r === 'string' ? r : r.name)?.toLowerCase());
      const directRole = (role || user?.role || owner_type || '').toLowerCase();

      const allowedAdminRoles = ['admin', 'superadmin', 'super_admin', 'platform'];
      const allowedProviderRoles = ['provider_owner', 'provider', 'owner', 'provider_applicant'];

      const isAdmin = roleNames.some(r => allowedAdminRoles.includes(r)) || allowedAdminRoles.includes(directRole);
      const isProvider = roleNames.some(r => allowedProviderRoles.includes(r)) || allowedProviderRoles.includes(directRole);

      if (isAdmin) {
        adminLogin(user, token);
        navigate('/admin', { replace: true });
      } else if (isProvider) {
        providerLogin(user, token);
        navigate('/provider', { replace: true });
      }
      if (!isAdmin && !isProvider) {
        const detectedRoles = roleNames.length > 0 ? roleNames.join(', ') : (directRole || 'بدون صلاحية');
        setError(`عذراً، الصلاحيات الحالية (${detectedRoles}) غير كافية للدخول إلى هذه اللوحة.`);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
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

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">مرحباً بعودتك</h1>
            <p className="text-sm text-gray-500 mt-1.5">سجل الدخول للمتابعة إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                رقم الجوال
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                dir="ltr"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="05xxxxxxxxx"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  كلمة المرور
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              هل ترغب بالانضمام كمزود خدمة؟{' '}
              <Link
                to="/provider/register"
                className="text-blue-600 hover:underline font-semibold transition"
              >
                إنشاء حساب
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              هل أنت مشرف جديد؟{' '}
              <Link
                to="/auth/staff/activate"
                className="text-blue-600 hover:underline font-semibold transition"
              >
                تفعيل حسابك
              </Link>
            </p>
            <div className="text-xs text-gray-500 mt-6 text-center">
              <span className="block mb-2">بتسجيل الدخول، فإنك توافق على الشروط والسياسات:</span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  الشروط والأحكام
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  سياسة الخصوصية
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  to="/account-deletion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  طلب حذف الحساب
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
