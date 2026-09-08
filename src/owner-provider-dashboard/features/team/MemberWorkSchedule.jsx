import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';
import { Clock, Calendar, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import providerAxiosClient from '../../api/providerAxiosClient';
import Modal from '../../../shared/components/ui/Modal';
import MemberScheduleForm from './MemberScheduleForm';
import AddScheduleExceptionModal from './AddScheduleExceptionModal';

const dayNames = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

const formatMinutesToTime = (minutes) => {
  // Bug #6 fix: guard against null/undefined/NaN inputs
  if (minutes == null || isNaN(minutes)) return '--:--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

export default function MemberWorkSchedule({ memberId }) {
  const [schedule, setSchedule] = useState({ periods: [], exceptions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Bug #1 fix: wrap fetchSchedule in useCallback so it can be safely listed
  // as a dependency and called from handleDeleteException without stale closures.
  const fetchSchedule = useCallback(async (isMountedRef) => {
    try {
      setIsLoading(true);
      const response = await providerAxiosClient.get(`/providers/me/members/${memberId}/work-schedule`);
      // Only update state if the component is still mounted
      if (!isMountedRef || isMountedRef.current) {
        setSchedule(response.data);
      }
    } catch (err) {
      console.error('Work schedule fetch error:', err);
      if (!isMountedRef || isMountedRef.current) {
        // Bug #2 fix: Only treat 404 as "no schedule"; surface all other errors
        if (err.response?.status === 404) {
          setSchedule({ periods: [], exceptions: [] });
          setError(null);
        } else {
          setError(getApiErrorMessage(err, 'حدث خطأ أثناء تحميل جدول العمل. يرجى المحاولة مرة أخرى.'));
        }
      }
    } finally {
      if (!isMountedRef || isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [memberId]);

  const handleDeleteException = async (exceptionId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء هذا الاستثناء؟")) {
      return;
    }
    
    try {
      setDeletingId(exceptionId);
      await providerAxiosClient.delete(`/providers/me/members/${memberId}/work-schedule/exceptions/${exceptionId}`);
      // Bug #3 fix: pass no isMountedRef here — component is still mounted on user action
      await fetchSchedule();
    } catch (err) {
      console.error('Failed to delete exception:', err);
      // Bug #3 fix: replace alert() with toast.error for consistency
      toast.error(getApiErrorMessage(err, 'حدث خطأ أثناء محاولة الحذف. يرجى المحاولة مرة أخرى.'));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    // Bug #1 fix: isMounted ref prevents state updates after unmount
    const isMountedRef = { current: true };
    if (memberId) {
      fetchSchedule(isMountedRef);
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [memberId, fetchSchedule]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-white rounded-xl shadow-sm border border-gray-100">
        {error}
      </div>
    );
  }

  // Group periods by dayOfWeek
  const groupedPeriods = (schedule.periods || []).reduce((acc, period) => {
    if (!acc[period.dayOfWeek]) {
      acc[period.dayOfWeek] = [];
    }
    acc[period.dayOfWeek].push(period);
    return acc;
  }, {});

  // Sort days: 0 to 6
  const sortedDays = Object.keys(groupedPeriods).map(Number).sort();

  const hasNoSchedule = sortedDays.length === 0 && (!schedule.exceptions || schedule.exceptions.length === 0);

  if (hasNoSchedule) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center mb-6 relative">
          <div className="absolute top-4 left-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              إعداد الجدول
            </button>
          </div>
          <Calendar className="w-12 h-12 text-gray-300 mb-3 mt-4" />
          <p className="text-gray-500 font-medium">لا يوجد جدول عمل مخصص لهذا العضو.</p>
        </div>
        
        {isModalOpen && (
          <Modal title="إعداد / تعديل الجدول" onClose={() => setIsModalOpen(false)} size="lg">
            <MemberScheduleForm 
              memberId={memberId} 
              onClose={() => setIsModalOpen(false)} 
              onSaveSuccess={() => { setIsModalOpen(false); fetchSchedule(); }} 
            />
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">جدول الدوام والإجازات</h3>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            تعديل الجدول
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-gray-100">
          
          {/* Section A: Weekly Schedule */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              فترات العمل الأسبوعية
            </h4>
            
            <div className="space-y-4">
              {sortedDays.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد فترات عمل مجدولة</p>
              ) : (
                sortedDays.map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 gap-3">
                    <div className="font-medium text-gray-900 w-24">
                      {dayNames[day]}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {groupedPeriods[day]
                        .sort((a, b) => a.startMinuteOfDay - b.startMinuteOfDay)
                        .map((period) => (
                        <div key={period.id} className="flex items-center text-sm text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200">
                          {formatMinutesToTime(period.startMinuteOfDay)} - {formatMinutesToTime(period.endMinuteOfDay)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section B: Exceptions */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                الاستثناءات
              </h4>
              <button
                onClick={() => setIsExceptionModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                إضافة استثناء
              </button>
            </div>
            
            <div className="space-y-3">
              {!schedule.exceptions || schedule.exceptions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد استثناءات مجدولة قريباً</p>
              ) : (
                schedule.exceptions
                  .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
                  .map((exception) => {
                  const isUnavailable = exception.type === 'UNAVAILABLE';
                  const startDate = new Date(exception.startsAt);
                  const endDate = new Date(exception.endsAt);
                  
                  return (
                    <div key={exception.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                          isUnavailable ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {isUnavailable ? (
                            <>إجازة / غير متاح</>
                          ) : (
                            <><CheckCircle className="w-3 h-3"/> عمل إضافي</>
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-medium">
                            {startDate.toLocaleDateString('ar-EG')}
                          </span>
                          <button
                            onClick={() => handleDeleteException(exception.id)}
                            disabled={deletingId === exception.id}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="إلغاء الاستثناء"
                          >
                            {deletingId === exception.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 font-medium mt-1">
                        {exception.reason}
                      </div>
                      
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
      </div>

      {isModalOpen && (
        <Modal title="إعداد / تعديل الجدول" onClose={() => setIsModalOpen(false)} size="lg">
          <MemberScheduleForm 
            memberId={memberId} 
            onClose={() => setIsModalOpen(false)} 
            onSaveSuccess={() => { setIsModalOpen(false); fetchSchedule(); }} 
          />
        </Modal>
      )}

      {isExceptionModalOpen && (
        <AddScheduleExceptionModal
          memberId={memberId}
          onClose={() => setIsExceptionModalOpen(false)}
          onSaveSuccess={() => { setIsExceptionModalOpen(false); fetchSchedule(); }}
        />
      )}
    </>
  );
}
