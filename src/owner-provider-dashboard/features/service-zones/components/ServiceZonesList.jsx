import React from 'react';
import { MapPin, Users, ChevronRight, ChevronLeft, Pencil } from 'lucide-react';

export default function ServiceZonesList({ 
  zones = [], 
  pagination = { page: 1, limit: 20, totalPages: 1, totalItems: 0 }, 
  isLoading, 
  error, 
  onPageChange, 
  onRetry,
  onEditZone,
  onViewZone
}) {

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-4 border-b border-gray-100 bg-white">
        <h2 className="font-semibold text-gray-900">القائمة</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isLoading ? 'جاري التحميل...' : `إجمالي المناطق: ${pagination.totalItems || 0}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          // Skeleton Loader
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-start justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded-full w-12"></div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))
        ) : zones.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            لا توجد مناطق تغطية مضافة حالياً.
          </div>
        ) : (
          zones.map((zone) => (
            <div 
              key={zone.id} 
              onClick={() => onViewZone && onViewZone(zone.id)}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors group cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-gray-900 text-sm">{zone.label}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${zone.activeIs ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className={`text-[10px] font-medium ${zone.activeIs ? 'text-green-600' : 'text-gray-500'}`}>
                      {zone.activeIs ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditZone) onEditZone(zone.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="تعديل المنطقة"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-gray-600 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{zone.city} {zone.area ? `- ${zone.area}` : ''}</span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-gray-600">
                  <span className="font-medium">النطاق:</span>
                  <span>{zone.radiusMeters ? (zone.radiusMeters / 1000).toFixed(1) : 0} كم</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded text-blue-600">
                  <Users className="w-3.5 h-3.5" />
                  <span>عدد الأعضاء: {zone.selectedMemberCount || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
        <button
          onClick={handlePrevPage}
          disabled={pagination.page <= 1 || isLoading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600 font-medium">
          صفحة {pagination.page} من {pagination.totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={pagination.page >= pagination.totalPages || isLoading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
