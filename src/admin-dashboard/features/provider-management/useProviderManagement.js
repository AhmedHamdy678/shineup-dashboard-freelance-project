import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProviderManagement,
  getProviderManagement,
  patchProviderManagement,
} from "../../api/endpoints/providerManagement.api";

const detailIncludes = [
  "profile",
  "members",
  "services",
  "servicePrices",
  "coverage",
  "schedule",
];

export function useProviderManagementList(filters) {
  return useQuery({
    queryKey: ["admin-provider-management", "list", filters],
    queryFn: () => getProviderManagement(filters),
    staleTime: 15_000,
  });
}

export function useProviderManagementDetail(providerId, options = {}) {
  const query = {
    providerId,
    include: options.include || detailIncludes,
    targetMemberId: options.targetMemberId,
  };
  if (options.providerServiceId)
    query.providerServiceId = options.providerServiceId;
  if (options.pricesPage) query.pricesPage = options.pricesPage;
  if (options.pricesLimit) query.pricesLimit = options.pricesLimit;
  return useQuery({
    queryKey: ["admin-provider-management", "detail", query],
    queryFn: () => getProviderManagement(query),
    enabled: Boolean(providerId) && options.enabled !== false,
    staleTime: options.staleTime ?? 10_000,
  });
}

/** Loads a registered-only applicant without Provider deep includes. */
export function useRegisteredProviderApplicant(ownerUserId) {
  const query = { ownerUserId };
  return useQuery({
    queryKey: ["admin-provider-management", "registered-detail", query],
    queryFn: () => getProviderManagement(query),
    enabled: Boolean(ownerUserId),
    staleTime: 10_000,
  });
}

/** Completes registration by creating a ProviderProfile for the selected User. */
export function useCreateAdminProviderProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, files }) =>
      createProviderManagement(payload, files),
    retry: false,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["admin-provider-management", "list"],
      });
      await client.invalidateQueries({
        queryKey: ["admin-provider-management", "registered-detail"],
        refetchType: "none",
      });
      await client.invalidateQueries({
        queryKey: ["admin-provider-management", "detail"],
      });
    },
  });
}

export function usePatchProviderManagement(providerId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ section, files }) =>
      patchProviderManagement(providerId, section, files),
    retry: false,
    onSuccess: (_data, variables) => {
      if (variables.section?.coverage) {
        client.invalidateQueries({
          predicate: (query) => {
            const [root, kind, detailQuery] = query.queryKey;
            return (
              root === "admin-provider-management" &&
              kind === "detail" &&
              detailQuery?.providerId === providerId &&
              detailQuery?.include?.includes("coverage")
            );
          },
        });
        return;
      }
      client.invalidateQueries({
        queryKey: ["admin-provider-management", "detail"],
      });
      client.invalidateQueries({
        queryKey: ["admin-provider-management", "list"],
      });
    },
    onError: (error) => {
      if (error?.response?.data?.code === "PROVIDER_MANAGEMENT_STALE_WRITE") {
        client.invalidateQueries({
          queryKey: ["admin-provider-management", "detail"],
        });
      }
    },
  });
}
