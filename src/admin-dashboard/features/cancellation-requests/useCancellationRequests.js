import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../api/axiosClient';
import { approveCancellationRequest, rejectCancellationRequest } from '../../api/endpoints/cancellationRequests.api';

export const useApproveCancellationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCancellationRequest,
    onSuccess: (_, variables) => {
      toast.success('تمت الموافقة على طلب الإلغاء بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-cancellation-request', variables] });
      queryClient.invalidateQueries({ queryKey: ['admin-cancellation-requests'] });
    },
    onError: (error) => {
      if (error.response?.status === 409) return; // Handled in component
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء الموافقة على الطلب'));
      console.error(error);
    }
  });
};

export const useRejectCancellationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectCancellationRequest,
    onSuccess: (_, variables) => {
      toast.success('تم رفض طلب الإلغاء بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-cancellation-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-cancellation-requests'] });
    },
    onError: (error) => {
      if (error.response?.status === 409) return; // Handled in component
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء رفض الطلب'));
      console.error(error);
    }
  });
};
