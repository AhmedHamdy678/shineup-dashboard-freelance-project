import React, { useState, useEffect } from 'react';
import axiosClient, { getApiErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Landmark, X, Plus } from 'lucide-react';

export default function PlatformBankAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountLast4, setAccountLast4] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/payout-source-accounts');
      const fetchedData = res.data;
      setAccounts(Array.isArray(fetchedData) ? fetchedData : (fetchedData?.items || fetchedData?.data || []));
    } catch (err) {
      console.error('Failed to fetch platform accounts', err);
      toast.error(getApiErrorMessage(err, 'حدث خطأ أثناء جلب الحسابات البنكية'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!label || !bankName || !accountLast4 || accountLast4.length !== 4) {
      toast.error('الرجاء التأكد من تعبئة جميع الحقول وإدخال 4 أرقام فقط لرقم الحساب.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosClient.post('/admin/payout-source-accounts', {
        label,
        bankName,
        accountLast4,
        currency
      }, {
        headers: {
          'Idempotency-Key': crypto.randomUUID()
        }
      });

      toast.success('تمت إضافة الحساب بنجاح');
      setIsAddModalOpen(false);
      setLabel('');
      setBankName('');
      setAccountLast4('');
      setCurrency('SAR');
      fetchAccounts();
    } catch (err) {
      console.error('Failed to add account', err);
      toast.error(getApiErrorMessage(err, 'خطأ أثناء إضافة الحساب'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Landmark className="w-7 h-7 text-blue-600" />
          حسابات المنصة البنكية
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة حساب جديد
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">لا توجد حسابات بنكية مضافة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative transition-all hover:shadow-md">
              <div className="absolute top-5 left-5" dir="ltr">
                {account.activeIs || account.isActive || account.status === 'ACTIVE' ? (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    نشط
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    متوقف
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4 pr-2">{account.label || account.accountHolderName || 'حساب بنكي'}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Landmark className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{account.bankName || 'بنك غير محدد'}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-gray-500 font-mono tracking-widest flex-1 text-left" dir="ltr">
                    **** **** **** {account.accountLast4 || account.last4 || '0000'}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {account.currency || 'SAR'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">إضافة حساب بنكي جديد</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحساب (Label) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: حساب بنك الراجحي الرئيسي"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم البنك (Bank Name) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: بنك الراجحي"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">آخر 4 أرقام من الحساب <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  maxLength="4"
                  pattern="\d{4}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest font-mono"
                  placeholder="مثال: 1234"
                  value={accountLast4}
                  onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العملة (Currency)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  dir="ltr"
                >
                  <option value="SAR">SAR - ريال سعودي</option>
                  <option value="USD">USD - دولار أمريكي</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !label || !bankName || accountLast4.length !== 4}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'إضافة الحساب'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
