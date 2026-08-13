import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Globe, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import providerAxiosClient from '../../api/providerAxiosClient';
import Toggle from '../../../shared/components/ui/Toggle'; // Reusing your existing Toggle component

const dayNames = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' }
];

const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  if (minutes == null || isNaN(minutes)) return "00:00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const defaultPeriod = { start: '09:00', end: '17:00' };

export default function MemberScheduleForm({ memberId, onSaveSuccess, onClose }) {
  const [timezone, setTimezone] = useState('Asia/Riyadh');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State structure: days is an object keyed by dayOfWeek (0-6)
  // Each day has { active: boolean, periods: [{ start: "HH:mm", end: "HH:mm" }] }
  const [days, setDays] = useState(() => {
    const initial = {};
    for (let i = 0; i < 7; i++) {
      initial[i] = { active: false, periods: [{ ...defaultPeriod }] };
    }
    return initial;
  });

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const showTimezoneWarning = localTimezone !== timezone;

  // Fetch current schedule on mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const { data } = await providerAxiosClient.get(`/providers/me/members/${memberId}/work-schedule`);
        
        if (data.timezone) {
          setTimezone(data.timezone);
        }

        if (data.periods && data.periods.length > 0) {
          const loadedDays = {};
          for (let i = 0; i < 7; i++) {
            loadedDays[i] = { active: false, periods: [] };
          }

          data.periods.forEach(p => {
            loadedDays[p.dayOfWeek].active = true;
            loadedDays[p.dayOfWeek].periods.push({
              start: minutesToTime(p.startMinuteOfDay),
              end: minutesToTime(p.endMinuteOfDay)
            });
          });

          // Ensure days with active=true have at least one period, else default to 1 empty period
          for (let i = 0; i < 7; i++) {
            if (loadedDays[i].active && loadedDays[i].periods.length === 0) {
               loadedDays[i].periods.push({ ...defaultPeriod });
            } else if (!loadedDays[i].active) {
               loadedDays[i].periods.push({ ...defaultPeriod });
            }
          }
          setDays(loadedDays);
        }
      } catch (err) {
        // If 404 or no schedule, it's fine, we start with defaults.
        console.error("Failed to load existing schedule or doesn't exist", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchSchedule();
    }
  }, [memberId]);

  const handleDayToggle = (dayValue) => {
    setDays(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        active: !prev[dayValue].active
      }
    }));
  };

  const handleAddPeriod = (dayValue) => {
    setDays(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        periods: [...prev[dayValue].periods, { ...defaultPeriod }]
      }
    }));
  };

  const handleRemovePeriod = (dayValue, periodIndex) => {
    setDays(prev => {
      const newPeriods = [...prev[dayValue].periods];
      newPeriods.splice(periodIndex, 1);
      return {
        ...prev,
        [dayValue]: {
          ...prev[dayValue],
          periods: newPeriods
        }
      };
    });
  };

  const handlePeriodChange = (dayValue, periodIndex, field, value) => {
    setDays(prev => {
      const newPeriods = [...prev[dayValue].periods];
      newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
      return {
        ...prev,
        [dayValue]: {
          ...prev[dayValue],
          periods: newPeriods
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Construct payload
    const periodsPayload = [];
    Object.keys(days).forEach((dayStr) => {
      const dayValue = parseInt(dayStr, 10);
      const dayData = days[dayValue];
      
      if (dayData.active) {
        dayData.periods.forEach((p) => {
          if (p.start && p.end) {
            periodsPayload.push({
              dayOfWeek: dayValue,
              startMinuteOfDay: timeToMinutes(p.start),
              endMinuteOfDay: timeToMinutes(p.end)
            });
          }
        });
      }
    });

    const payload = {
      timezone,
      periods: periodsPayload
    };

    try {
      setIsSaving(true);
      await providerAxiosClient.put(`/providers/me/members/${memberId}/work-schedule`, payload);
      toast.success('تم حفظ جدول العمل بنجاح');
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ الجدول');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-sm border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-2">
      {/* Timezone Section */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            المنطقة الزمنية (Timezone)
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full sm:w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Asia/Riyadh">توقيت السعودية (الرياض)</option>
            {/* Add more timezones if needed */}
            {timezone !== 'Asia/Riyadh' && <option value={timezone}>{timezone}</option>}
          </select>
          
          {showTimezoneWarning && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              المنطقة الزمنية المحددة تختلف عن التوقيت المحلي لجهازك ({localTimezone}).
            </div>
          )}
        </div>

        {/* Days Section */}
        <div className="space-y-4">
          {dayNames.map(({ value: dayValue, label: dayLabel }) => {
            const dayData = days[dayValue];
            const isActive = dayData.active;
            
            return (
              <div key={dayValue} className={`p-4 rounded-lg border transition-colors ${isActive ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Toggle value={isActive} onChange={() => handleDayToggle(dayValue)} />
                    <span className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {dayLabel}
                    </span>
                  </div>
                  
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => handleAddPeriod(dayValue)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة فترة
                    </button>
                  )}
                </div>

                {/* Periods Configuration */}
                {isActive && (
                  <div className="mt-4 space-y-3 pl-12 border-r-2 border-blue-100 mr-2 pr-4">
                    {dayData.periods.map((period, idx) => (
                      <div key={idx} className="flex items-center gap-3 flex-wrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-medium mb-1">من الساعة</span>
                          <input
                            type="time"
                            value={period.start}
                            onChange={(e) => handlePeriodChange(dayValue, idx, 'start', e.target.value)}
                            required
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-medium mb-1">إلى الساعة</span>
                          <input
                            type="time"
                            value={period.end}
                            onChange={(e) => handlePeriodChange(dayValue, idx, 'end', e.target.value)}
                            required
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* Remove Period Button (Show only if more than 1 period exists) */}
                        {dayData.periods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePeriod(dayValue, idx)}
                            className="mt-4 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="حذف الفترة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      
      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          disabled={isSaving}
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>
    </form>
  );
}
