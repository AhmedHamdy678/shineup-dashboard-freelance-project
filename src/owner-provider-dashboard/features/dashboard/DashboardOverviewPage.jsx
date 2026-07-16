import React from "react";
import { DollarSign, CalendarCheck, Star, Layers, Loader2 } from "lucide-react";
import { useDashboardOverview } from "./useDashboardOverview";
import StatCard from "./components/StatCard";
import TodayOperationsCard from "./components/TodayOperationsCard";
import DashboardPendingView from "./DashboardPendingView";
import DashboardRejectedView from "./DashboardRejectedView";
import useProviderAuthStore from "../../store/providerAuthStore";

export default function DashboardOverviewPage() {
  const profileStatus = useProviderAuthStore((s) => s.profileStatus);
  const isPending = profileStatus === 'PENDING_REVIEW' || profileStatus === 'PENDING';
  const isRejected = profileStatus === 'REJECTED';

  const { data, isLoading, isError } = useDashboardOverview();

  if (isPending) {
    return <DashboardPendingView />;
  }

  if (isRejected) {
    return <DashboardRejectedView reason={data?.provider?.rejectionReason} />;
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  const { provider = {}, bookings = {}, members = {}, services = {}, reviews = {}, payments = {} } = data;

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return amount || '$0';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {provider.nameBusiness || 'Provider'} 👋
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            provider.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {provider.status || 'PENDING'}
          </span>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {provider.availableIs ? 'Active' : 'Inactive'}
          </span>
          <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
            provider.availableIs ? 'bg-emerald-500' : 'bg-gray-300'
          }`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
              provider.availableIs ? 'translate-x-6' : 'translate-x-0'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Top KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue (This Month)"
          value={formatCurrency(payments.paidAmountThisMonth)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Bookings (This Month)"
          value={bookings.totalThisMonth || 0}
          icon={CalendarCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Average Rating"
          value={reviews.averageRating?.toFixed(1) || '0.0'}
          subtext={`(${reviews.reviewsCount || 0} reviews)`}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Active Services"
          value={`${services.available || 0} / ${services.total || 0}`}
          icon={Layers}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Today's Operations & Team Overview */}
      <TodayOperationsCard bookings={bookings} members={members} payments={payments} />
    </div>
  );
}
