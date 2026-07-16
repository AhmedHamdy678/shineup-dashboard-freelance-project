import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useProviderServices() {
  return useQuery({
    queryKey: ["provider-services"],
    queryFn: getProviderServices,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
    },
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
