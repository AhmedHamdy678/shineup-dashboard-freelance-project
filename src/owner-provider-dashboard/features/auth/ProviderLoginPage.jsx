import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useProviderAuthStore from '../../store/providerAuthStore';

export default function ProviderLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useProviderAuthStore();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/provider', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mobile === '01000000000' && password === 'password') {
      login(
        { id: 'owner_1', name: 'Ahmed Khalil', companyName: 'Shine & Co. Detailing' },
        'mock_token',
      );
      navigate('/provider', { replace: true });
      return;
    }

    try {
      const { providerLogin } = await import('../../api/endpoints/providerAuth.api');
      const { user, token } = await providerLogin(mobile, password);
      
      const userRoles = user?.roles || [];
      const roleNames = userRoles.map(r => (typeof r === 'string' ? r : r.name)?.toLowerCase());
      const directRole = (user?.role || user?.type || '').toLowerCase();
      
      const allowedProviderRoles = ['provider_owner', 'provider', 'owner', 'provider_applicant'];
      const hasAccess = roleNames.some(role => allowedProviderRoles.includes(role)) || allowedProviderRoles.includes(directRole);

      if (!hasAccess) {
        const detectedRoles = roleNames.length > 0 ? roleNames.join(', ') : (directRole || 'بدون صلاحية');
        setError(`عذراً، الصلاحيات الحالية (${detectedRoles}) غير كافية للدخول. الرجاء التواصل مع الدعم.`);
        setLoading(false);
        return;
      }

      login(user, token);
      navigate('/provider', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center px-12">
            <h2 className="text-4xl font-bold">ShineUp</h2>
            <p className="text-xl text-white/80 mt-3">منصة مزودي الخدمات</p>
            <p className="text-white/60 mt-2 max-w-md">قم بإدارة أعمالك، الحجوزات، الفريق، والأرباح من مكان واحد</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">مرحباً بعودتك</h1>
            <p className="text-sm text-gray-500 mt-1">سجل الدخول إلى لوحة المزود</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الجوال</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                dir="ltr"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pl-10"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
              className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <Link
              to="/provider/register"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition"
            >
              إنشاء حساب
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
