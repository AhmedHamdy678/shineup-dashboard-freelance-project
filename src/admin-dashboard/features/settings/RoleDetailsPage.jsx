import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetRolePermissions, useGetPermissions, useUpdateRolePermissions } from './useRolesAndPermissions';
import { ArrowRight, ShieldCheck, Save, ShieldAlert, Users, Info } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';

export default function RoleDetailsPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();

  // Fetch role metadata and assigned permissions together
  const { data: roleData, isLoading: loadingRole, isError: errorRole } = useGetRolePermissions(roleId);
  // Fetch full permission catalog
  const { data: allPermissions, isLoading: loadingPerms } = useGetPermissions();
  // Mutation to update assigned permissions
  const { mutate: updatePermissions, isPending: isUpdating } = useUpdateRolePermissions(roleId);

  const roleDetails = roleData?.role;
  const assignedPermissions = roleData?.permissions || [];

  const [selectedIds, setSelectedIds] = useState(new Set());

  // Initialize selected checkboxes from assigned permissions
  useEffect(() => {
    if (assignedPermissions.length > 0) {
      setSelectedIds(new Set(assignedPermissions.map(p => p.id)));
    }
  }, [roleData]); // Depend on roleData so it runs when data is fetched

  const handleToggle = (permId) => {
    if (roleDetails?.mutable === false) return; // Prevent toggle if readonly
    const next = new Set(selectedIds);
    if (next.has(permId)) {
      next.delete(permId);
    } else {
      next.add(permId);
    }
    setSelectedIds(next);
  };

  const handleSelectAllGroup = (groupPerms, isAllSelected) => {
    if (roleDetails?.mutable === false) return;
    const next = new Set(selectedIds);
    groupPerms.forEach(p => {
      if (isAllSelected) next.delete(p.id);
      else next.add(p.id);
    });
    setSelectedIds(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roleDetails?.mutable === false) return;
    
    updatePermissions(Array.from(selectedIds), {
      onSuccess: () => {
        // Optionally show success message, already handled in hook
      }
    });
  };

  if (loadingRole || loadingPerms) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p>جارٍ تحميل تفاصيل الدور...</p>
      </div>
    );
  }

  if (errorRole || !roleDetails) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">حدث خطأ</h2>
        <p className="text-gray-500 mt-2">لم نتمكن من العثور على بيانات هذا الدور أو حدث خطأ في الاتصال.</p>
        <button onClick={() => navigate('/admin/settings/access/roles')} className="mt-6 text-blue-600 font-medium">
          العودة لقائمة الأدوار
        </button>
      </div>
    );
  }

  // Group permissions by module from the full catalog (fallback to parsing name if module isn't present)
  const groupedPermissions = (allPermissions || []).reduce((acc, perm) => {
    // The backend provides 'module', but if missing, fallback to parsing 'name' (e.g. admin.dashboard.read -> dashboard)
    const moduleName = perm.module || (perm.name.includes('.') ? perm.name.split('.')[1] || perm.name.split('.')[0] : 'أخرى');
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(perm);
    return acc;
  }, {});

  const isReadOnly = roleDetails.mutable === false;

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/settings/access/roles')} 
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {roleDetails.name}
            {roleDetails.isSystem ? (
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-gray-400" />
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">تخصيص صلاحيات هذا الدور والتحكم بميزاته</p>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">التصنيف</p>
            <p className="font-bold text-gray-900 capitalize">{roleDetails.classification || (roleDetails.isSystem ? 'SYSTEM' : 'CUSTOM')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">عدد المشرفين المرتبطين</p>
            <p className="font-bold text-gray-900">{roleDetails.assignedUsersCount || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isReadOnly ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">حالة التعديل</p>
            {isReadOnly ? (
              <Badge variant="error" className="mt-1">System Role - Read Only</Badge>
            ) : (
              <Badge variant="success" className="mt-1">قابل للتعديل</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">صلاحيات الدور (Permissions)</h3>
            <p className="text-sm text-gray-500 mt-1">حدد الصلاحيات التي يمتلكها المشرفون المرتبطون بهذا الدور.</p>
          </div>
          {!isReadOnly && (
            <button
              type="submit"
              disabled={isUpdating}
              className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          )}
        </div>

        <div className="p-6 space-y-8 bg-gray-50/30">
          {Object.entries(groupedPermissions).map(([module, perms]) => {
            const isAllSelected = perms.length > 0 && perms.every(p => selectedIds.has(p.id));
            
            return (
              <div key={module} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50/80 px-5 py-4 flex items-center justify-between border-b border-gray-200">
                  <h4 className="font-bold text-gray-800 capitalize flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    وحدة: {module}
                  </h4>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleSelectAllGroup(perms, isAllSelected)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                    >
                      {isAllSelected ? 'إلغاء التحديد للمجموعة' : 'تحديد الكل'}
                    </button>
                  )}
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {perms.map(p => (
                    <label 
                      key={p.id} 
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        selectedIds.has(p.id) ? 'border-blue-200 bg-blue-50/50' : 'border-transparent hover:bg-gray-50'
                      } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer group'}`}
                    >
                      <input
                        type="checkbox"
                        className={`mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                        checked={selectedIds.has(p.id)}
                        onChange={() => handleToggle(p.id)}
                        disabled={isReadOnly}
                      />
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold transition-colors ${
                          selectedIds.has(p.id) ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'
                        }`}>
                          {p.name}
                        </span>
                        {p.description && (
                          <span className="text-xs text-gray-500 mt-1 leading-relaxed">{p.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Save Button (Sticky) */}
        {!isReadOnly && (
          <div className="md:hidden sticky bottom-0 p-4 bg-white border-t border-gray-100 shadow-lg">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isUpdating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
