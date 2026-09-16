import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../../admin-dashboard/api/axiosClient";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../../admin-dashboard/api/axiosClient";

export function useGetRoles(filters = {}) {
  return useQuery({
    queryKey: ["roles", filters],
    queryFn: async () => {
      const queryObj = {
        scopeType: 'PLATFORM'
      };
      
      if (filters.page) queryObj.page = filters.page;
      if (filters.limit) queryObj.limit = filters.limit;
      
      if (typeof filters.search === 'string' && filters.search.trim() !== '') {
        queryObj.search = filters.search.trim();
      }

      const params = new URLSearchParams(queryObj);
      const qs = params.toString();
      const endpoint = `/authorization/roles?${qs}`;

      const { data } = await axiosClient.get(endpoint);
      return data;
    },
    keepPreviousData: true,
  });
}

export function useGetPermissions(scopeType = "PLATFORM") {
  return useQuery({
    queryKey: ["permissions", scopeType],
    queryFn: async () => {
      const endpoint = scopeType 
        ? `/authorization/permissions?scopeType=${scopeType}&limit=100` 
        : `/authorization/permissions?limit=100`;
      const { data } = await axiosClient.get(endpoint);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
}

export function useGetRolePermissions(roleId) {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/authorization/roles/${roleId}/permissions`);
      // Returns { role: { ... }, permissions: [ ... ] }
      return data;
    },
    enabled: !!roleId,
  });
}

export function useUpdateRolePermissions(roleId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permissionIds) => {
      const { data } = await axiosClient.put(`/authorization/roles/${roleId}/permissions`, { permissionIds });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["role-permissions", roleId]);
      toast.success("تم تحديث صلاحيات الدور بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل تحديث الصلاحيات"));
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post("/authorization/roles", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("تم إنشاء الدور بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل إنشاء الدور"));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, payload }) => {
      const { data } = await axiosClient.patch(`/authorization/roles/${roleId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("تم تعديل الدور بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل تعديل الدور"));
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleId) => {
      const { data } = await axiosClient.delete(`/authorization/roles/${roleId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("تم حذف الدور بنجاح");
    },
    onError: (err) => {
      if (err?.response?.status === 409) {
        toast.error("لا يمكن حذف الدور، فهو مستخدم حالياً من قبل مشرفين.");
      } else {
        toast.error(getApiErrorMessage(err, "فشل حذف الدور"));
      }
    },
  });
}
