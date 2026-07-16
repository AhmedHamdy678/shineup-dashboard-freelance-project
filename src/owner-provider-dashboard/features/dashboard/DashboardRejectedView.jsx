import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Store } from "lucide-react";

export default function DashboardRejectedView({ reason }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-2xl w-full text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-60"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            عذراً، تم رفض طلب انضمامك
          </h1>
          
          <p className="text-gray-600 mb-6 text-lg">
            لقد تم مراجعة طلبك من قبل الإدارة، وللأسف تم رفض الطلب بسبب عدم اكتمال أو صحة بعض البيانات المرفقة.
          </p>

          {reason && (
            <div className="bg-white border border-red-100 p-4 rounded-xl mb-8 w-full text-right shadow-sm">
              <span className="block text-sm font-bold text-red-700 mb-1">سبب الرفض:</span>
              <p className="text-gray-700 font-medium">{reason}</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border border-gray-100 w-full mb-8 text-right">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-500" />
              ماذا يمكنك أن تفعل الآن؟
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 marker:text-red-400">
              <li>الذهاب إلى صفحة <strong>الملف التجاري</strong> لمراجعة بياناتك.</li>
              <li>تحديث البيانات الخاطئة أو رفع مستندات توثيق صحيحة.</li>
              <li>حفظ التغييرات لإعادة إرسال الطلب للمراجعة من جديد.</li>
            </ul>
          </div>

          <Link
            to="/provider/profile"
            className="flex items-center gap-2 bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            تحديث الملف التجاري
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
