import React from "react";

export default function StatCard({ title, value, icon: Icon, subtext, iconColor = "text-gray-500", iconBg = "bg-gray-100" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {subtext && (
        <div className="mt-4 text-sm text-gray-500">
          {subtext}
        </div>
      )}
    </div>
  );
}
