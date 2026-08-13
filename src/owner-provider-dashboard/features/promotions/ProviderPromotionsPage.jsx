import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import providerAxiosClient from '../../api/providerAxiosClient';
import ProviderPromotionsTable from './components/ProviderPromotionsTable';
import ProviderPromotionForm from './components/ProviderPromotionForm';
import ProviderPromotionDetails from './components/ProviderPromotionDetails';
import { Tag, ChevronRight, ChevronLeft, Plus } from 'lucide-react';

export default function ProviderPromotionsPage() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const limit = 20;

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['provider-promotions', page, limit],
    queryFn: async () => {
      const response = await providerAxiosClient.get(`/providers/me/promotions?page=${page}&limit=${limit}`, {
        headers: { 'Accept-Language': 'ar' }
      });
      return response.data;
    },
    keepPreviousData: true
  });

  const items = data?.items || [];
  const total = data?.total || data?.pagination?.totalItems || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePreviousPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  if (isFormOpen) {
    return (
      <div className="p-6">
        <ProviderPromotionForm onClose={() => setIsFormOpen(false)} />
      </div>
    );
  }

  if (selectedPromotionId) {
    return (
      <ProviderPromotionDetails 
        promotionId={selectedPromotionId} 
        onBack={() => setSelectedPromotionId(null)} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-blue-600" />
          إدارة عروضك الترويجية
        </h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة عرض جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse w-full"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            حدث خطأ أثناء تحميل العروض الترويجية.
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <ProviderPromotionsTable items={items} onView={(id) => setSelectedPromotionId(id)} />
            
            {/* Pagination UI */}
            {(totalPages > 1 || total > 0) && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 mt-auto">
                <span className="text-sm text-gray-600 font-medium">
                  صفحة {page} من {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page >= totalPages || total === 0}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
