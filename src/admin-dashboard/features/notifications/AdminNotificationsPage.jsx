import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Bell, Search, MessageSquare, Clock, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (currentPage) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/notifications/me?page=${currentPage}&limit=20&unreadOnly=false`);
      const newItems = response.data.items || [];
      
      if (currentPage === 1) {
        setNotifications(newItems);
      } else {
        setNotifications(prev => [...prev, ...newItems]);
      }
      setTotal(response.data.meta?.total || 0);
    } catch (err) {
      setError('حدث خطأ أثناء جلب الإشعارات.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const response = await axiosClient.patch(`/notifications/me/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.patch('/notifications/me/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await axiosClient.get('/notifications/me/unread-count');
      return res.data;
    },
    staleTime: 60000,
  });
  const unreadCount = unreadData?.unreadCount || 0;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ar });
    } catch (e) {
      return '';
    }
  };

  const getNotificationDetails = (type) => {
    switch (type) {
      case 'PROVIDER_SUPPORT_MESSAGE_RECEIVED':
        return {
          title: 'رسالة دعم من مزوّد',
          tag: 'دعم المزودين',
          tagColor: 'bg-indigo-50 text-indigo-700',
        };
      case 'SUPPORT_MESSAGE_RECEIVED':
        return {
          title: 'رسالة دعم من عميل',
          tag: 'دعم العملاء',
          tagColor: 'bg-emerald-50 text-emerald-700',
        };
      default:
        return {
          title: 'إشعار جديد',
          tag: 'إشعار',
          tagColor: 'bg-blue-50 text-blue-700',
        };
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            الإشعارات (الدعم الفني)
          </h1>
          <p className="text-gray-500 mt-1">
            تابع أحدث المحادثات والرسائل من العملاء
          </p>
        </div>
        
        <button
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            unreadCount === 0 
              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          {markAllAsReadMutation.isPending ? 'جاري التحديث...' : 'تحديد الكل كمقروء'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">لا توجد إشعارات حالياً</h3>
          <p className="text-gray-500">لم تصلك أي رسائل دعم جديدة.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {notifications.map((notif) => {
            const isUnread = notif.readAt === null;
            const conversationId = notif.data?.conversationId || '';
            const conversationType = notif.data?.conversationType || '';
            const details = getNotificationDetails(notif.type);
            
            return (
              <div 
                key={notif.id}
                className={`p-4 sm:p-5 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer ${isUnread ? 'bg-blue-50/50' : ''}`}
                onClick={() => {
                  if (isUnread) {
                    markAsReadMutation.mutate(notif.id);
                  }
                  if (conversationId) {
                    navigate('/admin/chat', { 
                      state: { 
                        conversationId, 
                        tab: conversationType === 'PROVIDER_SUPPORT' ? 'PROVIDER' : 'CUSTOMER' 
                      } 
                    });
                  }
                }}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${isUnread ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  {isUnread && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                      <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold truncate ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                      {details.title}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  
                  <p className={`text-sm line-clamp-2 mb-2 ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
                    {notif.body}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${details.tagColor}`}>
                      <MessageSquare className="w-3 h-3" />
                      {details.tag}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && notifications.length > 0 && notifications.length < total && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
}
