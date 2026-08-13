import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosClient from '../../../api/axiosClient';
import formatDate from '../../../../shared/utils/formatDate';
import { 
  ArrowRight, Tag, Activity, FileText, Gift, Info, 
  CreditCard, BarChart2, CheckCircle, Clock, Target, Calendar,
  Users, Wallet, ChevronRight, ChevronLeft
} from 'lucide-react';

export default function PromotionDetails({ promotionId, onBack, onEdit }) {
  const queryClient = useQueryClient();
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [redemptionPage, setRedemptionPage] = useState(1);
  const redemptionLimit = 20;

  const { data, isLoading: isPromotionLoading, isError } = useQuery({
    queryKey: ['admin-promotion', promotionId],
    queryFn: async () => {
      const response = await axiosClient.get(`/admin/promotions/${promotionId}`);
      return response.data;
    },
    enabled: !!promotionId
  });

  const { data: redemptionsData, isLoading: isRedemptionsLoading } = useQuery({
    queryKey: ['admin-promotion-redemptions', promotionId, redemptionPage],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/promotions/${promotionId}/redemptions?page=${redemptionPage}&limit=${redemptionLimit}`);
      return res.data;
    },
    enabled: !!promotionId,
    keepPreviousData: true
  });

  const { data: servicesData } = useQuery({
    queryKey: ['admin-catalog-services'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/catalog/services?includeInactive=false');
      return res.data;
    }
  });

  const { data: providersData } = useQuery({
    queryKey: ['admin-providers', 'approved'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/providers?page=1&limit=100&approvalStatus=APPROVED');
      return res.data;
    }
  });

  const { data: carTypesData } = useQuery({
    queryKey: ['admin-catalog-car-types'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/catalog/car-types');
      return res.data;
    }
  });

  const servicesMap = (Array.isArray(servicesData) ? servicesData : servicesData?.data || []).reduce((acc, s) => { acc[s.id] = s.nameAr; return acc; }, {});
  const providersMap = (providersData?.items || []).reduce((acc, p) => { acc[p.providerId || p.id] = p.businessNameAr || p.businessName || p.owner?.fullName || 'بدون اسم'; return acc; }, {});
  const carTypesMap = (Array.isArray(carTypesData) ? carTypesData : carTypesData?.data || []).reduce((acc, c) => { acc[c.id] = c.nameAr; return acc; }, {});

  const promotion = data?.data || data;
  const summary = redemptionsData?.summary || {};
  const redemptionsList = redemptionsData?.items || [];
  const redemptionsTotal = redemptionsData?.total || redemptionsData?.pagination?.totalItems || 0;
  const redemptionsTotalPages = Math.max(1, Math.ceil(redemptionsTotal / redemptionLimit));

  const handleActivate = async () => {
    if (!window.confirm("هل أنت متأكد من تفعيل هذا العرض الترويجي؟")) return;
    
    setIsActivating(true);
    try {
      await axiosClient.post(`/admin/promotions/${promotionId}/activate`, {
        version: promotion.version
      });
      toast.success("تم تفعيل العرض بنجاح");
      queryClient.invalidateQueries({ queryKey: ['admin-promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تفعيل العرض');
    } finally {
      setIsActivating(false);
    }
  };

  const handlePause = async () => {
    if (!window.confirm("هل أنت متأكد من إيقاف هذا العرض مؤقتاً؟ لن يتمكن العملاء من استخدامه حتى يتم تفعيله مجدداً.")) return;
    
    setIsPausing(true);
    try {
      await axiosClient.post(`/admin/promotions/${promotionId}/pause`, {
        version: promotion.version
      });
      toast.success("تم إيقاف العرض بنجاح");
      queryClient.invalidateQueries({ queryKey: ['admin-promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إيقاف العرض');
    } finally {
      setIsPausing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("تحذير: هل أنت متأكد من إلغاء هذا العرض نهائياً؟ هذا الإجراء لا يمكن التراجع عنه ولن يتمكن أي عميل من استخدام الكوبون بعد الآن.")) return;
    
    setIsCancelling(true);
    try {
      await axiosClient.post(`/admin/promotions/${promotionId}/cancel`, {
        version: promotion.version
      });
      toast.success("تم إلغاء العرض الترويجي نهائياً");
      queryClient.invalidateQueries({ queryKey: ['admin-promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إلغاء العرض');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (promotion.status !== 'DRAFT') {
      toast.error("عفواً، لا يمكن حذف هذا العرض. برجاء إيقاف العرض (جعله غير نشط) أولاً.");
      return;
    }

    if (!window.confirm("هل أنت متأكد من حذف هذا العرض الترويجي نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/admin/promotions/${promotionId}`, {
        data: { version: promotion.version }
      });
      toast.success("تم حذف العرض الترويجي بنجاح");
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      onBack();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف العرض');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isPromotionLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-48 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-50 rounded animate-pulse mt-2"></div>
              <div className="h-4 w-5/6 bg-gray-50 rounded animate-pulse"></div>
              <div className="h-4 w-4/6 bg-gray-50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !promotion) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center gap-3">
        <p>حدث خطأ أثناء تحميل بيانات العرض الترويجي.</p>
        <button onClick={onBack} className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">العودة</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">نشط</span>;
      case 'DRAFT':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">مسودة</span>;
      case 'PAUSED':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">مؤقت</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">ملغي</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getSponsorText = (sponsorType) => {
    if (sponsorType === 'PLATFORM') return 'المنصة';
    if (sponsorType === 'PROVIDER') return 'المزود';
    return sponsorType;
  };

  const getModeText = (mode) => {
    if (mode === 'COUPON') return 'كوبون خصم';
    if (mode === 'AUTOMATIC') return 'خصم تلقائي';
    return mode;
  };

  const targets = promotion.targets || {};
  const hasTargets = (targets.serviceIds?.length > 0) || (targets.providerIds?.length > 0) || (targets.serviceZoneIds?.length > 0) || (targets.carTypeIds?.length > 0) || (targets.customerIds?.length > 0);

  const TargetGroup = ({ title, ids, nameMap }) => {
    if (!ids || ids.length === 0) return null;
    return (
      <div className="bg-purple-50/50 rounded-lg border border-purple-100 p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-purple-100/50 pb-2">
          <span className="text-sm font-medium text-purple-800">{title}</span>
          <span className="text-xs font-bold text-purple-700 bg-white px-2 py-0.5 rounded shadow-sm border border-purple-100">{ids.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ids.map(id => (
            <span key={id} className="text-xs font-medium bg-white text-purple-900 border border-purple-200 px-2.5 py-1 rounded-md shadow-sm">
              {nameMap ? (nameMap[id] || 'جاري التحميل...') : id}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="العودة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            تفاصيل العرض الترويجي
          </h2>
        </div>
        {getStatusBadge(promotion.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Info className="w-4 h-4 text-blue-600" />
            المعلومات الأساسية
          </h3>
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-gray-500 mb-1">كود العرض</span>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-mono font-bold rounded-lg border border-blue-100 text-lg" dir="ltr">
                {promotion.codeCanonical}
              </span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">الاسم</span>
              <p className="font-medium text-gray-900">{promotion.nameAr}</p>
              {promotion.nameEn && <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{promotion.nameEn}</p>}
            </div>
            {promotion.descriptionAr && (
              <div>
                <span className="block text-sm text-gray-500 mb-1">الوصف</span>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {promotion.descriptionAr}
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-xs text-gray-500 mb-1">جهة التمويل</span>
                <span className="text-sm font-medium text-gray-900">{getSponsorText(promotion.sponsorType)}</span>
              </div>
              <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-xs text-gray-500 mb-1">طريقة التطبيق</span>
                <span className="text-sm font-medium text-gray-900">{getModeText(promotion.applicationMode)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Financial Details & Limits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <CreditCard className="w-4 h-4 text-green-600" />
            القيم والحدود المالية
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">قيمة الخصم</span>
              <span className="text-xl font-bold text-green-700" dir="ltr">
                {promotion.discountType === 'PERCENTAGE' 
                  ? `${promotion.percentageBps / 100}%` 
                  : `${(promotion.fixedDiscountMinor / 100).toFixed(2)} ${promotion.currency || 'SAR'}`}
              </span>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">الحد الأقصى للخصم</span>
                <span className="text-sm font-semibold text-gray-900" dir="ltr">
                  {promotion.maximumDiscountMinor ? `${(promotion.maximumDiscountMinor / 100).toFixed(2)} ${promotion.currency || 'SAR'}` : 'بدون حد'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">الحد الأدنى للطلب</span>
                <span className="text-sm font-semibold text-gray-900" dir="ltr">
                  {promotion.minimumOrderMinor ? `${(promotion.minimumOrderMinor / 100).toFixed(2)} ${promotion.currency || 'SAR'}` : `0.00 ${promotion.currency || 'SAR'}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Usage Restrictions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <BarChart2 className="w-4 h-4 text-orange-600" />
            قيود الاستخدام
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-600">إجمالي مرات الاستخدام</span>
              <span className="text-sm font-semibold text-gray-900 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md">
                {promotion.totalUsageLimit || 'غير محدود'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-600">الحد الأقصى للعميل الواحد</span>
              <span className="text-sm font-semibold text-gray-900 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md">
                {promotion.perCustomerUsageLimit || 'غير محدد'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-600">الأولوية</span>
              <span className="text-sm font-semibold text-gray-900">
                {promotion.priority ?? 'غير محدد'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Calendar className="w-4 h-4 text-indigo-600" />
            الجدول الزمني
          </h3>
          <div className="space-y-4">
            <div className="relative pl-4 before:absolute before:right-0 before:top-2 before:bottom-[-16px] before:w-0.5 before:bg-gray-100">
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 ring-4 ring-white"></div>
                <div>
                  <span className="block text-xs text-gray-500">تاريخ الإنشاء</span>
                  <span className="text-sm font-medium text-gray-900" dir="ltr">{formatDate(promotion.createdAt) || 'غير متوفر'}</span>
                </div>
              </div>
            </div>
            <div className="relative pl-4 before:absolute before:right-0 before:top-2 before:bottom-[-16px] before:w-0.5 before:bg-gray-100">
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0 ring-4 ring-white"></div>
                <div>
                  <span className="block text-xs text-gray-500">تاريخ البدء</span>
                  <span className="text-sm font-medium text-gray-900" dir="ltr">{formatDate(promotion.startsAt) || 'فوراً'}</span>
                </div>
              </div>
            </div>
            <div className="relative pl-4">
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 ring-4 ring-white"></div>
                <div>
                  <span className="block text-xs text-gray-500">تاريخ الانتهاء</span>
                  <span className="text-sm font-medium text-gray-900" dir="ltr">{formatDate(promotion.endsAt) || 'مستمر (بدون نهاية)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Targeting */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Target className="w-4 h-4 text-purple-600" />
            الاستهداف
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            {!hasTargets ? (
              <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">يشمل جميع الخدمات والمزودين بدون قيود</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <TargetGroup title="الخدمات المستهدفة" ids={targets.serviceIds} nameMap={servicesMap} />
                <TargetGroup title="المزودين المستهدفين" ids={targets.providerIds} nameMap={providersMap} />
                <TargetGroup title="فئات السيارات المستهدفة" ids={targets.carTypeIds} nameMap={carTypesMap} />
                <TargetGroup title="مناطق التغطية المستهدفة" ids={targets.serviceZoneIds} nameMap={null} />
                <TargetGroup title="عملاء محددين" ids={targets.customerIds} nameMap={null} />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Analytics Summary */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          إحصائيات الاستخدام
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">العملاء المستفيدين</p>
              <p className="text-xl font-bold text-gray-900">{summary.uniqueCustomerCount || 0}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الخصومات</p>
              <p className="text-xl font-bold text-gray-900" dir="ltr">
                {summary.totalCustomerDiscountMinor ? (summary.totalCustomerDiscountMinor / 100).toFixed(2) : '0.00'} {summary.currency || 'SAR'}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الاستخدام الفعلي</p>
              <p className="text-xl font-bold text-gray-900">{summary.consumedCount || 0}</p>
              <p className="text-xs text-gray-400 mt-1">من أصل {summary.reservedCount || 0} حجز</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">تمويل المنصة</p>
              <p className="text-xl font-bold text-gray-900" dir="ltr">
                {summary.totalPlatformFundedAmountMinor ? (summary.totalPlatformFundedAmountMinor / 100).toFixed(2) : '0.00'} {summary.currency || 'SAR'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Redemptions History */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          سجل العمليات
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isRedemptionsLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : redemptionsList.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">لا توجد عمليات استخدام لهذا العرض حتى الآن.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">رقم الحجز</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">العميل</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">الخصم المطبق</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">التاريخ</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {redemptionsList.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.bookingId || item.bookingCode || 'غير متوفر'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.customerName || item.customer?.fullName || 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600" dir="ltr">
                          {item.discountAppliedMinor ? (item.discountAppliedMinor / 100).toFixed(2) : '0.00'} {summary.currency || 'SAR'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500" dir="ltr">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.status === 'CONSUMED' ? 'bg-green-100 text-green-800' : item.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.status === 'CONSUMED' ? 'مؤكد' : item.status === 'RESERVED' ? 'محجوز' : item.status || 'غير معروف'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(redemptionsTotalPages > 1 || redemptionsTotal > 0) && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  <span className="text-sm text-gray-600 font-medium">
                    صفحة {redemptionPage} من {redemptionsTotalPages}
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
                      onClick={() => setRedemptionPage(p => Math.min(redemptionsTotalPages, p + 1))}
                      disabled={redemptionPage >= redemptionsTotalPages}
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

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
        <div>
          {promotion.sponsorType === 'PLATFORM' && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting && <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
              حذف العرض
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {promotion.status !== 'CANCELLED' && (
            <button 
              onClick={() => onEdit(promotion)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              تعديل
            </button>
          )}
          {(promotion.status === 'DRAFT' || promotion.status === 'PAUSED') && (
            <button 
              onClick={handleActivate}
              disabled={isActivating}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isActivating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              تفعيل العرض
            </button>
          )}
          {promotion.status === 'ACTIVE' && (
            <button 
              onClick={handlePause}
              disabled={isPausing}
              className="px-5 py-2.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPausing && <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>}
              إيقاف العرض
            </button>
          )}
          {(promotion.status === 'ACTIVE' || promotion.status === 'PAUSED') && (
            <button 
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCancelling && <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
              إلغاء نهائياً
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
