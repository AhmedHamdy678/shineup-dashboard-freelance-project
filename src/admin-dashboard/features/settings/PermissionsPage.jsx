import { useGetPermissions } from './useRolesAndPermissions';
import Table from '../../../shared/components/ui/Table';

export default function PermissionsPage() {
  const { data: permissions, isLoading, isError } = useGetPermissions();

  const columns = [
    {
      key: 'name',
      label: 'رمز الصلاحية (Key)',
      render: (val) => <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">{val}</span>
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (val) => <span className="text-gray-600 text-sm">{val || 'بدون وصف'}</span>
    },
    {
      key: 'scopeType',
      label: 'النطاق',
      render: (val) => <span className="text-xs font-semibold text-gray-500 uppercase">{val}</span>
    }
  ];

  if (isLoading) return <div className="p-6 text-gray-500">جارٍ التحميل...</div>;
  if (isError) return <div className="p-6 text-red-500">حدث خطأ في تحميل بيانات الصلاحيات</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">الصلاحيات (Permissions)</h2>
          <p className="text-sm text-gray-500 mt-1">عرض فهرس الصلاحيات المتاحة في النظام</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
        {permissions?.length > 0 ? (
          <Table columns={columns} rows={permissions} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">لا توجد صلاحيات لعرضها</p>
            <p className="text-sm mt-1">لم يتم العثور على أي صلاحيات مسجلة في النظام.</p>
          </div>
        )}
      </div>
    </div>
  );
}
