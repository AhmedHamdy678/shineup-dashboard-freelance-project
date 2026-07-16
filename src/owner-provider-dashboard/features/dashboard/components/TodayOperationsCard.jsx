import React from "react";
import { Users, DollarSign } from "lucide-react";

export default function TodayOperationsCard({ bookings, members, payments }) {
  // Graceful fallbacks
  const pending = bookings?.pendingRequests || 0;
  const inProgress = bookings?.inProgress || 0;
  const completed = bookings?.completedToday || 0;

  const activeMembers = members?.active || 0;
  const totalMembers = members?.total || 0;
  const paidToday = payments?.paidAmountToday || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Column 1: Today's Bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Operations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
            <span className="text-orange-700 font-medium">Pending Requests</span>
            <span className="text-orange-700 font-bold text-xl">{pending}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-blue-700 font-medium">In Progress</span>
            <span className="text-blue-700 font-bold text-xl">{inProgress}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 font-medium">Completed Today</span>
            <span className="text-emerald-700 font-bold text-xl">{completed}</span>
          </div>
        </div>
      </div>

      {/* Column 2: Team & Payouts Snapshot */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Team & Payouts Snapshot</h3>
        
        <div className="flex-1 flex items-center p-4 border border-gray-100 rounded-xl bg-gray-50">
          <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Active Team Members</p>
            <p className="text-xl font-bold text-gray-900">{activeMembers} / {totalMembers} <span className="text-sm font-medium text-gray-500">Active</span></p>
          </div>
        </div>

        <div className="flex-1 flex items-center p-4 border border-gray-100 rounded-xl bg-gray-50">
          <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Paid Today</p>
            <p className="text-xl font-bold text-gray-900">{typeof paidToday === 'number' ? `$${paidToday.toLocaleString()}` : paidToday}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
