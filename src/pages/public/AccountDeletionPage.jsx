import React from 'react';

export default function AccountDeletionPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 rtl" dir="rtl">
      <h1 className="text-4xl font-bold text-blue-600 mb-2">طلب حذف الحساب والبيانات</h1>
      <hr className="my-6" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">المقدمة</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          تنطبق هذه السياسة على تطبيق ومنصة "شاين أب" (Shineup).
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">كيفية طلب حذف الحساب</h2>
        
        <h3 className="text-xl font-medium mt-4 mb-2 text-gray-700">الطريقة الأولى (من داخل التطبيق):</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          يمكن للمستخدمين حذف حسابهم مباشرة من التطبيق عبر الانتقال إلى: 
          <strong> الملف الشخصي </strong> &gt; <strong> الإعدادات </strong> &gt; <strong> حذف الحساب </strong>.
        </p>

        <h3 className="text-xl font-medium mt-4 mb-2 text-gray-700">الطريقة الثانية (عبر الويب/البريد الإلكتروني):</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          يمكن للمستخدمين طلب الحذف عن طريق إرسال بريد إلكتروني إلى <strong>Support@shineupapp.com</strong> من البريد الإلكتروني المسجل لديهم، مع تضمين رقم الهاتف الخاص بهم.
        </p>
        
        <a href="mailto:Support@shineupapp.com?subject=طلب حذف حساب - Shineup" className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 mt-4 transition-colors">
          إرسال طلب حذف عبر البريد الإلكتروني
        </a>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">البيانات التي يتم حذفها</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          سيتم حذف المعلومات الشخصية (الاسم، رقم الهاتف، تفاصيل المركبة، المواقع المحفوظة، وكلمات المرور) بشكل نهائي من الخوادم النشطة خلال 30 يومًا.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">البيانات التي يتم الاحتفاظ بها</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          قد يتم الاحتفاظ ببعض البيانات (مثل سجلات المعاملات المالية وتاريخ الحجوزات) لفترة أطول (على سبيل المثال، حتى 5 سنوات) وذلك بشكل صارم للامتثال للضرائب، والمسائل القانونية، ومكافحة الاحتيال، كما تقتضيه القوانين المحلية.
        </p>
      </div>

    </div>
  );
}
