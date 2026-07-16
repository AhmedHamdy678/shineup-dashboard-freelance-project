export const mockConversations = [
  {
    id: "conv_admin_1",
    type: "ADMIN",
    participant: {
      name: "إدارة المنصة (الدعم الفني)",
      avatarInitials: "إم",
      role: "Platform Admin",
      bookingInfo: "الدعم الفني والمالي",
      status: "online"
    },
    unreadCount: 1,
    lastMessage: "تم تحديث حالة طلبك المالي، يرجى التحقق.",
    lastMessageTime: "2026-07-08T18:10:00Z",
    messages: [
      {
        id: "msg_a1_1",
        sender: "PROVIDER",
        text: "مرحباً الدعم الفني، نواجه مشكلة في تسوية مستحقات الأسبوع الماضي.",
        timestamp: "2026-07-08T14:30:00Z",
        status: "read"
      },
      {
        id: "msg_a1_system_1",
        sender: "SYSTEM",
        text: "SUPPORT TICKET #4092 CREATED",
        timestamp: "2026-07-08T14:31:00Z"
      },
      {
        id: "msg_a1_2",
        sender: "ADMIN",
        text: "أهلاً بك. نقوم حالياً بمراجعة الحسابات المصرفية لشهر يوليو. سنوافيك بالتفاصيل قريباً.",
        timestamp: "2026-07-08T14:35:00Z",
        status: "read"
      },
      {
        id: "msg_a1_3",
        sender: "ADMIN",
        text: "تم تحديث حالة طلبك المالي، يرجى التحقق.",
        timestamp: "2026-07-08T18:10:00Z",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv_admin_2",
    type: "ADMIN",
    participant: {
      name: "طلب تصعيد - حجز #1024",
      avatarInitials: "تص",
      role: "Escalation Support",
      bookingInfo: "حجز #1024 - سارة أحمد",
      status: "online"
    },
    unreadCount: 0,
    lastMessage: "تم إغلاق تذكرة التصعيد لحل الشكوى.",
    lastMessageTime: "2026-07-08T12:15:00Z",
    messages: [
      {
        id: "msg_a2_1",
        sender: "ADMIN",
        text: "تم فتح تذكرة تصعيد بخصوص شكوى العميل سارة أحمد (حجز #1024) بسبب تأخر الفني عن الموعد المحدد.",
        timestamp: "2026-07-08T11:00:00Z",
        status: "read"
      },
      {
        id: "msg_a2_system_1",
        sender: "SYSTEM",
        text: "ESCALATION TICKET #3024 OPENED",
        timestamp: "2026-07-08T11:02:00Z"
      },
      {
        id: "msg_a2_2",
        sender: "PROVIDER",
        text: "أهلاً بالإدارة. العميل تم تعويضه بغسيل خارجي مجاني، وتم إرضاؤه بالكامل.",
        timestamp: "2026-07-08T11:15:00Z",
        status: "read"
      },
      {
        id: "msg_a2_system_2",
        sender: "SYSTEM",
        text: "RESOLUTION CONFIRMED",
        timestamp: "2026-07-08T12:00:00Z"
      },
      {
        id: "msg_a2_3",
        sender: "ADMIN",
        text: "تم إغلاق تذكرة التصعيد لحل الشكوى.",
        timestamp: "2026-07-08T12:15:00Z",
        status: "read"
      }
    ]
  },
  {
    id: "conv_team_1",
    type: "TEAM",
    participant: {
      name: "خالد الحربي (فني رئيسي)",
      avatarInitials: "خح",
      role: "Team Member",
      bookingInfo: "فني رئيسي",
      status: "online"
    },
    unreadCount: 0,
    lastMessage: "تم الانتهاء من حجز سارة، سأتوجه للعميل التالي الآن.",
    lastMessageTime: "2026-07-08T15:30:00Z",
    messages: [
      {
        id: "msg_t1_1",
        sender: "TEAM",
        text: "أهلاً الإدارة، موقع العميل سارة أحمد يحتاج تأكيد الوصف.",
        timestamp: "2026-07-08T14:40:00Z",
        status: "read"
      },
      {
        id: "msg_t1_2",
        sender: "PROVIDER",
        text: "أرسلنا لك رابط الموقع المحدث عبر واتساب أيضاً، هل وصلك؟",
        timestamp: "2026-07-08T14:42:00Z",
        status: "read"
      },
      {
        id: "msg_t1_3",
        sender: "TEAM",
        text: "نعم، وصل وتم الوصول للعميل والبدء بالخدمة.",
        timestamp: "2026-07-08T14:45:00Z",
        status: "read"
      },
      {
        id: "msg_t1_4",
        sender: "TEAM",
        text: "تم الانتهاء من حجز سارة، سأتوجه للعميل التالي الآن.",
        timestamp: "2026-07-08T15:30:00Z",
        status: "read"
      }
    ]
  },
  {
    id: "conv_team_2",
    type: "TEAM",
    participant: {
      name: "محمد العتيبي (فني)",
      avatarInitials: "مع",
      role: "Team Member",
      bookingInfo: "فني سيارات متوسطة",
      status: "offline"
    },
    unreadCount: 1,
    lastMessage: "هل يمكنني تعديل إجازة الغد؟",
    lastMessageTime: "2026-07-08T16:20:00Z",
    messages: [
      {
        id: "msg_t2_1",
        sender: "TEAM",
        text: "السلام عليكم، بخصوص جدول غدٍ، هل يمكنني تعديل إجازة الغد؟",
        timestamp: "2026-07-08T16:20:00Z",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv_team_3",
    type: "TEAM",
    participant: {
      name: "فهد العيسى (مشرف الاستقبال)",
      avatarInitials: "فع",
      role: "Team Member",
      bookingInfo: "مشرف عمليات",
      status: "online"
    },
    unreadCount: 0,
    lastMessage: "تم تحديث أسعار المنظفات الإضافية بالنظام.",
    lastMessageTime: "2026-07-08T10:00:00Z",
    messages: [
      {
        id: "msg_t3_1",
        sender: "PROVIDER",
        text: "فهد، يرجى مراجعة أسعار المواد المضافة وتعديلها.",
        timestamp: "2026-07-08T09:30:00Z",
        status: "read"
      },
      {
        id: "msg_t3_2",
        sender: "TEAM",
        text: "تم تحديث أسعار المنظفات الإضافية بالنظام.",
        timestamp: "2026-07-08T10:00:00Z",
        status: "read"
      }
    ]
  }
];
