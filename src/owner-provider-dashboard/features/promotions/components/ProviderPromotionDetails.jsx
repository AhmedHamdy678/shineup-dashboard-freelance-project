import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import providerAxiosClient from '../../../api/providerAxiosClient';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowRight, Info, CreditCard, BarChart2, Calendar, Target, CheckCircle2, Loader2, PauseCircle, XCircle, Users, Wallet, Banknote, History, ChevronRight, ChevronLeft, Receipt } from 'lucide-react';
import ProviderPromotionForm from './ProviderPromotionForm';

export default function ProviderPromotionDetails({ promotionId, onBack }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [redemptionPage, setRedemptionPage] = useState(1);
  const limit = 20;

  const { data: promotion, isLoading, isError } = useQuery({
    queryKey: ['provider-promotion', promotionId],
    queryFn: async () => {
      const res = await providerAxiosClient.get(`/providers/me/promotions/${promotionId}`, {
        headers: { 'Accept-Language': 'ar' }
      });
      return res.data;
    },
    enabled: !!promotionId
  });

  const { data: redemptionsData, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['provider-promotion-redemptions', promotionId, redemptionPage],
    queryFn: async () => {
      const res = await providerAxiosClient.get(`/providers/me/promotions/${promotionId}/redemptions?page=${redemptionPage}&limit=${limit}`, {
        headers: { 'Accept-Language': 'ar' }
      });
      return res.data;
    },
    enabled: !!promotionId
  });

  const { data: servicesRes } = useQuery({
    queryKey: ['provider-services-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/providers/me/services');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: membersRes } = useQuery({
    queryKey: ['provider-members-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/providers/me/members');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: carTypesRes } = useQuery({
    queryKey: ['catalog-car-types-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/catalog/car-types');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: zonesRes } = useQuery({
    queryKey: ['provider-service-zones-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/providers/me/service-zones?page=1&limit=100&activeIs=true');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const getServiceNames = (ids) => {
    if (!ids || !ids.length) return [];
    const items = servicesRes?.items || servicesRes?.data || (Array.isArray(servicesRes) ? servicesRes : []);
    return ids.map(id => {
      const s = items.find(i => (i.service?.id || i.serviceId || i.id) === id);
      return s ? (s.overrideNameDisplay || s.service?.nameAr || s.nameAr || s.name || id) : id;
    });
  };

  const getMemberNames = (ids) => {
    if (!ids || !ids.length) return [];
    const items = membersRes?.items || membersRes?.data || (Array.isArray(membersRes) ? membersRes : []);
    return ids.map(id => {
      const m = items.find(i => i.id === id);
      return m ? (m.user?.fullName || m.fullName || id) : id;
    });
  };

  const getCarTypeNames = (ids) => {
    if (!ids || !ids.length) return [];
    const items = carTypesRes?.items || carTypesRes?.data || (Array.isArray(carTypesRes) ? carTypesRes : []);
    return ids.map(id => {
      const c = items.find(i => i.id === id);
      return c ? (c.nameAr || c.name || id) : id;
    });
  };

  const getZoneNames = (ids) => {
    if (!ids || !ids.length) return [];
    const items = zonesRes?.items || zonesRes?.data || (Array.isArray(zonesRes) ? zonesRes : []);
    return ids.map(id => {
      const z = items.find(i => i.id === id);
      return z ? (z.label || z.nameAr || z.name || id) : id;
    });
  };

  const redemptions = redemptionsData?.items || [];
  const redemptionsSummary = redemptionsData?.summary || {};
  const totalRedemptions = redemptionsData?.total || redemptionsData?.pagination?.totalItems || 0;
  const totalRedemptionPages = Math.max(1, Math.ceil(totalRedemptions / limit));

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !promotion) {
    return (
      <div className="p-6 text-center text-red-500">
        فشل في تحميل تفاصيل العرض الترويجي.
      </div>
    );
  }

  const {
    codeCanonical, status, nameAr, descriptionAr, applicationMode,
    discountType, percentageBps, fixedDiscountMinor, currency,
    maximumDiscountMinor, minimumOrderMinor,
    totalUsageLimit, perCustomerUsageLimit,
    startsAt, endsAt, createdAt,
    targets
  } = promotion;

  const getStatusBadge = () => {
    if (status === 'ACTIVE') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">نشط</span>;
    if (status === 'PAUSED') return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium border border-orange-200">مؤقت</span>;
    if (status === 'CANCELLED') return <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-medium border border-red-200">ملغي</span>;
    if (status === 'DRAFT') return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">مسودة</span>;
    return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd hh:mm a', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const hasTargets = targets && (
    (targets.serviceIds?.length > 0) ||
    (targets.carTypeIds?.length > 0) ||
    (targets.serviceZoneIds?.length > 0) ||
    (targets.providerMemberIds?.length > 0)
  );

  const handleActivate = async () => {
    if (!window.confirm("هل أنت متأكد من تفعيل هذا العرض للعملاء؟")) return;
    
    setIsActivating(true);
    try {
      await providerAxiosClient.post(
        `/providers/me/promotions/${promotionId}/activate`,
        { version: promotion.version },
        { headers: { 'Accept-Language': 'ar' } }
      );
      toast.success("تم تفعيل العرض بنجاح");
      queryClient.invalidateQueries({ queryKey: ['provider-promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['provider-promotions'] });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تفعيل العرض");
    } finally {
      setIsActivating(false);
    }
  };

  const handlePause = async () => {
    if (!window.confirm("هل أنت متأكد من إيقاف هذا العرض مؤقتاً؟ لن يتمكن العملاء من استخدامه حتى تعيد تفعيله.")) return;
    
    setIsPausing(true);
    try {
      await providerAxiosClient.post(
        `/providers/me/promotions/${promotionId}/pause`,
        { version: promotion.version },
        { headers: { 'Accept-Language': 'ar' } }
      );
      toast.success("تم إيقاف العرض مؤقتاً بنجاح");
      queryClient.invalidateQueries({ queryKey: ['provider-promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['provider-promotions'] });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء إيقاف العرض");
    } finally {
      setIsPausing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("تحذير: هل أنت متأكد من إلغاء هذا العرض نهائياً؟ لا يمكن التراجع عن هذا الإجراء ولن يتمكن أي عميل من استخدامه بعد الآن.")) return;
    
    setIsCancelling(true);
    try {
      await providerAxiosClient.post(
        `/providers/me/promotions/${promotionId}/cancel`,
        { version: promotion.version },
        { headers: { 'Accept-Language': 'ar' } }
      );
      toast.success("تم إلغاء العرض الترويجي نهائياً");
      queryClient.invalidateQueries({ queryKey: ['provider-promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['provider-promotions'] });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء إلغاء العرض");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isEditing) {
    return (
      <ProviderPromotionForm 
        initialData={promotion} 
        onClose={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            تفاصيل العرض الترويجي
            {getStatusBadge()}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 border-b pb-3">
            <Info className="w-5 h-5 text-blue-600" />
            المعلومات الأساسية
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">الاسم</p>
              <p className="font-semibold text-gray-900">{nameAr}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الوصف</p>
              <p className="text-gray-800 text-sm">{descriptionAr || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">طريقة التطبيق</p>
                <p className="font-medium text-gray-900">
                  {applicationMode === 'COUPON' ? 'كوبون خصم' : 'خصم تلقائي'}
                </p>
              </div>
              {applicationMode === 'COUPON' && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">الكود</p>
                  <p className="font-bold text-blue-600 tracking-wider bg-blue-50 inline-block px-2 py-0.5 rounded uppercase" dir="ltr">
                    {codeCanonical || '—'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Financials */}
        <div className="bg-green-50/30 rounded-xl border border-green-100 p-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-green-100 pb-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            القيم والحدود المالية
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-gray-500 mb-1">قيمة الخصم</p>
              <p className="font-bold text-green-700 text-lg" dir="ltr">
                {discountType === 'PERCENTAGE' 
                  ? `${((percentageBps || 0) / 100).toFixed(2)}%` 
                  : `${((fixedDiscountMinor || 0) / 100).toFixed(2)} ${currency || 'SAR'}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الحد الأدنى للطلب</p>
              <p className="font-medium text-gray-900" dir="ltr">
                {minimumOrderMinor ? `${(minimumOrderMinor / 100).toFixed(2)} ${currency || 'SAR'}` : `0.00 ${currency || 'SAR'}`}
              </p>
            </div>
            {discountType === 'PERCENTAGE' && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">الحد الأقصى للخصم</p>
                <p className="font-medium text-gray-900" dir="ltr">
                  {maximumDiscountMinor ? `${(maximumDiscountMinor / 100).toFixed(2)} ${currency || 'SAR'}` : 'بدون حد أقصى'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Usage Limits */}
        <div className="bg-orange-50/30 rounded-xl border border-orange-100 p-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-orange-100 pb-3">
            <BarChart2 className="w-5 h-5 text-orange-600" />
            قيود الاستخدام
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الاستخدام</p>
              <p className="font-medium text-gray-900">
                {totalUsageLimit ? totalUsageLimit : 'غير محدود'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">للعميل الواحد</p>
              <p className="font-medium text-gray-900">{perCustomerUsageLimit || 1}</p>
            </div>
          </div>
        </div>

        {/* Card 4: Timeline */}
        <div className="bg-indigo-50/30 rounded-xl border border-indigo-100 p-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-indigo-100 pb-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            الجدول الزمني
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">تاريخ البدء</span>
              <span className="font-medium text-gray-900 text-sm" dir="ltr">{formatDate(startsAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">تاريخ الانتهاء</span>
              <span className="font-medium text-gray-900 text-sm" dir="ltr">{formatDate(endsAt)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-100/50">
              <span className="text-xs text-gray-400">تاريخ الإنشاء</span>
              <span className="text-xs text-gray-500" dir="ltr">{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Targeting */}
        <div className="bg-purple-50/30 rounded-xl border border-purple-100 p-5 md:col-span-2">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-purple-100 pb-3">
            <Target className="w-5 h-5 text-purple-600" />
            الاستهداف
          </h2>
          {!hasTargets ? (
            <div className="text-center py-4 text-purple-700 font-medium bg-purple-50 rounded-lg">
              يشمل جميع خدمات ومناطق المزود بدون قيود
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                <p className="text-gray-500 text-xs mb-2 font-medium">الخدمات المستهدفة</p>
                {targets.serviceIds?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {getServiceNames(targets.serviceIds).map((name, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">الكل</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                <p className="text-gray-500 text-xs mb-2 font-medium">فئات السيارات</p>
                {targets.carTypeIds?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {getCarTypeNames(targets.carTypeIds).map((name, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">الكل</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                <p className="text-gray-500 text-xs mb-2 font-medium">مناطق التغطية</p>
                {targets.serviceZoneIds?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {getZoneNames(targets.serviceZoneIds).map((name, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">الكل</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                <p className="text-gray-500 text-xs mb-2 font-medium">أعضاء الفريق</p>
                {targets.providerMemberIds?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {getMemberNames(targets.providerMemberIds).map((name, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">الكل</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          إحصائيات استخدام العرض
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-600">العملاء المستفيدين</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{redemptionsSummary.uniqueCustomerCount || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-600">إجمالي الخصومات</p>
            </div>
            <p className="text-2xl font-bold text-gray-900" dir="ltr">
              {((redemptionsSummary.totalCustomerDiscountMinor || 0) / 100).toFixed(2)} {redemptionsSummary.currency || 'SAR'}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-600">تحمل المزود</p>
            </div>
            <p className="text-2xl font-bold text-gray-900" dir="ltr">
              {((redemptionsSummary.totalProviderFundedAmountMinor || 0) / 100).toFixed(2)} {redemptionsSummary.currency || 'SAR'}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-600">الاستخدام الفعلي</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{redemptionsSummary.consumedCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">من أصل {redemptionsSummary.reservedCount || 0} حجز</p>
          </div>
        </div>
      </div>

      {/* Redemptions Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-blue-600" />
          سجل العمليات
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[300px]">
          {isLoadingRedemptions ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : redemptions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">لا توجد عمليات استخدام لهذا العرض حتى الآن.</p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">رقم الحجز</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">العميل</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">قيمة الخصم</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">تاريخ العملية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {redemptions.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-blue-600">{r.bookingId || r.bookingCode || '—'}</td>
                        <td className="px-6 py-4 text-gray-900">{r.customerName || '—'}</td>
                        <td className="px-6 py-4 font-bold text-green-600" dir="ltr">
                          {r.discountAppliedMinor ? ((r.discountAppliedMinor / 100).toFixed(2)) : '0.00'} {r.currency || 'SAR'}
                        </td>
                        <td className="px-6 py-4 text-gray-500" dir="ltr">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalRedemptionPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 mt-auto">
                  <span className="text-sm text-gray-600 font-medium">
                    صفحة {redemptionPage} من {totalRedemptionPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRedemptionPage(p => Math.max(1, p - 1))}
                      disabled={redemptionPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </button>
                    <button
                      onClick={() => setRedemptionPage(p => Math.min(totalRedemptionPages, p + 1))}
                      disabled={redemptionPage >= totalRedemptionPages}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions Footer Placeholder */}
      {status !== 'CANCELLED' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-end gap-3 mt-8">
          {(status === 'ACTIVE' || status === 'PAUSED') && (
            <button 
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-red-50/50 font-medium rounded-lg transition text-sm shadow-sm flex items-center gap-2"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              إلغاء نهائي
            </button>
          )}

          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium rounded-lg transition text-sm"
          >
            تعديل
          </button>
        
        {status === 'ACTIVE' && (
          <button 
            onClick={handlePause}
            disabled={isPausing}
            className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:bg-orange-50 font-medium rounded-lg transition text-sm shadow-sm flex items-center gap-2"
          >
            {isPausing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PauseCircle className="w-4 h-4" />
            )}
            إيقاف مؤقت
          </button>
        )}
        
        {(status === 'DRAFT' || status === 'PAUSED') && (
          <button 
            onClick={handleActivate}
            disabled={isActivating}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 font-medium rounded-lg transition text-sm shadow-sm flex items-center gap-2"
          >
            {isActivating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            تفعيل العرض
          </button>
        )}
      </div>
      )}

    </div>
  );
}
