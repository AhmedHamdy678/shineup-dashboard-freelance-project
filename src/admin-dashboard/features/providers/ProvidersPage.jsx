import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { useIndividualProviders, useCompanyOwners, usePendingProviders, useSuspendProvider } from './useProviders';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import Pagination from '../../../shared/components/ui/Pagination';

const approvalMap = {
  APPROVED: 'approved',
  PENDING_REVIEW: 'pending',
  REJECTED: 'rejected',
};

function WorkBadge({ working }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        working ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {working ? 'نشط' : 'غير متصل'}
    </span>
  );
}

function BookingsCell({ completed, cancelled }) {
  const total = completed + (cancelled || 0);
  return (
    <div className="text-center space-y-1">
      <div className="font-semibold text-gray-900">{total}</div>
      <div className="flex flex-col items-center gap-0.5">
        {completed > 0 && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-green-700 bg-green-50">
            ✓ {completed} مكتمل
          </span>
        )}
        {cancelled > 0 && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-red-700 bg-red-50">
            ✗ {cancelled} ملغي
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

const individualColumns = [
  { key: 'displayName', label: 'الاسم' },
  { key: 'city', label: 'المدينة' },
  {
    key: 'rating',
    label: 'التقييم',
    render: (p) =>
      p.rating != null ? (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
          ★ {p.rating}
        </span>
      ) : (
        <span className="text-gray-300">&mdash;</span>
      ),
  },
  {
    key: 'approvalStatus',
    label: 'حالة الاعتماد',
    render: (p) => <StatusBadge status={approvalMap[p.approvalStatus]} />,
  },
  {
    key: 'isCurrentlyWorking',
    label: 'حالة العمل',
    render: (p) => <WorkBadge working={p.isCurrentlyWorking} />,
  },
  {
    key: 'bookings',
    label: 'الحجوزات',
    render: (p) => (
      <BookingsCell
        completed={p.completedBookingsCount ?? 0}
        cancelled={p.cancelledBookingsCount ?? 0}
      />
    ),
  },
  {
    key: 'createdAt',
    label: 'تاريخ الانضمام',
    render: (p) => <span className="text-xs text-gray-500">{formatDate(p.createdAt)}</span>,
  },
];

const companyColumns = [
  { key: 'companyName', label: 'اسم الشركة' },
  { key: 'ownerName', label: 'اسم المالك' },
  { key: 'city', label: 'المدينة' },
  {
    key: 'rating',
    label: 'التقييم',
    render: (p) =>
      p.rating != null ? (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
          ★ {p.rating}
        </span>
      ) : (
        <span className="text-gray-300">&mdash;</span>
      ),
  },
  {
    key: 'approvalStatus',
    label: 'حالة الاعتماد',
    render: (p) => <StatusBadge status={approvalMap[p.approvalStatus]} />,
  },
  {
    key: 'members',
    label: 'الأعضاء',
    render: (p) => (
      <span className="text-sm text-gray-700">
        {p.membersCount ?? 0} إجمالي / {p.activeMembersCount ?? 0} نشط
      </span>
    ),
  },
  {
    key: 'bookings',
    label: 'الحجوزات',
    render: (p) => (
      <BookingsCell completed={p.completedBookingsCount ?? 0} cancelled={0} />
    ),
  },
  {
    key: 'createdAt',
    label: 'تاريخ الانضمام',
    render: (p) => <span className="text-xs text-gray-500">{formatDate(p.createdAt)}</span>,
  },
];

const pendingColumns = [
  { key: 'nameBusiness', label: 'اسم النشاط' },
  {
    key: 'ownerName',
    label: 'اسم المالك',
    render: (p) => (
      <div className="flex flex-col items-center">
        <span className="font-medium text-gray-900">{p.owner?.fullName || p.ownerName || '\u2014'}</span>
        <span className="text-xs text-gray-500">{p.owner?.phone || p.owner?.email || '\u2014'}</span>
      </div>
    ),
  },
  {
    key: 'typeProvider',
    label: 'النوع',
    render: (p) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        p.typeProvider === 'COMPANY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {p.typeProvider === 'COMPANY' ? 'شركة' : 'فرد'}
      </span>
    ),
  },
  {
    key: 'reviewFlags',
    label: 'حالة الملف',
    render: (p) => {
      const isComplete = p.reviewFlags?.profileComplete || p.reviewFlags?.readyForReview;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isComplete ? 'مكتمل وجاهز للمراجعة' : 'ينقصه بعض البيانات'}
        </span>
      );
    },
  },
  {
    key: 'atCreated',
    label: 'تاريخ الطلب',
    render: (p) => <span className="text-xs text-gray-500">{formatDate(p.atCreated || p.createdAt)}</span>,
  },
];

function SkeletonRows({ columns }) {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50 last:border-0">
          <td className="px-4 py-4 text-center">
            <div className="h-4 bg-gray-100 rounded mx-auto w-8" />
          </td>
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-4 text-center">
              <div className="h-4 bg-gray-100 rounded mx-auto" style={{ maxWidth: 100 }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function ProvidersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('individual');
  const [page, setPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const limit = 20;

  const suspendMutation = useSuspendProvider();

  useEffect(() => {
    const close = () => setOpenDropdownId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const individualQuery = useIndividualProviders(page, limit, {
    enabled: activeTab === 'individual',
  });
  const companyQuery = useCompanyOwners(page, limit, {
    enabled: activeTab === 'company',
  });
  const pendingQuery = usePendingProviders(page, limit, {
    enabled: true, // Always enabled to get the total badge count
  });

  const currentQuery = activeTab === 'individual' ? individualQuery : activeTab === 'company' ? companyQuery : pendingQuery;
  const { data, isLoading, isError } = currentQuery;

  const items = data?.items ?? [];
  const meta = data?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };
  const pendingTotal = pendingQuery.data?.meta?.total || 0;
  
  const baseColumns = activeTab === 'individual' ? individualColumns : activeTab === 'company' ? companyColumns : pendingColumns;
  const columns = [
    ...baseColumns,
    {
      key: 'actions',
      label: '',
      render: (p, idx, totalLength) => {
        if (activeTab === 'pending') {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/providers/pending/${p.providerId || p.id}`);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              مراجعة الطلب
            </button>
          );
        }

        const isLastRows = totalLength > 2 && idx >= totalLength - 2;
        const rowId = p.providerId || p.userId || p.ownerUserId || idx;
        return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdownId((prev) => (prev === rowId ? null : rowId));
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal size={16} />
          </button>
          {openDropdownId === rowId && (
            <div className={`absolute left-0 ${isLastRows ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white border border-gray-200 rounded-md shadow-lg z-50 w-44 p-2 flex flex-col gap-1`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  navigate(`/admin/providers/${p.providerId || p.id || p.ownerUserId || p.userId}`);
                }}
                className="w-full text-start px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                عرض التفاصيل
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  alert('قريباً');
                }}
                className="w-full text-start px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  suspendMutation.mutate(p.providerId);
                }}
                className="w-full text-start px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                تعليق
              </button>
            </div>
          )}
        </>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مزودو الخدمات</h1>
        <p className="text-sm text-gray-500 mt-1">
          إدارة وعرض جميع مزودي الخدمات المسجلين
        </p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => handleTabChange('individual')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'individual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            مزودون أفراد
          </button>
          <button
            onClick={() => handleTabChange('company')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'company'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            شركات
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            طلبات الانضمام
            {pendingTotal > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[260px] pb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="px-4 py-4 text-center font-semibold">#</th>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-4 text-center font-semibold">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {isLoading ? (
              <SkeletonRows columns={columns} />
            ) : isError ? (
              <tbody>
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-red-500"
                  >
                    فشل تحميل البيانات
                  </td>
                </tr>
              </tbody>
            ) : items.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    لم يتم العثور على مزودين
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {items.map((provider, idx) => {
                  const rowKey =
                    provider.userId ||
                    provider.ownerUserId ||
                    provider.providerId ||
                    idx;
                  return (
                    <tr
                      key={rowKey}
                      onClick={() => {
                        if (activeTab === 'pending') {
                          navigate(`/admin/providers/pending/${provider.providerId || provider.id}`);
                        } else {
                          navigate(`/admin/providers/${provider.providerId || provider.id || provider.ownerUserId || provider.userId}`);
                        }
                      }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4 text-center text-sm text-gray-400">
                        {(meta.page - 1) * meta.limit + idx + 1}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          onClick={
                            col.key === 'actions'
                              ? (e) => e.stopPropagation()
                              : undefined
                          }
                          className={`px-4 py-4 text-center text-sm text-gray-700 whitespace-nowrap ${
                            col.key === 'actions' ? 'relative' : ''
                          }`}
                        >
                          {col.render
                            ? col.render(provider, idx, items.length)
                            : provider[col.key] ?? (
                                <span className="text-gray-300">&mdash;</span>
                              )}
                        </td>
                      ))}
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
