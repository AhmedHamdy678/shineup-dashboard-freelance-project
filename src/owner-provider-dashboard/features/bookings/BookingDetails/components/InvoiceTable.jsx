export default function InvoiceTable({ items }) {
  const totalAmount = items?.reduce((acc, curr) => acc + curr.priceTotalCustomer, 0) || 0;
  const currency = items?.[0]?.currency || 'SAR';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">الخدمات المطلوبة والفاتورة</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-medium">تفاصيل الخدمة</th>
              <th className="px-6 py-3 font-medium text-center">المدة</th>
              <th className="px-6 py-3 font-medium text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{item.serviceName}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.carTypeName}</p>
                </td>
                <td className="px-6 py-4 text-center text-gray-600">
                  {item.durationMinutes} دقيقة
                </td>
                <td className="px-6 py-4 text-left font-medium text-gray-900">
                  {item.priceTotalCustomer} {item.currency}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50/50">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-left font-bold text-gray-900 text-lg">
                الإجمالي
              </td>
              <td className="px-6 py-4 text-left font-bold text-emerald-600 text-xl">
                {totalAmount} {currency}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
