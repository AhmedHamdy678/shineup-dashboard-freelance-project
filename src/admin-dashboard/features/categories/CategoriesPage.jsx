import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, AlertTriangle, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useCategories, useCategoryMutations } from './useCategories';
import { useServices } from '../services/useServices';
import CategoryModal from './CategoryModal';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import Modal from '../../../shared/components/ui/Modal';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useCategories();
  const { data: servicesData } = useServices();

  const categories = categoriesData || [];
  const services = servicesData || [];
  const { create, update, remove, reorder } = useCategoryMutations();

  const [modal, setModal] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [localCategories, setLocalCategories] = useState([]);

  useEffect(() => {
    if (categoriesData) {
      setLocalCategories([...categoriesData].sort((a, b) => (a.orderSort || 0) - (b.orderSort || 0)));
    }
  }, [categoriesData]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(localCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalCategories(items);
    
    const payloadItems = items.map((item, index) => ({
      id: item.id,
      orderSort: index + 1
    }));
    
    reorder.mutate(payloadItems);
  };

  const serviceCountFor = (categoryId) =>
    services.filter((s) => s.categoryId === categoryId).length;

  const handleSubmit = (form) => {
    if (modal === 'add') {
      create.mutate(form, { 
        onSuccess: () => {
          setModal(null);
          toast.success('تمت إضافة القسم بنجاح');
        } 
      });
    } else {
      update.mutate(
        { id: modal.id, payload: form },
        { 
          onSuccess: () => {
            setModal(null);
            toast.success('تم تعديل القسم بنجاح');
          } 
        }
      );
    }
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      remove.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setCategoryToDelete(null);
          toast.success('تم حذف القسم بنجاح');
        }
      });
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500 font-medium">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأقسام</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة الأقسام المتاحة لمزودي الخدمات.
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition"
        >
          <Plus size={16} />
          إضافة قسم
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <Layers size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">لا توجد أقسام حتى الآن. أضف القسم الأول.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                  <th className="w-10 px-4 py-4 text-center"></th>
                  <th className="px-6 py-4 text-start font-semibold w-12">#</th>
                  <th className="px-4 py-4 text-start font-semibold">القسم</th>
                  <th className="px-4 py-4 text-start font-semibold">الخدمات المرتبطة</th>
                  <th className="px-4 py-4 text-start font-semibold">الحالة</th>
                  <th className="px-4 py-4 text-start font-semibold">الوصف</th>
                  <th className="px-4 py-4 text-end font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="categories-table">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                      {localCategories.map((cat, index) => (
                        <Draggable key={cat.id} draggableId={cat.id} index={index}>
                          {(provided) => (
                            <tr 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition bg-white"
                            >
                              <td className="px-4 py-4 text-center text-gray-400">
                                <div {...provided.dragHandleProps} className="inline-block">
                                  <GripVertical size={18} className="cursor-grab hover:text-gray-600" />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm font-medium">{index + 1}</td>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-gray-900">{cat.nameAr || cat.name}</p>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md">
                                  {serviceCountFor(cat.id)}
                                  <span className="text-blue-500 font-medium text-xs">خدمة</span>
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <StatusBadge status={cat.activeIs ? 'active' : 'inactive'} />
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                                {cat.descriptionAr || cat.description || '—'}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setModal(cat)}
                                    title="تعديل"
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => setCategoryToDelete(cat)}
                                    title="حذف"
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </DragDropContext>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <CategoryModal
          initial={modal === 'add' ? null : modal}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
          isLoading={create.isPending || update.isPending}
        />
      )}

      {categoryToDelete && (
        <Modal title="تأكيد الحذف" onClose={() => setCategoryToDelete(null)} size="sm">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-500 text-sm">
              هل تريد حقاً حذف القسم <span className="font-bold text-gray-900">"{categoryToDelete.nameAr || categoryToDelete.name}"</span>؟
            </p>
            {serviceCountFor(categoryToDelete.id) > 0 && (
              <p className="text-red-600 text-sm font-medium mt-2 bg-red-50 px-3 py-2 rounded-lg">
                يحتوي هذا القسم على ({serviceCountFor(categoryToDelete.id)}) خدمة ستُحذف أيضاً!
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setCategoryToDelete(null)}
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
              {remove.isPending ? 'جاري الحذف...' : 'نعم، احذف القسم'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
