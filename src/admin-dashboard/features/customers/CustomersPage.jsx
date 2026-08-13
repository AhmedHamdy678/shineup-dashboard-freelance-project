import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Users, UserCheck, Calendar, CheckCircle } from 'lucide-react';
import { useCustomers } from './useCustomers';
import StatCard from '../../../shared/components/ui/StatCard';
import Pagination from '../../../shared/components/ui/Pagination';

const statusStyles = {
  ACTIVE: 'bg-green-50 text-green-700',
  SUSPENDED: 'bg-red-50 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
};

const statusLabels = {
  ACTIVE: 'نشط',
  SUSPENDED: 'معلق',
  INACTIVE: 'غير نشط',
};

function BookingsCell({ completed, cancelled }) {
  const total = completed + cancelled;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-sm font-semibold text-gray-900">{total}</span>
      <div className="flex items-center justify-center gap-1.5">
        {completed > 0 && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-green-700 bg-green-50">
            ✓ {completed}
          </span>
        )}
        {cancelled > 0 && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-red-700 bg-red-50">
            ✗ {cancelled}
          </span>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();
  const limit = 20;

  const { data, isLoading, isError } = useCustomers(page, limit);

  useEffect(() => {
    const close = () => setOpenDropdownId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const items = data?.items ?? [];
  const meta = data?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const activeCount = items.filter((c) => c.status === 'ACTIVE').length;
  const totalBookings = items.reduce((s, c) => s + (c.bookingsCount || 0), 0);
  const completedBookings = items.reduce((s, c) => s + (c.completedBookingsCount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
        <p className="text-sm text-gray-500 mt-1">إدارة جميع العملاء المسجلين في المنصة.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي العملاء" value={meta.total} icon={Users} color="blue" />
        <StatCard title="العملاء النشطين" value={activeCount} icon={UserCheck} color="green" />
        <StatCard title="إجمالي الحجوزات" value={totalBookings} icon={Calendar} color="blue" />
        <StatCard title="الحجوزات المكتملة" value={completedBookings} icon={CheckCircle} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                <th className="px-4 py-4 text-center font-semibold">#</th>
                <th className="px-4 py-4 text-center font-semibold">الاسم الكامل</th>
                <th className="px-4 py-4 text-center font-semibold">رقم الجوال</th>
                <th className="px-4 py-4 text-center font-semibold">البريد الإلكتروني</th>
                <th className="px-4 py-4 text-center font-semibold">المدينة</th>
                <th className="px-4 py-4 text-center font-semibold">الحجوزات</th>
                <th className="px-4 py-4 text-center font-semibold">الحالة</th>
                <th className="px-4 py-4 text-center font-semibold">تاريخ الانضمام</th>
                <th className="px-4 py-4 text-center font-semibold"></th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-4 text-center"><div className="h-4 bg-gray-100 rounded mx-auto w-8 animate-pulse" /></td>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-4 text-center">
                        <div className="h-4 bg-gray-100 rounded mx-auto animate-pulse" style={{ maxWidth: 100 }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : isError ? (
              <tbody>
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-red-500 font-medium">فشل في تحميل البيانات. يرجى المحاولة لاحقاً.</td>
                </tr>
              </tbody>
            ) : items.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Users size={32} />
                      </div>
                      <span className="text-gray-500 font-medium">لم يتم العثور على أي عملاء.</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {items.map((customer, idx) => {
                  const isLastRows = idx >= items.length - 2 && items.length > 3;
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-400">
                        {(meta.page - 1) * meta.limit + idx + 1}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {customer.fullName}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-500 font-mono whitespace-nowrap" dir="ltr">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-500 max-w-[180px] truncate" dir="ltr">
                        {customer.email}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-400">
                        &mdash;
                      </td>
                      <td className="px-4 py-4 text-center">
                        <BookingsCell
                          completed={customer.completedBookingsCount ?? 0}
                          cancelled={customer.cancelledBookingsCount ?? 0}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[customer.status] || statusStyles.INACTIVE
                          }`}
                        >
                          {statusLabels[customer.status] || customer.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-center relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId((prev) => (prev === customer.id ? null : customer.id));
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {openDropdownId === customer.id && (
                          <div className={`absolute left-0 ${isLastRows ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white border border-gray-100 rounded-lg shadow-xl z-50 w-40 p-1.5 flex flex-col gap-1`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                navigate(`/admin/customers/${customer.id}`);
                              }}
                              className="w-full text-start px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            >
                              عرض التفاصيل
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                console.log('Suspend', customer.id);
                              }}
                              className="w-full text-start px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              تعليق الحساب
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        <Pagination
          currentPage={meta.page}
          totalResults={meta.total}
          pageSize={meta.limit || limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
