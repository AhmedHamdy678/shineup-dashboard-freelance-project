import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../../admin-dashboard/api/axiosClient";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../../admin-dashboard/api/axiosClient";

export function useGetAdmins(filters = {}) {
  return useQuery({
    queryKey: ["admins", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.search) params.append("search", filters.search);
      if (filters.isActive && filters.isActive !== "all") params.append("isActive", filters.isActive);
      if (filters.roleId && filters.roleId !== "all") params.append("roleId", filters.roleId);

      const qs = params.toString();
      const endpoint = qs ? `/authorization/platform-users?${qs}` : "/authorization/platform-users";
      
      const { data } = await axiosClient.get(endpoint);
      return data;
    },
    keepPreviousData: true,
  });
}

export function useToggleAdminStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }) => {
      const { data } = await axiosClient.patch(`/authorization/platform-users/${userId}/status`, { isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      toast.success("تم تحديث حالة المشرف بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل تحديث حالة المشرف"));
    },
  });
}

export function useGetRoles(scopeType = "PLATFORM", search = "") {
  return useQuery({
    queryKey: ["roles", scopeType, search],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/authorization/roles?scopeType=${scopeType}&search=${search}`);
      // Backend returns paginated: { items: [...], total: N } OR a plain array
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
}

export function useAddAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post("/authorization/platform-users", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      toast.success("تمت إضافة المشرف بنجاح. تم إرسال رمز التحقق (OTP) إلى رقم الهاتف.");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل إضافة المشرف"));
    },
  });
}

export function useGetAdminAccess(userId) {
  return useQuery({
    queryKey: ["admin-access", userId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/authorization/platform-users/${userId}/access`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateAdmin(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.patch(`/authorization/platform-users/${userId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-access", userId]);
      queryClient.invalidateQueries(["admins"]);
      toast.success("تم تحديث بيانات المشرف بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل تحديث بيانات المشرف"));
    },
  });
}

export function useResendActivationOtp(userId) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosClient.post(`/authorization/platform-users/${userId}/activation/resend`);
      return data;
    },
    onSuccess: () => {
      toast.success("تم إعادة إرسال رمز التفعيل بنجاح");
    },
    onError: (err) => {
      if (err?.response?.status === 429) {
        toast.error("يرجى الانتظار قليلاً قبل طلب رمز تفعيل جديد (Cooldown)");
      } else if (err?.response?.status === 409) {
        toast.error("الحساب مفعل مسبقاً");
      } else {
        toast.error(getApiErrorMessage(err, "فشل إعادة إرسال رمز التفعيل"));
      }
    },
  });
}

export function useAssignAdminRole(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, confirmRootAccess }) => {
      const { data } = await axiosClient.post(`/authorization/platform-users/${userId}/roles`, { roleId, confirmRootAccess });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-access", userId]);
      toast.success("تم تعيين الدور بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل تعيين الدور"));
    },
  });
}

export function useRemoveAdminRole(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId }) => {
      const { data } = await axiosClient.delete(`/authorization/platform-users/${userId}/roles/${roleId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-access", userId]);
      toast.success("تم إزالة الدور بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل إزالة الدور"));
    },
  });
}

export function useGrantAdminPermission(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ permissionId }) => {
      const { data } = await axiosClient.post(`/authorization/platform-users/${userId}/permissions`, { permissionId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-access", userId]);
      toast.success("تم منح الصلاحية الاستثنائية بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل منح الصلاحية"));
    },
  });
}

export function useRevokeAdminPermission(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ permissionId }) => {
      const { data } = await axiosClient.delete(`/authorization/platform-users/${userId}/permissions/${permissionId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-access", userId]);
      toast.success("تم سحب الصلاحية الاستثنائية بنجاح");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "فشل سحب الصلاحية"));
    },
  });
}
