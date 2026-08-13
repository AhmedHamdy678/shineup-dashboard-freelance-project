import React from 'react';
import SupportChatLayout from './SupportChatLayout';

export default function ProviderSupportPage() {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الدعم الفني</h1>
        <p className="text-sm text-gray-500 mt-1">تواصل مع فريق الدعم الفني الخاص بمنصة ShineUp.</p>
      </div>
      
      <SupportChatLayout />
    </div>
  );
}
