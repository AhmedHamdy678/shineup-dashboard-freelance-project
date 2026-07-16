import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../../api/endpoints/services.api';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });
}

export function useServiceMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const create = useMutation({ mutationFn: createService, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, payload }) => updateService(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteService, onSuccess: invalidate });

  return { create, update, remove };
}
