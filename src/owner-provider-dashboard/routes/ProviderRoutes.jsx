import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProviderLayout from "../components/layout/ProviderLayout";
import ProviderProtectedRoute from "./ProviderProtectedRoute";
import PageSkeleton from "../../shared/components/ui/PageSkeleton";

const ProviderLoginPage = lazy(() => import("../features/auth/ProviderLoginPage"));
const ProviderDashboardPage = lazy(() => import("../features/dashboard/DashboardOverviewPage"));
const ProviderBookingsPage = lazy(() => import("../features/bookings/ProviderBookingsPage"));
const ProviderBookingDetailsPage = lazy(() => import("../features/bookings/BookingDetails/ProviderBookingDetailsPage"));
const TeamPage = lazy(() => import("../features/team/TeamPage"));
const TeamMemberAnalyticsPage = lazy(() => import("../features/team/TeamMemberAnalyticsPage"));
const ProviderServicesPage = lazy(() => import("../features/services/ProviderServicesPage"));
const ProviderReviewsPage = lazy(() => import("../features/reviews/ProviderReviewsPage"));
const WalletPage = lazy(() => import("../features/wallet/WalletPage"));
const ProviderProfilePage = lazy(() => import("../features/profile/ProviderProfilePage"));
const ProviderSettingsPage = lazy(() => import("../features/settings/ProviderSettingsPage"));
const ProviderChatPage = lazy(() => import("../features/chat/ProviderChatPage"));
const ProviderNotificationsPage = lazy(() => import("../features/notifications/ProviderNotificationsPage"));

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export default function ProviderRoutes() {
  return (
    <Routes>
      <Route path="/provider/login" element={<SuspenseWrapper><ProviderLoginPage /></SuspenseWrapper>} />

      <Route element={<ProviderProtectedRoute />}>
        <Route element={<ProviderLayout />}>
          <Route path="/provider" element={<SuspenseWrapper><ProviderDashboardPage /></SuspenseWrapper>} />
          <Route path="/provider/bookings" element={<SuspenseWrapper><ProviderBookingsPage /></SuspenseWrapper>} />
          <Route path="/provider/bookings/:id" element={<SuspenseWrapper><ProviderBookingDetailsPage /></SuspenseWrapper>} />
          <Route path="/provider/team" element={<SuspenseWrapper><TeamPage /></SuspenseWrapper>} />
          <Route path="/provider/team/:memberId" element={<SuspenseWrapper><TeamMemberAnalyticsPage /></SuspenseWrapper>} />
          <Route path="/provider/services" element={<SuspenseWrapper><ProviderServicesPage /></SuspenseWrapper>} />
          <Route path="/provider/chat" element={<SuspenseWrapper><ProviderChatPage /></SuspenseWrapper>} />
          <Route path="/provider/notifications" element={<SuspenseWrapper><ProviderNotificationsPage /></SuspenseWrapper>} />
          <Route path="/provider/reviews" element={<SuspenseWrapper><ProviderReviewsPage /></SuspenseWrapper>} />
          <Route path="/provider/wallet" element={<SuspenseWrapper><WalletPage /></SuspenseWrapper>} />
          <Route path="/provider/profile" element={<SuspenseWrapper><ProviderProfilePage /></SuspenseWrapper>} />
          <Route path="/provider/settings" element={<SuspenseWrapper><ProviderSettingsPage /></SuspenseWrapper>} />
        </Route>
      </Route>
    </Routes>
  );
}
