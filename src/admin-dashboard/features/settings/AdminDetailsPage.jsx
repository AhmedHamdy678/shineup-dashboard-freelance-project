import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetAdminAccess, 
  useUpdateAdmin, 
  useResendActivationOtp,
  useAssignAdminRole,
  useRemoveAdminRole,
  useGrantAdminPermission,
  useRevokeAdminPermission,
  useGetRoles
} from './useAdmins';
import { useGetPermissions } from './useRolesAndPermissions';
import { ArrowRight, Trash2, Plus, RefreshCw, Save } from 'lucide-react';
import StatusBadge from '../../../shared/components/ui/StatusBadge';

export default function AdminDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading, isError } = useGetAdminAccess(userId);
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin(userId);
  const { mutate: resendOtp, isPending: isResending } = useResendActivationOtp(userId);
  
  const { mutate: assignRole, isPending: isAssigningRole } = useAssignAdminRole(userId);
  const { mutate: removeRole } = useRemoveAdminRole(userId);
  
  const { mutate: grantPermission, isPending: isGranting } = useGrantAdminPermission(userId);
  const { mutate: revokePermission } = useRevokeAdminPermission(userId);

  const { data: allRoles } = useGetRoles('PLATFORM');
  const { data: allPermissions } = useGetPermissions();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('');
  const [selectedPermToAdd, setSelectedPermToAdd] = useState('');

  const formatPhoneFromServer = (p) => {
    if (!p) return '';
    if (p.startsWith('9665')) return '05' + p.slice(4);
    if (p.startsWith('+9665')) return '05' + p.slice(5);
    return p;
  };

  // Sync basic info state when data loads
  useEffect(() => {
    if (data?.user) {
      setFullName(data.user.fullName || '');
      setEmail(data.user.email || '');
      const formatted = formatPhoneFromServer(data.user.phone);
      setPhone(formatted);
      setOriginalPhone(formatted);
    }
  }, [data]);

  if (isLoading) return <div className="p-6 text-gray-500">جارٍ تحميل بيانات المشرف...</div>;
  if (isError || !data) return <div className="p-6 text-red-500">حدث خطأ في تحميل البيانات. قد يكون المشرف غير موجود.</div>;

  const { user, roles, directPermissions, effectivePermissions } = data;

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    setPhoneError('');
    
    const payload = {};
    if (fullName !== data.user.fullName) payload.fullName = fullName;
    if (email !== data.user.email) payload.email = email;
    
    if (phone !== originalPhone) {
      const saudiPhoneRegex = /^05\d{8}$/;
      if (!saudiPhoneRegex.test(phone)) {
        setPhoneError('رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
        return;
      }
      payload.phone = phone;
    }

    if (Object.keys(payload).length === 0) return; // No changes made

    updateAdmin(payload);
  };

  const handleAddRole = () => {
    if (selectedRoleToAdd) {
      const selectedRole = allRoles?.find(r => r.id === selectedRoleToAdd);
      const isSuperAdmin = selectedRole?.name === 'super_admin';
      
      assignRole(
        { roleId: selectedRoleToAdd, confirmRootAccess: isSuperAdmin }, 
        { onSuccess: () => setSelectedRoleToAdd('') }
      );
    }
  };

  const handleAddPermission = () => {
    if (selectedPermToAdd) {
      grantPermission({ permissionId: selectedPermToAdd }, { onSuccess: () => setSelectedPermToAdd('') });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {user.fullName || 'مشرف غير مسمى'}
            <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
          </h2>
          <p className="text-sm text-gray-500 mt-1">إدارة تفاصيل المشرف، أدواره وصلاحياته</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">البيانات الأساسية</h3>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-left ${phoneError ? 'border-red-500' : 'border-gray-200'}`}
                  dir="ltr"
                  placeholder="05XXXXXXXX"
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                {user.activationStatus === 'PENDING_ACTIVATION' && (
                  <button
                    type="button"
                    onClick={() => resendOtp()}
                    disabled={isResending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    إعادة إرسال رمز التفعيل (OTP)
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Column 2 & 3: Roles & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Roles Management */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">الأدوار المخصصة (Roles)</h3>
            
            <div className="flex gap-2 mb-4">
              <select
                value={selectedRoleToAdd}
                onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">-- اختر دوراً لإضافته --</option>
                {allRoles?.filter(r => !roles.some(assigned => assigned.id === r.id)).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                onClick={handleAddRole}
                disabled={!selectedRoleToAdd || isAssigningRole}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>

            <div className="space-y-2">
              {roles.length === 0 && <p className="text-sm text-gray-400">لا توجد أدوار مخصصة.</p>}
              {roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="font-medium text-gray-700">{r.name}</span>
                  <button
                    onClick={() => removeRole({ roleId: r.id })}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="إزالة الدور"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Permissions Exceptions */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">صلاحيات استثنائية مباشرة</h3>
            <p className="text-sm text-gray-500 mb-4">
              تمنح هذه الصلاحيات للمستخدم مباشرة حتى وإن لم تكن ضمن أدواره.
            </p>

            <div className="flex gap-2 mb-4">
              <select
                value={selectedPermToAdd}
                onChange={(e) => setSelectedPermToAdd(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">-- اختر صلاحية لإضافتها --</option>
                {allPermissions?.filter(p => !directPermissions.some(assigned => assigned.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.description}</option>
                ))}
              </select>
              <button
                onClick={handleAddPermission}
                disabled={!selectedPermToAdd || isGranting}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>

            <div className="space-y-2">
              {directPermissions.length === 0 && <p className="text-sm text-gray-400">لا توجد صلاحيات استثنائية.</p>}
              {directPermissions.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{p.name}</p>
                    {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                  </div>
                  <button
                    onClick={() => revokePermission({ permissionId: p.id })}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="سحب الصلاحية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Effective Permissions (Read Only) */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إجمالي الصلاحيات الفعالة</h3>
            <p className="text-sm text-gray-500 mb-4">
              قائمة بجميع الصلاحيات التي يمتلكها هذا المستخدم (من خلال الأدوار والصلاحيات المباشرة).
            </p>
            
            <div className="flex flex-wrap gap-2">
              {effectivePermissions.length === 0 && <p className="text-sm text-gray-400">لا توجد صلاحيات فعالة.</p>}
              {effectivePermissions.map(p => (
                <span key={p.id} className="px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
