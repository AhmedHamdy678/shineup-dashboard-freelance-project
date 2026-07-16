export default function StatCard({ title, value, subValue, badge, icon: Icon, color = "blue" }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  const iconClass = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl flex items-center justify-center ${iconClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {(subValue || badge) && (
        <div className="flex items-center gap-2 mt-auto">
          {badge && (
            <span className={`px-2 py-1 text-xs font-medium rounded-md ${iconClass}`}>
              {badge}
            </span>
          )}
          {subValue && (
            <span className="text-sm text-gray-500">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
}
