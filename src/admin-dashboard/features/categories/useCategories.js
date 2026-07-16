import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
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
    onError: (err) => alert(err?.response?.data?.message || 'Failed to create category'),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: invalidate,
    onError: (err) => alert(err?.response?.data?.message || 'Failed to update category'),
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
    onError: (err) => alert(err?.response?.data?.message || 'Failed to delete category'),
  });

  return { create, update, remove };
}
