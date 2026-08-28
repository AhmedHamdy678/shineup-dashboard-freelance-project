import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
      let errorMessage = error.response?.data?.message || 'حدث خطأ أثناء الموافقة على الطلب';
      if (error.response?.data?.errors) {
        const detailedErrors = Object.values(error.response.data.errors).flat();
        if (detailedErrors.length > 0) {
          errorMessage = detailedErrors.join('، ');
        }
      } else if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string' ? error.response.data.error : errorMessage;
      }
      toast.error(errorMessage);
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
      queryClient.invalidateQueries({ queryKey: ['admin-cancellation-request', variables] });
      queryClient.invalidateQueries({ queryKey: ['admin-cancellation-requests'] });
    },
    onError: (error) => {
      let errorMessage = error.response?.data?.message || 'حدث خطأ أثناء رفض الطلب';
      if (error.response?.data?.errors) {
        const detailedErrors = Object.values(error.response.data.errors).flat();
        if (detailedErrors.length > 0) {
          errorMessage = detailedErrors.join('، ');
        }
      } else if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string' ? error.response.data.error : errorMessage;
      }
      toast.error(errorMessage);
      console.error(error);
    }
  });
};
