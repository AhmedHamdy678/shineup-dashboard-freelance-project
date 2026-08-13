import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Undo, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import RefundRequestsTable from './components/RefundRequestsTable';
import RefundDetails from './components/RefundDetails';
import Pagination from '../../../shared/components/ui/Pagination';

export default function RefundRequestsPage() {
  const [page, setPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const pageSize = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-refund-requests', page],
    queryFn: async () => {
      const res = await axiosClient.get(`admin/refund-requests?page=${page}&limit=${pageSize}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
  const meta = data?.meta || { totalPages: 1, totalCount: 0 };
  const totalResults = meta.totalCount || meta.total || (meta.totalPages ? meta.totalPages * pageSize : items.length);

  if (selectedRequestId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Undo className="w-7 h-7 text-blue-600" />
            إدارة طلبات الاسترجاع
          </h1>
        </div>
        <RefundDetails 
          requestId={selectedRequestId} 
          onBack={() => setSelectedRequestId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Undo className="w-7 h-7 text-blue-600" />
          إدارة طلبات الاسترجاع
        </h1>
        <p className="text-gray-500 text-sm">
          متابعة وإدارة جميع طلبات استرجاع المبالغ للعملاء
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center flex-col gap-4">
            <div className="w-full h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="w-full h-16 bg-gray-50 rounded animate-pulse"></div>
            <div className="w-full h-16 bg-gray-50 rounded animate-pulse"></div>
            <div className="w-full h-16 bg-gray-50 rounded animate-pulse"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>حدث خطأ أثناء تحميل بيانات طلبات الاسترجاع.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Undo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">لا توجد طلبات استرجاع حالياً.</p>
          </div>
        ) : (
          <RefundRequestsTable items={items} onViewDetails={setSelectedRequestId} />
        )}
        
        {!isLoading && !isError && items.length > 0 && (
          <div className="border-t border-gray-100">
            <Pagination 
              currentPage={page} 
              totalResults={totalResults} 
              pageSize={pageSize} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
