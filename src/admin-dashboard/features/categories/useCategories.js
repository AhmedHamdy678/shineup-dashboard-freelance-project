import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../../api/endpoints/categories.api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: invalidate,
    onError: (err) => toast.error(err?.response?.data?.message || 'فشل إنشاء التصنيف'),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: invalidate,
    onError: (err) => toast.error(err?.response?.data?.message || 'فشل تحديث التصنيف'),
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
    onError: (err) => toast.error(err?.response?.data?.message || 'فشل حذف التصنيف'),
  });

  const reorder = useMutation({
    mutationFn: reorderCategories,
    onSuccess: invalidate,
    onError: (err) => toast.error(err?.response?.data?.message || 'فشل تغيير ترتيب التصنيفات'),
  });

  return { create, update, remove, reorder };
}
