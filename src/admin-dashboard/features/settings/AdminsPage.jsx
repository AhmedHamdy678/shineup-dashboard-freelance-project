import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdmins, useToggleAdminStatus, useGetRoles } from './useAdmins';
import Table from '../../../shared/components/ui/Table';
import Toggle from '../../../shared/components/ui/Toggle';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import Pagination from '../../../shared/components/ui/Pagination';
import { Plus, Search, Filter } from 'lucide-react';
import AddAdminModal from './AddAdminModal';

export default function AdminsPage() {
  const navigate = useNavigate();
  
  // Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Handle filter changes (reset page to 1)
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  // Queries
  const { data: adminsData, isLoading, isError } = useGetAdmins({
    page,
    limit,
    search: debouncedSearch,
    isActive: isActiveFilter,
    roleId: roleFilter
  });
  
  const { data: roles } = useGetRoles('PLATFORM', '');
  const { mutate: toggleStatus } = useToggleAdminStatus();

  // Extract pagination and items
  const admins = Array.isArray(adminsData) ? adminsData : (adminsData?.items || adminsData?.data || []);
  const totalResults = adminsData?.meta?.total || adminsData?.total || admins.length;

  const columns = [
    {
      key: 'fullName',
      label: 'الاسم',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
            {val ? val.charAt(0) : 'M'}
          </div>
          <span className="font-medium text-gray-900">{val || 'غير محدد'}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني',
    },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      render: (val) => <span dir="ltr">{val}</span>
    },
    {
      key: 'roles',
      label: 'الدور',
      render: (_, row) => {
        const rowRoles = row.roles || [];
        if (rowRoles.length === 0) return <span className="text-gray-400">لا يوجد</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {rowRoles.map(r => (
              <span key={r.id || r.name} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {r.name}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      key: 'statusBadge',
      label: 'الحالة',
      render: (_, row) => (
        <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'actions',
      label: 'تعطيل/تفعيل',
      render: (_, row) => (
        <div className="flex justify-center" onClick={e => e.stopPropagation()}>
          <Toggle 
            value={row.isActive} 
            onChange={(checked) => toggleStatus({ userId: row.id, isActive: checked })} 
          />
        </div>
      )
    }
  ];

  if (isError) return <div className="p-6 text-red-500">حدث خطأ في تحميل بيانات المشرفين</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">المشرفين</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة حسابات المشرفين، الأدوار، وحالات التفعيل</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة مشرف
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، أو رقم الهاتف..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-40">
            <select
              value={isActiveFilter}
              onChange={(e) => handleFilterChange(setIsActiveFilter, e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none"
            >
              <option value="all">كل الحالات</option>
              <option value="true">نشط</option>
              <option value="false">معطل</option>
            </select>
          </div>

          <div className="relative w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none"
            >
              <option value="all">كل الأدوار</option>
              {roles?.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table & Pagination */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p>جارٍ التحميل...</p>
            </div>
          ) : admins?.length > 0 ? (
            <Table columns={columns} rows={admins} onRowClick={(row) => navigate(`/admin/settings/access/admins/${row.id}`)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
              <Filter className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">لا يوجد مشرفين يطابقون بحثك</p>
              <p className="text-sm mt-1">حاول تغيير خيارات التصفية أو البحث مرة أخرى.</p>
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && admins?.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50">
            <Pagination
              currentPage={page}
              totalResults={totalResults}
              pageSize={limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddAdminModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}
