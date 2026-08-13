import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { User, Eye, AlertCircle } from 'lucide-react';
import ProviderMemberDetailsDrawer from './ProviderMemberDetailsDrawer';

export default function ProviderMembersList({ providerId }) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const { data: membersRes, isLoading, isError } = useQuery({
    queryKey: ['admin-provider-members', providerId],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/providers/${providerId}/members`);
      return res.data;
    },
    enabled: !!providerId
  });

  const members = membersRes?.data || membersRes?.items || (Array.isArray(membersRes) ? membersRes : []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">أعضاء مزود الخدمة</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">حدث خطأ أثناء تحميل بيانات الأعضاء.</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">لا يوجد أعضاء لهذا المزود.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => {
            const memberId = member.providerMemberId || member.id;
            const fullName = member.displayName || member.memberUser?.fullName || member.user?.fullName || member.fullName || member.name || 'عضو بدون اسم';
            const isActive = member.membershipStatus === 'ACTIVE' || member.userStatus === 'ACTIVE' || member.memberUser?.isActive || member.user?.isActive || member.isActive;
            const avatarUrl = member.avatarUrl || member.memberUser?.avatar || member.user?.avatar || member.avatar;
            
            return (
              <div key={memberId} className="flex flex-col p-4 border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all bg-gray-50/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-xs text-gray-500">{isActive ? 'نشط' : 'غير نشط'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMemberId(memberId)}
                  className="w-full mt-auto flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  <Eye size={16} />
                  عرض التفاصيل
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedMemberId && (
        <ProviderMemberDetailsDrawer 
          memberId={selectedMemberId} 
          onClose={() => setSelectedMemberId(null)} 
        />
      )}
    </div>
  );
}
