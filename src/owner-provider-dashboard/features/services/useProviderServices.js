import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';
import {
  fetchCatalogServices,
  getProviderServices,
  addProviderService,
  updateProviderService,
  updateProviderServicePrices,
  deleteProviderService
} from "../../api/services.api";

export function useCatalogServices() {
  return useQuery({
    queryKey: ["catalog-services"],
    queryFn: fetchCatalogServices,
    staleTime: 1000 * 60 * 5, // Catalog changes infrequently
  });
}

export function useProviderServices(availableIs) {
  return useQuery({
    queryKey: ["provider-services", availableIs],
    queryFn: () => getProviderServices(availableIs),
    staleTime: 1000 * 60,
  });
}

export function useAddProviderService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProviderService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
    },
  });
}

export function useUpdateProviderService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderService,
    onMutate: async (updatedData) => {
      await queryClient.cancelQueries({ queryKey: ["provider-services"] });
      const previousServices = queryClient.getQueryData(["provider-services"]);
      
      if (previousServices) {
        queryClient.setQueryData(["provider-services"], old => {
          if (!old) return old;
          return old.map(s => s.id === updatedData.id ? { ...s, ...updatedData } : s);
        });
      }
      return { previousServices };
    },
    onError: (err, variables, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(["provider-services"], context.previousServices);
      }
      toast.error(getApiErrorMessage(err, 'فشل تحديث الخدمة'));
    }
  });
}

export function useUpdateProviderServicePrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderServicePrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
    },
  });
}

export function useDeleteProviderService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProviderService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
    },
  });
}
