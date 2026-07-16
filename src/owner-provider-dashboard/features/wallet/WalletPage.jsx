import { useState } from "react";
import { Wallet, Clock, Lock, ArrowUpRight, Landmark, Plus, AlertCircle } from "lucide-react";
import { useWallet, usePayoutMethods, useAddPayoutMethod, useWithdrawalHistory, useRequestWithdrawal } from "./useWallet";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Modal from "../../../shared/components/ui/Modal";
import Pagination from "../../../shared/components/ui/Pagination";

const formatCurrency = (minorAmount) => ((minorAmount || 0) / 100).toFixed(2) + ' SAR';

export default function WalletPage() {
  const { data, isLoading, isError } = useWallet();
  const { data: payoutMethodsData, isLoading: isLoadingPayout, isError: isErrorPayout } = usePayoutMethods();
  const addPayoutMutation = useAddPayoutMethod();
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const { data: withdrawalsData, isLoading: isLoadingWithdrawals, isError: isErrorWithdrawals } = useWithdrawalHistory(withdrawalsPage);
  const requestWithdrawMutation = useRequestWithdrawal();

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    payoutMethodId: '',
    note: ''
  });

  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    beneficiaryType: 'INDIVIDUAL',
    bankName: '',
    accountHolderName: '',
    iban: '',
    beneficiaryMobile: '',
    beneficiaryCity: ''
  });

  const handleAddBankSubmit = (e) => {
    e.preventDefault();
    
    // Clean IBAN
    const cleanIban = bankForm.iban ? bankForm.iban.replace(/\s+/g, '').toUpperCase() : '';

    addPayoutMutation.mutate(
      {
        payload: {
          ...bankForm,
          iban: cleanIban,
          type: 'BANK_ACCOUNT',
          beneficiaryCountry: 'SA',
          isDefault: false
        },
        idempotencyKey: uuidv4()
      },
      {
        onSuccess: () => {
          toast.success('تمت إضافة الحساب البنكي بنجاح، وهو الآن قيد المراجعة');
          setIsAddBankModalOpen(false);
          setBankForm({
            beneficiaryType: 'INDIVIDUAL',
            bankName: '',
            accountHolderName: '',
            iban: '',
            beneficiaryMobile: '',
            beneficiaryCity: ''
          });
        },
        onError: (err) => {
          const data = err.response?.data;
          let msg = data?.message || data?.error || err.message;
          
          if (Array.isArray(msg)) {
            msg = msg.join(' | ');
          }
          
          if (data?.errors) {
            if (Array.isArray(data.errors)) {
              msg = data.errors.map(e => typeof e === 'string' ? e : e.msg || JSON.stringify(e)).join(' | ');
            } else if (typeof data.errors === 'object') {
              msg = Object.values(data.errors).flat().join(' | ');
            }
          }
          
          toast.error(`حدث خطأ: ${msg}`);
        }
      }
    );
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(withdrawalForm.amount) * 100);
    
    requestWithdrawMutation.mutate(
      {
        payload: {
          amountMinor,
          payoutMethodId: withdrawalForm.payoutMethodId,
          note: withdrawalForm.note
        },
        idempotencyKey: uuidv4()
      },
      {
        onSuccess: () => {
          toast.success('تم تقديم طلب السحب بنجاح');
          setIsWithdrawalModalOpen(false);
          setWithdrawalForm({
            amount: '',
            payoutMethodId: '',
            note: ''
          });
        },
        onError: (err) => {
          const msg = err.response?.data?.message || err.response?.data?.error || err.message;
          toast.error(`حدث خطأ أثناء تقديم طلب السحب: ${msg}`);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
        حدث خطأ أثناء جلب بيانات المحفظة المالية.
      </div>
    );
  }

  const wallet = data?.data || data || {};
  const payoutMethods = payoutMethodsData?.data || payoutMethodsData || [];
  const verifiedPayoutMethods = payoutMethods.filter(method => method.verificationStatus === 'VERIFIED');
  const withdrawals = withdrawalsData?.items || [];
  const withdrawalsMeta = withdrawalsData?.meta || { page: 1, totalPages: 1, total: 0 };
  
  const maxWithdrawable = (wallet.withdrawableBalanceMinor || 0) / 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">المحفظة المالية</h1>
        {wallet.status && (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${wallet.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
            {wallet.status === 'ACTIVE' ? 'نشط' : wallet.status}
          </span>
        )}
      </div>

      {/* Main Hero Card (Withdrawable Balance) */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-700 rounded-2xl p-8 shadow-sm text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute right-1/2 bottom-0 w-32 h-32 bg-emerald-300 opacity-10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-emerald-50 text-lg font-medium mb-3">الرصيد القابل للسحب</h2>
          <div className="text-4xl md:text-5xl font-bold font-mono tracking-tight" dir="ltr">
            {formatCurrency(wallet.withdrawableBalanceMinor)}
          </div>
        </div>
        <button 
          onClick={() => setIsWithdrawalModalOpen(true)} 
          className="relative z-10 bg-white text-emerald-700 px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm focus:ring-4 focus:ring-emerald-500/20"
        >
          <ArrowUpRight className="w-5 h-5" />
          طلب سحب أرباح
        </button>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">الرصيد المتاح</h3>
            <div className="text-2xl font-bold text-gray-900 font-mono" dir="ltr">
              {formatCurrency(wallet.availableBalanceMinor)}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">الرصيد المعلق</h3>
            <div className="text-2xl font-bold text-gray-900 font-mono" dir="ltr">
              {formatCurrency(wallet.pendingBalanceMinor)}
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl border border-gray-200 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">الرصيد المحجوز</h3>
            <div className="text-2xl font-bold text-gray-900 font-mono" dir="ltr">
              {formatCurrency(wallet.heldBalanceMinor)}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-100 my-8" />

      {/* Payout Methods Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">حسابات استلام الأرباح</h2>
          <button 
            onClick={() => setIsAddBankModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة حساب بنكي
          </button>
        </div>

        {isLoadingPayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        ) : isErrorPayout ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            تعذر جلب الحسابات البنكية.
          </div>
        ) : payoutMethods.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Landmark className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">لم تقم بإضافة أي حسابات بنكية بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payoutMethods.map((method) => {
              let statusBadge = null;
              if (method.verificationStatus === 'VERIFIED') {
                statusBadge = <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">موثق</span>;
              } else if (method.verificationStatus === 'PENDING') {
                statusBadge = <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">قيد المراجعة</span>;
              } else if (method.verificationStatus === 'REJECTED') {
                statusBadge = <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">مرفوض</span>;
              }

              return (
                <div key={method.id || Math.random()} className="bg-white border border-gray-200 rounded-xl p-5 relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-5 left-5" dir="rtl">
                    {statusBadge}
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-0.5">{method.bankName || 'البنك غير محدد'}</h3>
                      <p className="text-sm text-gray-500 mb-3">{method.accountHolderName}</p>
                      <div className="font-mono text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded inline-block text-sm" dir="ltr">
                        **** **** **** {method.last4 || method.ibanLast4 || '****'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-gray-100 my-8" />

      {/* Withdrawals History Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">سجل السحوبات</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoadingWithdrawals ? (
            <div className="p-8 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isErrorWithdrawals ? (
            <div className="p-8 text-center text-red-500 font-medium">
              تعذر جلب سجل السحوبات.
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لا يوجد سجل سحوبات حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">التاريخ</th>
                    <th className="px-6 py-4 font-medium">المبلغ</th>
                    <th className="px-6 py-4 font-medium">الحساب البنكي</th>
                    <th className="px-6 py-4 font-medium text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map((w) => {
                    let statusBadge = null;
                    if (w.status === 'PENDING') {
                      statusBadge = <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">معلق</span>;
                    } else if (w.status === 'APPROVED') {
                      statusBadge = <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">قيد التنفيذ / بانتظار الدفع</span>;
                    } else if (w.status === 'PAID') {
                      statusBadge = <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">تم الدفع</span>;
                    } else if (w.status === 'REJECTED') {
                      statusBadge = <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">مرفوض</span>;
                    } else {
                      statusBadge = <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{w.status}</span>;
                    }

                    const requestedAt = new Date(w.requestedAt).toLocaleDateString('ar-SA', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{requestedAt}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900" dir="ltr">
                            {formatCurrency(w.amountMinor)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-start gap-2" dir="ltr">
                            <span className="text-gray-900 font-medium">{w.payoutMethod?.bankName || 'غير متوفر'}</span>
                            {w.payoutMethod?.ibanLast4 && (
                              <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                ****{w.payoutMethod.ibanLast4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {statusBadge}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoadingWithdrawals && !isErrorWithdrawals && withdrawals.length > 0 && (
            <div className="border-t border-gray-100">
              <Pagination 
                currentPage={withdrawalsPage} 
                totalResults={withdrawalsMeta.total} 
                pageSize={10} 
                onPageChange={setWithdrawalsPage} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Bank Modal */}
      {isAddBankModalOpen && (
        <Modal title="إضافة حساب بنكي" onClose={() => !addPayoutMutation.isPending && setIsAddBankModalOpen(false)} size="md">
          <form onSubmit={handleAddBankSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع المستفيد <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={bankForm.beneficiaryType}
                onChange={(e) => setBankForm({ ...bankForm, beneficiaryType: e.target.value })}
              >
                <option value="INDIVIDUAL">فرد</option>
                <option value="COMPANY">شركة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم البنك <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="مثال: البنك الأهلي"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل (كما هو في البنك) <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={bankForm.accountHolderName}
                onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الآيبان (IBAN) <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                dir="ltr"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                placeholder="SA..."
                value={bankForm.iban}
                onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                dir="ltr"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                value={bankForm.beneficiaryMobile}
                onChange={(e) => setBankForm({ ...bankForm, beneficiaryMobile: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={bankForm.beneficiaryCity}
                onChange={(e) => setBankForm({ ...bankForm, beneficiaryCity: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddBankModalOpen(false)}
                disabled={addPayoutMutation.isPending}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={addPayoutMutation.isPending}
                className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {addPayoutMutation.isPending ? 'جاري الإضافة...' : 'حفظ'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Request Withdrawal Modal */}
      {isWithdrawalModalOpen && (
        <Modal title="طلب سحب أرباح" onClose={() => !requestWithdrawMutation.isPending && setIsWithdrawalModalOpen(false)} size="md">
          <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المطلوب (ر.س) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max={maxWithdrawable}
                  step="0.01"
                  dir="ltr"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12 text-left font-mono"
                  placeholder="0.00"
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                />
                <span className="absolute right-3 top-2.5 text-gray-500 font-medium">SAR</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-100">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <span>الحد الأقصى المسموح سحبه: <span className="font-semibold text-gray-900">{formatCurrency(wallet.withdrawableBalanceMinor)}</span></span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحساب البنكي (الموثق فقط) <span className="text-red-500">*</span></label>
              {verifiedPayoutMethods.length === 0 ? (
                <div className="p-3 bg-orange-50 border border-orange-100 text-orange-700 rounded-lg text-sm">
                  لا تملك أي حساب بنكي موثق. يرجى إضافة حساب وانتظار توثيقه أولاً.
                </div>
              ) : (
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={withdrawalForm.payoutMethodId}
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, payoutMethodId: e.target.value })}
                >
                  <option value="" disabled>-- اختر الحساب البنكي --</option>
                  {verifiedPayoutMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.bankName} - ****{method.last4 || method.ibanLast4}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة (اختياري)</label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="سبب السحب أو ملاحظة"
                value={withdrawalForm.note}
                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, note: e.target.value })}
              ></textarea>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawalModalOpen(false)}
                disabled={requestWithdrawMutation.isPending}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={requestWithdrawMutation.isPending || parseFloat(withdrawalForm.amount) <= 0 || parseFloat(withdrawalForm.amount) > maxWithdrawable || verifiedPayoutMethods.length === 0}
                className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {requestWithdrawMutation.isPending ? 'جاري التقديم...' : 'تأكيد السحب'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
