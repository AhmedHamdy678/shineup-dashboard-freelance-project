import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembers, addMember, updateMember, deleteMember, activateMember, suspendMember, getMemberAnalytics } from "../../api/team.api";

export function useTeam() {
  return useQuery({
    queryKey: ["provider-members"],
    queryFn: getMembers,
    staleTime: 1000 * 60,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}

export function useActivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}

export function useSuspendMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}

export function useMemberAnalytics(id) {
  return useQuery({
    queryKey: ["provider-member-analytics", id],
    queryFn: () => getMemberAnalytics(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
