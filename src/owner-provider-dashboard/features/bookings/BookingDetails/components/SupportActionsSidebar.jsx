import { MessageCircle, User, RefreshCw, XCircle, AlertTriangle } from "lucide-react";

export default function SupportActionsSidebar() {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">مركز الدعم والإجراءات</h3>
      
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          محادثة العميل
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <User className="w-4 h-4 text-gray-500" />
          التواصل مع الفني
        </button>
      </div>
    </div>
  );
}
