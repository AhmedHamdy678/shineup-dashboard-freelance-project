import React from 'react';

export default function DashboardPendingView() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 rounded-2xl min-h-[60vh] border-2 border-dashed border-gray-200 m-6">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">جاري مراجعة طلبك</h2>
        
        <p className="text-gray-600 leading-relaxed">
          تم استلام بياناتك بنجاح. يقوم فريقنا الآن بمراجعة ملفك الشخصي. سنقوم بالتواصل معك وتفعيل حسابك قريباً لتتمكن من استخدام كافة ميزات لوحة التحكم.
        </p>
      </div>
    </div>
  );
}
