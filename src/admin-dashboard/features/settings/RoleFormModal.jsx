import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/ui/Modal';
import { useCreateRole, useUpdateRole } from './useRolesAndPermissions';

export default function RoleFormModal({ roleToEdit, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  const isEditing = !!roleToEdit;
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name || '');
    }
  }, [roleToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Backend validation constraint: ^[a-z][a-z0-9_]{2,63}$
    const nameRegex = /^[a-z][a-z0-9_]{2,63}$/;
    if (!nameRegex.test(name)) {
      setError("يجب أن يبدأ اسم الدور بحرف إنجليزي صغير، ويحتوي فقط على أحرف صغيرة وأرقام وشرطة سفلية (3-64 حرف). مثال: manager_role");
      return;
    }

    if (isEditing) {
      updateRole(
        { roleId: roleToEdit.id, payload: { name } },
        { onSuccess: () => onClose() }
      );
    } else {
      createRole(
        { name, scopeType: "PLATFORM" },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <Modal title={isEditing ? 'تعديل الدور' : 'إنشاء دور جديد'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رمز الدور (Role Name)</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
            dir="ltr"
            placeholder="مثال: custom_admin"
          />
          <p className="text-xs text-gray-400 mt-1">
            أحرف إنجليزية صغيرة، أرقام، وشرطة سفلية فقط (_) بدون مسافات.
          </p>
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
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {isPending ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إنشاء الدور')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
