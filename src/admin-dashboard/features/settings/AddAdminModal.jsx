import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/ui/Modal';
import { useAddAdmin, useGetRoles } from './useAdmins';

export default function AddAdminModal({ onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // e.g. 0512345678
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Fetch ALL platform roles
  const { data: roles, isLoading: isLoadingRoles } = useGetRoles('PLATFORM', '');
  const { mutate: addAdmin, isPending } = useAddAdmin();

  // Try to default to 'admin' role if available, otherwise just use the first available
  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRoleId) {
      const adminRole = roles.find(r => r.name.toLowerCase() === 'admin');
      if (adminRole) {
        setSelectedRoleId(adminRole.id);
      } else {
        setSelectedRoleId(roles[0].id);
      }
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles?.find(r => r.id === selectedRoleId);
  const isSuperAdmin = selectedRole?.name === 'super_admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    
    // Basic saudi phone format check
    const formattedPhone = phone.startsWith('05') ? phone : `05${phone.replace(/^(\+966|966|05)/, '')}`;

    const payload = {
      fullName,
      email,
      phone: formattedPhone,
      roleIds: [selectedRoleId]
    };

    if (isSuperAdmin) {
      payload.confirmRootAccess = true;
    }

    addAdmin(
      payload,
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <Modal title="إضافة مشرف جديد" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="مثال: أحمد محمد"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (السعودية)</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
            dir="ltr"
            placeholder="05XXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الدور المبدئي</label>
          {isLoadingRoles ? (
            <p className="text-sm text-gray-500 px-4 py-2 border border-gray-200 rounded-xl bg-gray-50">جارٍ جلب الأدوار...</p>
          ) : (
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="" disabled>-- اختر الدور --</option>
              {roles?.map(r => (
                <option key={r.id} value={r.id}>{r.name} {r.isSystem ? '(أساسي)' : ''}</option>
              ))}
            </select>
          )}
          {isSuperAdmin && (
            <p className="mt-2 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              تحذير: أنت على وشك منح صلاحيات جذرية كاملة لهذا الحساب.
            </p>
          )}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending || !selectedRoleId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {isPending ? 'جاري الإضافة...' : 'إضافة المشرف'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
