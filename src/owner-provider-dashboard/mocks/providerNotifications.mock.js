/**
 * Mock notifications data for the Owner Provider Dashboard.
 * Reflects the real API payload shape from GET /notifications/me.
 *
 * Notification types and their icon mappings (handled in NotificationCard):
 *   BOOKING_CONFIRMED  → CheckCircle (green)
 *   BOOKING_CANCELLED  → XCircle    (red)
 *   REVIEW_RECEIVED    → Star       (amber)
 *   PROVIDER_REJECTED  → AlertTriangle (red)
 *   TEAM_MEMBER_ADDED  → Users      (blue)
 *   PAYMENT_RECEIVED   → Wallet     (emerald)
 */
export const mockNotifications = [
  {
    id: 'notif_1',
    type: 'REVIEW_RECEIVED',
    title: 'تقييم جديد',
    body: 'قام العميل محمد علي بمنحك تقييم 5 نجوم على خدمة الغسيل الخارجي.',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5h ago
  },
  {
    id: 'notif_2',
    type: 'BOOKING_CONFIRMED',
    title: 'تم تأكيد الحجز',
    body: 'تم تأكيد حجز #BKG-1024 لخدمة التلميع الشامل في 9 يوليو 2026 الساعة 10:00 ص.',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
  },
  {
    id: 'notif_3',
    type: 'PAYMENT_RECEIVED',
    title: 'دفعة جديدة',
    body: 'استلمت دفعة بقيمة 350 ريال من حجز #BKG-1022 عبر البطاقة الائتمانية.',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
  },
  {
    id: 'notif_4',
    type: 'BOOKING_CANCELLED',
    title: 'تم إلغاء الحجز',
    body: 'ألغى العميل خالد يوسف حجز #BKG-1019 لخدمة السيراميك. يرجى مراجعة التفاصيل.',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif_5',
    type: 'TEAM_MEMBER_ADDED',
    title: 'عضو جديد في الفريق',
    body: 'تم إضافة الفني سلطان الغامدي إلى فريق العمل بنجاح. يمكنك تعيين مهام له الآن.',
    readAt: '2026-07-07T10:00:00Z',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30h ago
  },
  {
    id: 'notif_6',
    type: 'REVIEW_RECEIVED',
    title: 'تقييم جديد',
    body: 'قامت العميلة نورا إبراهيم بترك تعليق: "خدمة ممتازة وفريق محترف جداً!"',
    readAt: '2026-07-06T14:30:00Z',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'notif_7',
    type: 'PROVIDER_REJECTED',
    title: 'رفض طلب الخدمة',
    body: 'تم رفض طلبك لإضافة خدمة "تلميع المصابيح" من قبل الإدارة. يرجى مراجعة الشروط.',
    readAt: '2026-07-05T09:00:00Z',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'notif_8',
    type: 'BOOKING_CONFIRMED',
    title: 'تم تأكيد الحجز',
    body: 'تم تأكيد حجز #BKG-1015 لخدمة الغسيل الداخلي والخارجي في 5 يوليو 2026.',
    readAt: '2026-07-04T08:00:00Z',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
  },
  {
    id: 'notif_9',
    type: 'PAYMENT_RECEIVED',
    title: 'دفعة جديدة',
    body: 'استلمت دفعة بقيمة 1200 ريال من حجز #BKG-1010 — إجمالي الأسبوع: 3,450 ريال.',
    readAt: '2026-06-30T16:00:00Z',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
  },
  {
    id: 'notif_10',
    type: 'BOOKING_CANCELLED',
    title: 'تم إلغاء الحجز',
    body: 'ألغى العميل عمر عبدالله حجز #BKG-1008. تم استرداد المبلغ تلقائياً.',
    readAt: '2026-06-20T11:00:00Z',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
  },
];
