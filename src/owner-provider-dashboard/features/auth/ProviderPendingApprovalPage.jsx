import React from 'react';
import { useNavigate } from 'react-router-dom';
import useProviderAuthStore from '../../store/providerAuthStore';

export default function ProviderPendingApprovalPage() {
  const navigate = useNavigate();
  const logout = useProviderAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/provider/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden text-center border border-gray-100 p-8 md:p-12">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">جاري مراجعة طلبك</h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          تم استلام بياناتك بنجاح. يقوم فريقنا الآن بمراجعة ملفك الشخصي. سنقوم بالتواصل معك وتفعيل حسابك قريباً.
        </p>

        <button
          onClick={handleLogout}
          className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-gray-200"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
