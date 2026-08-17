import { useState } from 'react';
import { Plus, Pencil, Trash2, LayoutList, AlertTriangle } from 'lucide-react';
import { useServices, useServiceMutations } from './useServices';
import { useCategories } from '../categories/useCategories';
import ServiceModal from './ServiceModal';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import Modal from '../../../shared/components/ui/Modal';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices();
  const { data: categories = [] } = useCategories();
  const { create, update, remove } = useServiceMutations();

  const [modal, setModal] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState('all');

  const filtered = services
    .filter((s) => filterCategoryId === 'all' || s.categoryId === filterCategoryId);

  const handleSubmit = (form) => {
    if (modal === 'add') {
      create.mutate(form, { 
        onSuccess: () => {
          setModal(null);
          toast.success('تمت إضافة الخدمة بنجاح');
        } 
      });
    } else {
      update.mutate(
        { id: modal.id, payload: form },
        { 
          onSuccess: () => {
            setModal(null);
            toast.success('تم تعديل الخدمة بنجاح');
          } 
        }
      );
    }
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      remove.mutate(serviceToDelete.id, {
        onSuccess: () => {
          setServiceToDelete(null);
          toast.success('تم الحذف بنجاح');
        }
      });
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500 font-medium">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الخدمات</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة قائمة الخدمات الأساسية. يمكن لمزودي الخدمة اختيار خدماتهم من هنا.
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition"
        >
          <Plus size={16} />
          إضافة خدمة
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategoryId('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${filterCategoryId === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategoryId(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${filterCategoryId === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.nameAr || cat.nameEn}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <LayoutList size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">لم يتم العثور على أي خدمات.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                  <th className="px-6 py-4 text-start font-semibold w-12">#</th>
                  <th className="px-4 py-4 text-start font-semibold">الخدمة</th>
                  <th className="px-4 py-4 text-start font-semibold">القسم</th>
                  <th className="px-4 py-4 text-start font-semibold">الحالة</th>
                  <th className="px-4 py-4 text-end font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((svc, idx) => (
                  <tr key={svc.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 text-gray-400 text-sm font-medium">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{svc.nameAr || svc.nameEn}</p>
                      {(svc.descriptionAr || svc.descriptionEn) && (
                        <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {svc.descriptionAr || svc.descriptionEn}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {svc.category?.nameAr || svc.category?.nameEn || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={svc.activeIs ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal(svc)}
                          title="تعديل"
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setServiceToDelete(svc)}
                          title="حذف"
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ServiceModal
          initial={modal === 'add' ? null : modal}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
          isLoading={create.isPending || update.isPending}
        />
      )}

      {serviceToDelete && (
        <Modal title="تأكيد الحذف" onClose={() => setServiceToDelete(null)} size="sm">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-500 text-sm">
              هل تريد حقاً حذف الخدمة <span className="font-bold text-gray-900">"{serviceToDelete.nameAr || serviceToDelete.nameEn}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setServiceToDelete(null)}
              disabled={remove.isPending}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              إلغاء
            </button>
            <button
              onClick={confirmDelete}
              disabled={remove.isPending}
              className="flex-1 py-2.5 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {remove.isPending ? 'جاري الحذف...' : 'نعم، احذف الخدمة'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
