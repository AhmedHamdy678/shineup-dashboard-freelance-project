import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PageSkeleton from "../../shared/components/ui/PageSkeleton";
import ProviderLayout from "../../owner-provider-dashboard/components/layout/ProviderLayout";
import ProviderProtectedRoute from "../../owner-provider-dashboard/routes/ProviderProtectedRoute";

const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const ProvidersPage = lazy(() => import("../features/providers/ProvidersPage"));
const ProviderReviewPage = lazy(() => import("../features/providers/ProviderReviewPage"));
const CustomersPage = lazy(() => import("../features/customers/CustomersPage"));
const CustomerDetailsPage = lazy(() => import("../features/customers/CustomerDetailsPage"));
const BookingsPage = lazy(() => import("../features/bookings/BookingsPage"));
const ReviewsPage = lazy(() => import("../features/reviews/ReviewsPage"));
const ReviewDetailsPage = lazy(() => import("../features/reviews/ReviewDetailsPage"));
const ChatPage = lazy(() => import("../features/chat/admin/AdminChatPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const CategoriesPage = lazy(() => import("../features/categories/CategoriesPage"));
const ServicesPage = lazy(() => import("../features/services/ServicesPage"));
const DeductionsPage = lazy(() => import("../features/deductions/DeductionsPage"));
const DeductionRuleDetailsPage = lazy(() => import("../features/deductions/DeductionRuleDetails"));
const FinanceOverviewPage = lazy(() => import("../features/finance/FinanceOverviewPage"));
const PlatformBankAccountsPage = lazy(() => import("../features/finance/PlatformBankAccountsPage"));
const ProviderPayoutMethodsPage = lazy(() => import("../features/finance/ProviderPayoutMethodsPage"));
const BankAccountDetailsPage = lazy(() => import("../features/finance/BankAccountDetailsPage"));
const ProviderWithdrawalsPage = lazy(() => import("../features/finance/ProviderWithdrawalsPage"));
const WithdrawalRequestDetailsPage = lazy(() => import("../features/finance/WithdrawalRequestDetailsPage"));
const RefundRequestsPage = lazy(() => import("../features/refund-requests/RefundRequestsPage"));
const CancellationRequestsPage = lazy(() => import("../features/cancellation-requests/CancellationRequestsPage"));
const AdminNotificationsPage = lazy(() => import("../features/notifications/AdminNotificationsPage"));
const PromotionsPage = lazy(() => import("../features/promotions/PromotionsPage"));

const ProviderDashboardPage = lazy(() => import("../../owner-provider-dashboard/features/dashboard/DashboardOverviewPage"));
const ProviderBookingsPage = lazy(() => import("../../owner-provider-dashboard/features/bookings/ProviderBookingsPage"));
const ProviderBookingDetailsPage = lazy(() => import("../../owner-provider-dashboard/features/bookings/BookingDetails/ProviderBookingDetailsPage"));
const TeamPage = lazy(() => import("../../owner-provider-dashboard/features/team/TeamPage"));
const TeamMemberAnalyticsPage = lazy(() => import("../../owner-provider-dashboard/features/team/TeamMemberAnalyticsPage"));
const ProviderServicesPage = lazy(() => import("../../owner-provider-dashboard/features/services/ProviderServicesPage"));
const ServiceZonesPage = lazy(() => import("../../owner-provider-dashboard/features/service-zones/ServiceZonesPage"));
const ProviderReviewsPage = lazy(() => import("../../owner-provider-dashboard/features/reviews/ProviderReviewsPage"));
const WalletPage = lazy(() => import("../../owner-provider-dashboard/features/wallet/WalletPage"));
const ProviderProfilePage = lazy(() => import("../../owner-provider-dashboard/features/profile/ProviderProfilePage"));
const ProviderSettingsPage = lazy(() => import("../../owner-provider-dashboard/features/settings/ProviderSettingsPage"));
const ProviderChatPage = lazy(() => import("../../owner-provider-dashboard/features/chat/ProviderChatPage"));
const ProviderNotificationsPage = lazy(() => import("../../owner-provider-dashboard/features/notifications/ProviderNotificationsPage"));
const ProviderPromotionsPage = lazy(() => import("../../owner-provider-dashboard/features/promotions/ProviderPromotionsPage"));
const ProviderLoginPage = lazy(() => import("../../owner-provider-dashboard/features/auth/ProviderLoginPage"));
const ProviderRegisterPage = lazy(() => import("../../owner-provider-dashboard/features/auth/ProviderRegisterPage"));
const ProviderOnboardingPage = lazy(() => import("../../owner-provider-dashboard/features/profile/ProviderOnboardingPage"));
const ProviderPendingApprovalPage = lazy(() => import("../../owner-provider-dashboard/features/auth/ProviderPendingApprovalPage"));
const LegalDocumentPage = lazy(() => import("../../pages/public/LegalDocumentPage"));
const AccountDeletionPage = lazy(() => import("../../pages/public/AccountDeletionPage"));

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
      <Route path="/provider/login" element={<SuspenseWrapper><ProviderLoginPage /></SuspenseWrapper>} />
      <Route path="/provider/register" element={<SuspenseWrapper><ProviderRegisterPage /></SuspenseWrapper>} />
      
      {/* Public legal routes */}
      <Route path="/terms" element={<SuspenseWrapper><LegalDocumentPage documentSlug="terms-and-conditions" /></SuspenseWrapper>} />
      <Route path="/privacy-policy" element={<SuspenseWrapper><LegalDocumentPage documentSlug="privacy-policy" /></SuspenseWrapper>} />
      <Route path="/account-deletion" element={<SuspenseWrapper><AccountDeletionPage /></SuspenseWrapper>} />


      {/* Admin routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<SuspenseWrapper><DashboardPage /></SuspenseWrapper>} />
          <Route path="providers" element={<SuspenseWrapper><ProvidersPage /></SuspenseWrapper>} />
          <Route path="providers/pending/:providerId" element={<SuspenseWrapper><ProviderReviewPage /></SuspenseWrapper>} />
          <Route path="providers/:providerId" element={<SuspenseWrapper><ProviderReviewPage /></SuspenseWrapper>} />
          <Route path="customers" element={<SuspenseWrapper><CustomersPage /></SuspenseWrapper>} />
          <Route path="customers/:customerId" element={<SuspenseWrapper><CustomerDetailsPage /></SuspenseWrapper>} />
          <Route path="bookings" element={<SuspenseWrapper><BookingsPage /></SuspenseWrapper>} />
          <Route path="reviews" element={<SuspenseWrapper><ReviewsPage /></SuspenseWrapper>} />
          <Route path="reviews/:id" element={<SuspenseWrapper><ReviewDetailsPage /></SuspenseWrapper>} />
          <Route path="categories" element={<SuspenseWrapper><CategoriesPage /></SuspenseWrapper>} />
          <Route path="services" element={<SuspenseWrapper><ServicesPage /></SuspenseWrapper>} />
          <Route path="chat" element={<SuspenseWrapper><ChatPage /></SuspenseWrapper>} />
          <Route path="settings" element={<SuspenseWrapper><SettingsPage /></SuspenseWrapper>} />
          <Route path="deductions" element={<SuspenseWrapper><DeductionsPage /></SuspenseWrapper>} />
          <Route path="deductions/:ruleId" element={<SuspenseWrapper><DeductionRuleDetailsPage /></SuspenseWrapper>} />
          <Route path="finance-overview" element={<SuspenseWrapper><FinanceOverviewPage /></SuspenseWrapper>} />
          <Route path="platform-accounts" element={<SuspenseWrapper><PlatformBankAccountsPage /></SuspenseWrapper>} />
          <Route path="provider-payout-methods" element={<SuspenseWrapper><ProviderPayoutMethodsPage /></SuspenseWrapper>} />
          <Route path="provider-payout-methods/:id" element={<SuspenseWrapper><BankAccountDetailsPage /></SuspenseWrapper>} />
          <Route path="provider-withdrawals" element={<SuspenseWrapper><ProviderWithdrawalsPage /></SuspenseWrapper>} />
          <Route path="provider-withdrawals/:id" element={<SuspenseWrapper><WithdrawalRequestDetailsPage /></SuspenseWrapper>} />
          <Route path="refund-requests" element={<SuspenseWrapper><RefundRequestsPage /></SuspenseWrapper>} />
          <Route path="cancellation-requests" element={<SuspenseWrapper><CancellationRequestsPage /></SuspenseWrapper>} />
          <Route path="promotions" element={<SuspenseWrapper><PromotionsPage /></SuspenseWrapper>} />
          <Route path="notifications" element={<SuspenseWrapper><AdminNotificationsPage /></SuspenseWrapper>} />
        </Route>
      </Route>

      {/* Provider routes */}
      <Route element={<ProviderProtectedRoute />}>
        <Route path="/provider/pending-approval" element={<SuspenseWrapper><ProviderPendingApprovalPage /></SuspenseWrapper>} />
        
        <Route element={<ProviderLayout />}>
          <Route path="/provider" element={<SuspenseWrapper><ProviderDashboardPage /></SuspenseWrapper>} />
          <Route path="/provider/bookings" element={<SuspenseWrapper><ProviderBookingsPage /></SuspenseWrapper>} />
          <Route path="/provider/bookings/:id" element={<SuspenseWrapper><ProviderBookingDetailsPage /></SuspenseWrapper>} />
          <Route path="/provider/team" element={<SuspenseWrapper><TeamPage /></SuspenseWrapper>} />
          <Route path="/provider/team/:memberId" element={<SuspenseWrapper><TeamMemberAnalyticsPage /></SuspenseWrapper>} />
          <Route path="/provider/services" element={<SuspenseWrapper><ProviderServicesPage /></SuspenseWrapper>} />
          <Route path="/provider/service-zones" element={<SuspenseWrapper><ServiceZonesPage /></SuspenseWrapper>} />
          <Route path="/provider/chat" element={<SuspenseWrapper><ProviderChatPage /></SuspenseWrapper>} />
          <Route path="/provider/notifications" element={<SuspenseWrapper><ProviderNotificationsPage /></SuspenseWrapper>} />
          <Route path="/provider/reviews" element={<SuspenseWrapper><ProviderReviewsPage /></SuspenseWrapper>} />
          <Route path="/provider/promotions" element={<SuspenseWrapper><ProviderPromotionsPage /></SuspenseWrapper>} />
          <Route path="/provider/wallet" element={<SuspenseWrapper><WalletPage /></SuspenseWrapper>} />
          <Route path="/provider/profile" element={<SuspenseWrapper><ProviderProfilePage /></SuspenseWrapper>} />
          <Route path="/provider/settings" element={<SuspenseWrapper><ProviderSettingsPage /></SuspenseWrapper>} />
          <Route path="/provider/onboarding" element={<SuspenseWrapper><ProviderOnboardingPage /></SuspenseWrapper>} />
        </Route>
      </Route>
    </Routes>
  );
}
