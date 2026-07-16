import { LayoutDashboard, Calendar, Users, Grid3X3, Star, Wallet, Building2, Settings, MessageSquare, Bell } from "lucide-react";

export const providerMainNav = [
  { label: "لوحة التحكم",  icon: LayoutDashboard, path: "/provider" },
  { label: "الحجوزات",     icon: Calendar,         path: "/provider/bookings" },
  { label: "المحادثات",    icon: MessageSquare,    path: "/provider/chat" },
  { label: "الإشعارات",    icon: Bell,             path: "/provider/notifications" },
  { label: "الفريق",       icon: Users,            path: "/provider/team" },
  { label: "الخدمات",      icon: Grid3X3,          path: "/provider/services" },
];

export const providerBusinessNav = [
  { label: "التقييمات", icon: Star, path: "/provider/reviews" },
  { label: "المحفظة", icon: Wallet, path: "/provider/wallet" },
];

export const providerSettingsNav = [
  { label: "الملف التجاري", icon: Building2, path: "/provider/profile" },
  { label: "الإعدادات", icon: Settings, path: "/provider/settings" },
];

export const providerAllNav = [
  ...providerMainNav,
  ...providerBusinessNav,
  ...providerSettingsNav,
];
