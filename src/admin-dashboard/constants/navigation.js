import { LayoutDashboard, Store, Users, Calendar, Star, CreditCard, BarChart3, MessageCircle, Shield, Settings, Layers, LayoutList, Percent, Landmark, Wallet, Undo, Ban, Tag } from "lucide-react";

export const generalNav = [
  { label: "لوحة التحكم", icon: LayoutDashboard, path: "/admin" },
  { label: "مقدمو الخدمات", icon: Store, path: "/admin/providers" },
  { label: "العملاء", icon: Users, path: "/admin/customers" },
  { label: "الحجوزات", icon: Calendar, path: "/admin/bookings" },
  { label: "التقييمات", icon: Star, path: "/admin/reviews" },
  { label: "التصنيفات", icon: Layers, path: "/admin/categories" },
  { label: "الخدمات", icon: LayoutList, path: "/admin/services" },
  { label: "العروض والخصومات", icon: Tag, path: "/admin/promotions" },
  { label: "المحادثات", icon: MessageCircle, path: "/admin/chat" },
];

export const settingsNav = [
  { label: "حسابات المنصة البنكية", icon: Landmark, path: "/admin/platform-accounts" },
  { label: "الحسابات البنكية للمزودين", icon: Wallet, path: "/admin/provider-payout-methods" },
  { label: "طلبات السحب", icon: CreditCard, path: "/admin/provider-withdrawals" },
  { label: "طلبات الاسترجاع", icon: Undo, path: "/admin/refund-requests" },
  { label: "طلبات الإلغاء", icon: Ban, path: "/admin/cancellation-requests" },
  { label: "إعدادات العمولات والخصومات", icon: Percent, path: "/admin/deductions" },
  { label: "الإعدادات", icon: Settings, path: "/admin/settings" },
];
