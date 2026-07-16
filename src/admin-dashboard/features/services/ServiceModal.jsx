import { useState } from 'react';
import Modal from '../../../shared/components/ui/Modal';
import Toggle from '../../../shared/components/ui/Toggle';

const empty = { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', categoryId: '', type: 'SERVICE', image: null, activeIs: true };

export default function ServiceModal({ initial = null, categories = [], onSubmit, onClose, isLoading }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? {
          ...empty,
          ...initial,
          nameAr: initial.nameAr || '',
          nameEn: initial.nameEn || '',
          descriptionAr: initial.descriptionAr || '',
          descriptionEn: initial.descriptionEn || '',
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
    if (!form.nameAr.trim() && !form.nameEn.trim()) e.nameEn = 'At least one name is required';
    if (!form.categoryId) e.categoryId = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal title={isEdit ? 'Edit Service' : 'Add Service'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.categoryId ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">Select a category...</option>
            {categories
              .filter((c) => c.activeIs)
              .map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr || c.nameEn || c.name}</option>
              ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
            <input
              value={form.nameAr}
              onChange={(e) => set('nameAr', e.target.value)}
              placeholder="اسم الخدمة"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nameEn}
              onChange={(e) => set('nameEn', e.target.value)}
              placeholder="e.g. Express Wash"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.nameEn ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.nameEn && <p className="text-xs text-red-500 mt-1">{errors.nameEn}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
            <textarea
              value={form.descriptionAr}
              onChange={(e) => set('descriptionAr', e.target.value)}
              placeholder="وصف الخدمة"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => set('descriptionEn', e.target.value)}
              placeholder="Brief description of this service..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Active</p>
            <p className="text-xs text-gray-400">Inactive services are hidden from providers</p>
          </div>
          <Toggle
            value={form.activeIs}
            onChange={(val) => set('activeIs', val)}
          />
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
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Service'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
