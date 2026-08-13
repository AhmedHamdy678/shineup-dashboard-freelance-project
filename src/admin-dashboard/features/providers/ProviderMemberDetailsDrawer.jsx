import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { X, User, Phone, Mail, Calendar, Briefcase, Clock, Activity, CheckCircle, ChevronLeft } from 'lucide-react';
import formatDate from '../../../shared/utils/formatDate';

export default function ProviderMemberDetailsDrawer({ memberId, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const { data: memberRes, isLoading, isError } = useQuery({
    queryKey: ['admin-provider-member-details', memberId],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/provider-members/${memberId}`);
      return res.data;
    },
    enabled: !!memberId
  });

  const data = memberRes?.data || memberRes;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose} 
      />
      <div 
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">تفاصيل العضو</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="h-32 bg-gray-100 rounded-xl" />
              <div className="h-32 bg-gray-100 rounded-xl" />
            </div>
          ) : isError || !data ? (
            <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl">
              فشل تحميل بيانات العضو.
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {data.memberUser?.avatar ? (
                    <img src={data.memberUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={30} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{data.memberUser?.fullName || 'عضو بدون اسم'}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${data.memberUser?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {data.memberUser?.isActive ? 'عضو نشط' : 'عضو غير نشط'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                {data.memberUser?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                      <Phone size={16} />
                    </div>
                    <span dir="ltr" className="font-medium">{data.memberUser.phone}</span>
                  </div>
                )}
                {data.memberUser?.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                      <Mail size={16} />
                    </div>
                    <span dir="ltr" className="font-medium truncate">{data.memberUser.email}</span>
                  </div>
                )}
              </div>

              {/* Membership Info */}
              <div>
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  معلومات العضوية
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Calendar size={14}/> تاريخ الانضمام</p>
                    <p className="text-sm font-semibold text-gray-900" dir="ltr">
                      {formatDate(data.membershipData?.joinedAt) || 'غير متوفر'}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><CheckCircle size={14}/> الحجوزات المكتملة</p>
                    <p className="text-lg font-bold text-gray-900">
                      {data.bookingStats?.completedBookingsCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Session */}
              {data.workSessionSummary && Object.keys(data.workSessionSummary).length > 0 && (
                <div>
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-green-600" />
                    جلسة العمل الحالية
                  </h4>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        {data.workSessionSummary.status?.code === 'ONLINE' ? 'متصل' : 
                         data.workSessionSummary.status?.code === 'BUSY' ? 'مشغول' : 
                         data.workSessionSummary.status?.code || 'غير معروف'}
                      </p>
                      <p className="text-xs text-green-600 flex items-center gap-1" dir="ltr">
                        <Clock size={12} />
                        {formatDate(data.workSessionSummary.startedAt)}
                      </p>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  </div>
                </div>
              )}

              {/* Latest Bookings */}
              <div>
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  أحدث الحجوزات
                </h4>
                {!data.latestBookings || data.latestBookings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-100">لا توجد حجوزات حتى الآن.</p>
                ) : (
                  <div className="space-y-3">
                    {data.latestBookings.map((booking, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-blue-600">#{booking.codeBooking || booking.id}</p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <User size={14} className="text-gray-400" />
                          <span className="font-medium truncate">{booking.customer?.fullName || 'غير معروف'}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5" dir="ltr">
                          <Clock size={12} />
                          {formatDate(booking.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
