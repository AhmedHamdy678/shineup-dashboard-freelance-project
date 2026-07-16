const statusStyles = {
  approved: { dot: "bg-blue-500", text: "text-blue-600", label: "موافق عليه" },
  pending: { dot: "bg-amber-500", text: "text-amber-600", label: "قيد المراجعة" },
  rejected: { dot: "bg-red-500", text: "text-red-600", label: "مرفوض" },
  active: { dot: "bg-green-500", text: "text-green-600", label: "نشط" },
  inactive: { dot: "bg-gray-400", text: "text-gray-500", label: "غير نشط" },
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] ?? statusStyles.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
