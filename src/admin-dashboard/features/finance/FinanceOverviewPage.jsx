import React from 'react';
import { AlertCircle, Wallet, TrendingUp, TrendingDown, Landmark, Receipt, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { useFinanceOverview } from './hooks/useFinanceOverview';
import { formatCurrencyMinor } from '../../../shared/utils/formatCurrency';
import formatDate from '../../../shared/utils/formatDate';

export default function FinanceOverviewPage() {
  const { data: responseData, isLoading, isError } = useFinanceOverview();
  
  const data = responseData?.data || responseData;

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">الملخص المالي والمحفظة</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-32 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">الملخص المالي والمحفظة</h1>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">حدث خطأ أثناء تحميل البيانات المالية. يرجى المحاولة مرة أخرى لاحقاً.</p>
        </div>
      </div>
    );
  }

  const netProfit = Number(data.profit?.postedNetPlatformProfitMinor || 0);
  const isProfitPositive = netProfit >= 0;

  const hasReconciliationIssues = 
    (data.reconciliation?.unreconciledPaymentCount || 0) > 0 || 
    (data.reconciliation?.unresolvedFeeComponentCount || 0) > 0 || 
    (data.reconciliation?.unreconciledRefundCount || 0) > 0 ||
    (data.reconciliation?.unreconciledSettlementCount || 0) > 0 ||
    (data.reconciliation?.unresolvedFeeAmountMinor || 0) > 0 ||
    (data.reconciliation?.unresolvedFeeAmountUnknownCount || 0) > 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-7 h-7 text-blue-600" />
          الملخص المالي والمحفظة
        </h1>
        {data.periodTo && (
          <p className="text-sm text-gray-500">
            البيانات محدثة حتى: {formatDate(data.periodTo)}
          </p>
        )}
      </div>
      
      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-500">إجمالي المبالغ المحصلة</p>
          <h2 className="text-3xl font-bold text-gray-900" dir="ltr">
            {formatCurrencyMinor(data.cashAndCollection?.grossCollectedMinor)}
          </h2>
        </div>

        <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 p-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-orange-800 flex items-center gap-1">
            إجمالي مستحقات المزودين (التزامات)
            <AlertTriangle className="w-4 h-4" />
          </p>
          <h2 className="text-3xl font-bold text-orange-900" dir="ltr">
            {formatCurrencyMinor(data.liabilities?.providerPayableMinor)}
          </h2>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 flex flex-col gap-2 ${isProfitPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-sm font-medium flex items-center gap-1 ${isProfitPositive ? 'text-green-800' : 'text-red-800'}`}>
            صافي أرباح المنصة
            {isProfitPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </p>
          <h2 className={`text-3xl font-bold ${isProfitPositive ? 'text-green-900' : 'text-red-900'}`} dir="ltr">
            {formatCurrencyMinor(data.profit?.postedNetPlatformProfitMinor)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Cash & Balances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-gray-400" />
            النقد والأرصدة
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">رصيد ميسر تحت التسوية</span>
              <span className="font-bold text-gray-900" dir="ltr">{formatCurrencyMinor(data.asOfBalances?.moyasarClearingBalanceMinor)}</span>
            </div>
            
            <div className="flex justify-between items-center px-3 py-1">
              <span className="text-sm text-gray-500">رصيد الاسترجاع اليدوي</span>
              <span className="font-medium text-gray-700" dir="ltr">{formatCurrencyMinor(data.asOfBalances?.manualRefundClearingBalanceMinor)}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-1">
              <span className="text-sm text-gray-500">مستحقات البوابة</span>
              <span className="font-medium text-gray-700" dir="ltr">{formatCurrencyMinor(data.asOfBalances?.gatewayReceivableBalanceMinor)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mt-2">
              <span className="text-gray-600 font-medium">النقد البنكي المسوى</span>
              <span className="font-bold text-gray-900" dir="ltr">{formatCurrencyMinor(data.asOfBalances?.bankCashBalanceMinor)}</span>
            </div>

            <div className="flex justify-between items-center px-3 pt-3 mt-3 border-t border-dashed border-gray-200">
              <span className="text-sm text-gray-500">التزامات استرجاع العملاء</span>
              <span className="font-medium text-gray-700" dir="ltr">{formatCurrencyMinor(data.liabilities?.customerRefundPayableMinor)}</span>
            </div>
          </div>
        </div>

        {/* 3. Revenue & Costs Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-400" />
            تفصيل الإيرادات والتكاليف
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">الإيرادات</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-1">عمولة المنصة</p>
                <p className="font-bold text-blue-900" dir="ltr">{formatCurrencyMinor(data.revenue?.platformCommissionGrossMinor)}</p>
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-blue-200/50">
                  <span className="text-xs text-blue-700">إيرادات منصة أخرى</span>
                  <span className="text-sm font-semibold text-blue-900" dir="ltr">{formatCurrencyMinor(data.revenue?.otherPlatformRevenueMinor)}</span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-500 uppercase mt-4">العروض والترويج</h4>
              <div className="bg-purple-50 p-4 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">تكاليف ترويج المنصة</span>
                  <span className="font-bold text-purple-900" dir="ltr">{formatCurrencyMinor(data.promotion?.platformPromotionExpenseMinor)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-purple-200/50">
                  <span className="text-sm text-purple-800">عروض ممولة من المزود</span>
                  <span className="font-bold text-purple-900" dir="ltr">{formatCurrencyMinor(data.promotion?.providerFundedPromotionAmountMinor)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">التكاليف</h4>
              <div className="bg-red-50 p-4 rounded-lg flex flex-col gap-3">
                <div>
                  <p className="text-sm text-red-800 mb-1">مصاريف بوابات الدفع</p>
                  <p className="font-bold text-red-900" dir="ltr">{formatCurrencyMinor(data.periodActivity?.gatewayExpensesDuringPeriodMinor)}</p>
                  
                  <div className="flex flex-col gap-1 mt-2 text-xs text-red-700">
                    <div className="flex justify-between"><span>رسوم بوابة الدفع</span><span dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.paymentGatewayFeesMinor)}</span></div>
                    <div className="flex justify-between"><span>رسوم الترميز (Tokenization)</span><span dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.tokenizationFeesMinor)}</span></div>
                    <div className="flex justify-between"><span>رسوم التسوية</span><span dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.settlementFeesMinor)}</span></div>
                    <div className="flex justify-between"><span>ضريبة القيمة المضافة</span><span dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.gatewayFeeVatMinor)}</span></div>
                    <div className="flex justify-between"><span>فروقات الرسوم</span><span dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.gatewayFeeVarianceMinor)}</span></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-red-200">
                  <p className="text-sm text-red-800 mb-1">رسوم إدارة الاحتيال</p>
                  <p className="font-bold text-red-900" dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.fraudManagementFeesMinor)}</p>
                </div>
                <div className="pt-2 border-t border-red-200">
                  <p className="text-sm text-red-800 mb-1">المسترجعات للعملاء</p>
                  <p className="font-bold text-red-900" dir="ltr">{formatCurrencyMinor(data.cashAndCollection?.customerRefundedMinor)}</p>
                </div>
                <div className="pt-2 border-t border-red-200">
                  <p className="text-sm text-red-800 mb-1">رسوم عمليات الاسترجاع</p>
                  <p className="font-bold text-red-900" dir="ltr">{formatCurrencyMinor(data.gatewayCosts?.refundTransactionFeesMinor)}</p>
                </div>
                <div className="pt-2 border-t border-red-200">
                  <p className="text-sm text-red-800 mb-2">تكاليف أخرى</p>
                  <div className="flex flex-col gap-1 text-xs text-red-700">
                    <div className="flex justify-between"><span>رسوم التأسيس</span><span dir="ltr">{formatCurrencyMinor(data.otherCosts?.setupFeesMinor)}</span></div>
                    <div className="flex justify-between"><span>تكاليف استرداد المدفوعات</span><span dir="ltr">{formatCurrencyMinor(data.otherCosts?.chargebackCostsMinor)}</span></div>
                    <div className="flex justify-between"><span>مصروفات أخرى معتمدة</span><span dir="ltr">{formatCurrencyMinor(data.otherCosts?.otherApprovedExpensesMinor)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Reconciliation & System Health */}
      <div className={`rounded-xl shadow-sm border p-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between
        ${hasReconciliationIssues 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-emerald-50 border-emerald-200'}`}
      >
        <div className="flex items-center gap-3">
          {hasReconciliationIssues ? (
            <AlertTriangle className="w-8 h-8 text-yellow-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          )}
          <div>
            <h3 className={`font-bold ${hasReconciliationIssues ? 'text-yellow-900' : 'text-emerald-900'}`}>
              صحة النظام وعمليات المطابقة
            </h3>
            <p className={`text-sm mt-1 ${hasReconciliationIssues ? 'text-yellow-700' : 'text-emerald-700'}`}>
              تتبع المدفوعات والرسوم المعلقة غير المطابقة في النظام المالي
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="bg-white/60 p-3 rounded-lg border border-white/40 flex-1 min-w-[120px] text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">المدفوعات غير المطابقة</p>
            <p className="font-bold text-lg text-gray-900">{data.reconciliation?.unreconciledPaymentCount || 0}</p>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-white/40 flex-1 min-w-[120px] text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">استرجاعات غير مطابقة</p>
            <p className="font-bold text-lg text-gray-900">{data.reconciliation?.unreconciledRefundCount || 0}</p>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-white/40 flex-1 min-w-[120px] text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">تسويات غير مطابقة</p>
            <p className="font-bold text-lg text-gray-900">{data.reconciliation?.unreconciledSettlementCount || 0}</p>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-white/40 flex-1 min-w-[120px] text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">مبلغ رسوم غير محلول</p>
            <p className="font-bold text-lg text-gray-900" dir="ltr">{formatCurrencyMinor(data.reconciliation?.unresolvedFeeAmountMinor)}</p>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-white/40 flex-1 min-w-[120px] text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">رسوم مجهولة القيمة</p>
            <p className="font-bold text-lg text-gray-900">{data.reconciliation?.unresolvedFeeAmountUnknownCount || 0}</p>
          </div>
          <div className="bg-white/60 p-3 rounded-lg border border-white/40 flex-1 min-w-[120px] text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">رسوم غير محلولة</p>
            <p className="font-bold text-lg text-gray-900">{data.reconciliation?.unresolvedFeeComponentCount || 0}</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
