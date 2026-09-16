import { useState, useEffect } from 'react';
import { useGetRoles, useDeleteRole } from './useRolesAndPermissions';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Pagination from '../../../shared/components/ui/Pagination';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Plus, Edit2, Trash2, Search } from 'lucide-react';
import RoleFormModal from './RoleFormModal';

export default function RolesPage() {
  const navigate = useNavigate();
  // Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [roleToEdit, setRoleToEdit] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
  const { data: rolesData, isLoading, isError } = useGetRoles({
    page,
    limit,
    search: debouncedSearch,
  });
  
  const { mutate: deleteRole } = useDeleteRole();

  // Extract pagination and items
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData?.items || rolesData?.data || []);
  const totalResults = rolesData?.meta?.total || rolesData?.total || roles.length;

  const columns = [
    {
      key: 'name',
      label: 'اسم الدور',
      render: (val, row) => (
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          {row.isSystem ? <ShieldCheck className="w-5 h-5 text-blue-500" /> : <ShieldAlert className="w-5 h-5 text-gray-400" />}
          {val}
        </div>
      )
    },
    {
      key: 'scopeType',
      label: 'نطاق الدور',
      render: (val) => (
        <span className="text-gray-500 text-sm capitalize">{val?.toLowerCase() || 'platform'}</span>
      )
    },
    {
      key: 'isSystem',
      label: 'النوع',
      render: (val) => (
        <Badge variant={val ? 'info' : 'default'}>
          {val ? 'أساسي (نظام)' : 'مخصص'}
        </Badge>
      )
    },
    {
      key: 'assignedUsersCount',
      label: 'عدد المشرفين',
      render: (val) => (
        <span className="font-semibold text-gray-700">{val || 0}</span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/admin/settings/access/roles/${row.id}`)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            title="إدارة تفاصيل وصلاحيات الدور"
          >
            تفاصيل الدور
          </button>
          
          <button
            onClick={() => setRoleToEdit(row)}
            disabled={row.isSystem && !row.mutable}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isSystem && !row.mutable
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
            }`}
            title={row.isSystem && !row.mutable ? 'هذا الدور للقراءة فقط' : 'تعديل رمز الدور'}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف الدور: ${row.name}؟`)) {
                deleteRole(row.id);
              }
            }}
            disabled={row.isSystem}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isSystem
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
            }`}
            title={row.isSystem ? 'لا يمكن حذف الأدوار الأساسية' : 'حذف الدور'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isError) return <div className="p-6 text-red-500">حدث خطأ في تحميل بيانات الأدوار</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">الأدوار (Roles)</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة أدوار النظام وتخصيص صلاحياتها</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إنشاء دور جديد
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن دور بالاسم..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
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
          ) : roles?.length > 0 ? (
            <Table columns={columns} rows={roles} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
              <ShieldAlert className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">لا توجد أدوار تطابق بحثك</p>
              <p className="text-sm mt-1">حاول تغيير خيارات التصفية أو البحث مرة أخرى.</p>
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && roles?.length > 0 && (
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

      {/* Modals */}
      {(isCreateModalOpen || roleToEdit) && (
        <RoleFormModal
          roleToEdit={roleToEdit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setRoleToEdit(null);
          }}
        />
      )}
    </div>
  );
}
