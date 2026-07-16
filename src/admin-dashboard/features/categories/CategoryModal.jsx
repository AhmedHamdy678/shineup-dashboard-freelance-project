import { useState } from 'react';
import Modal from '../../../shared/components/ui/Modal';
import Toggle from '../../../shared/components/ui/Toggle';

// جعل الحقول الاختيارية تبدأ بنص فارغ "" في الـ State لكي لا تسبب مشاكل بالـ inputs
const empty = { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', image: null, orderSort: 1, activeIs: true };

export default function CategoryModal({ initial = null, onSubmit, onClose, isLoading }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? {
          ...empty,
          ...initial,
          nameAr: initial.nameAr || '',
          nameEn: initial.nameEn || initial.name || '',
          descriptionAr: initial.descriptionAr || '',
          descriptionEn: initial.descriptionEn || initial.description || '',
        }
      : empty
  );
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    // الحقل الإلزامي الوحيد بناءً على تجربة الباك إند
    if (!form.nameAr.trim()) e.nameAr = 'Arabic name is required';
    if (!form.nameEn.trim()) e.nameEn = 'English name is required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, orderSort: form.orderSort ? Number(form.orderSort) : undefined });
  };

  return (
    <Modal
      title={isEdit ? 'Edit Category' : 'Add Category'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Name Arabic - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (Arabic) <span className="text-red-500">*</span>
          </label>
          <input
            value={form.nameAr}
            onChange={(e) => set('nameAr', e.target.value)}
            placeholder="اسم التصنيف"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.nameAr ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.nameAr && <p className="text-xs text-red-500 mt-1">{errors.nameAr}</p>}
        </div>

        {/* Name English - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (English) <span className="text-red-500">*</span>
          </label>
          <input
            value={form.nameEn}
            onChange={(e) => set('nameEn', e.target.value)}
            placeholder="Category name"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.nameEn ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.nameEn && <p className="text-xs text-red-500 mt-1">{errors.nameEn}</p>}
        </div>

        {/* Description Arabic - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Arabic)
          </label>
          <textarea
            value={form.descriptionAr}
            onChange={(e) => set('descriptionAr', e.target.value)}
            placeholder="وصف التصنيف"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Description English - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (English)
          </label>
          <textarea
            value={form.descriptionEn}
            onChange={(e) => set('descriptionEn', e.target.value)}
            placeholder="Category description"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              min={1}
              value={form.orderSort || ''}
              onChange={(e) => set('orderSort', e.target.value)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-end py-2">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Inactive are hidden</p>
              </div>
              <Toggle
                value={form.activeIs}
                onChange={(val) => set('activeIs', val)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </Modal>
  );
}