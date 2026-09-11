import React, { useState, useEffect } from 'react';
import { MapPin, Users, Activity, ArrowRight, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import providerAxiosClient from '../../../api/providerAxiosClient';
import { getApiErrorMessage } from '../../../../admin-dashboard/api/axiosClient';

export default function ZoneDetails({ zoneId, onBack, onEdit, onDeleteSuccess }) {
  const [zone, setZone] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchZoneDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await providerAxiosClient.get(`/providers/me/service-zones/${zoneId}`);
        setZone(response.data.item || response.data);
      } catch (err) {
        console.error('Failed to fetch zone details:', err);
        setError(getApiErrorMessage(err, 'حدث خطأ أثناء جلب تفاصيل المنطقة.'));
      } finally {
        setIsLoading(false);
      }
    };

    if (zoneId) {
      fetchZoneDetails();
    }
  }, [zoneId]);

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذه المنطقة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        setIsDeleting(true);
        await providerAxiosClient.delete(`/providers/me/service-zones/${zoneId}`);
        toast.success("تم حذف المنطقة بنجاح");
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (err) {
        console.error('Failed to delete zone:', err);
        toast.error(getApiErrorMessage(err, 'حدث خطأ أثناء حذف المنطقة.'));
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50/50 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-white border border-gray-100 rounded-xl shadow-sm p-4"></div>
          <div className="h-24 bg-white border border-gray-100 rounded-xl shadow-sm p-4"></div>
          <div className="h-24 bg-white border border-gray-100 rounded-xl shadow-sm p-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          رجوع
        </button>
      </div>
    );
  }

  if (!zone) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع للقائمة
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{zone.label}</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${zone.activeIs ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className={`text-sm font-medium ${zone.activeIs ? 'text-green-600' : 'text-gray-500'}`}>
                  {zone.activeIs ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">الموقع</p>
                <p className="font-medium text-gray-900">{zone.city} {zone.area ? `- ${zone.area}` : ''}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">نطاق التغطية</p>
                <p className="font-medium text-gray-900">
                  {zone.radiusMeters ? (zone.radiusMeters / 1000).toFixed(1) : 0} كم
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Users className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="w-full">
                <p className="text-sm text-gray-500 mb-2">إحصائيات الأعضاء</p>
                <div className="flex gap-4">
                  <div className="bg-white px-3 py-2 rounded border border-gray-100 flex-1">
                    <p className="text-xs text-gray-500 mb-1">الأعضاء المحددين</p>
                    <p className="font-bold text-gray-900">{zone.selectedMemberCount || 0}</p>
                  </div>
                  <div className="bg-white px-3 py-2 rounded border border-gray-100 flex-1">
                    <p className="text-xs text-gray-500 mb-1">الأعضاء الفعليين</p>
                    <p className="font-bold text-gray-900">{zone.effectiveMemberCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Members Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">الأعضاء المعينون</h3>
          </div>
          
          {zone.assignments && zone.assignments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {zone.assignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-900 text-sm">
                    {assignment.displayName || 'بدون اسم'}
                  </span>
                  {assignment.activeIs !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${assignment.activeIs ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className={`text-[10px] font-medium ${assignment.activeIs ? 'text-green-600' : 'text-gray-500'}`}>
                        {assignment.activeIs ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center border border-gray-100 border-dashed">
              لا يوجد أعضاء معينين لهذه المنطقة حالياً.
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white flex justify-between gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
        >
          رجوع للقائمة
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف المنطقة
          </button>
          <button
            onClick={() => onEdit && onEdit(zone.id)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Edit className="w-4 h-4" />
            تعديل المنطقة
          </button>
        </div>
      </div>
    </div>
  );
}
