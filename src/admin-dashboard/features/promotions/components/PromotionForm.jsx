import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { X, Check, Info, CreditCard, BarChart2, Calendar, Target } from 'lucide-react';

const TagInput = React.memo(({ label, placeholder, options, selectedIds, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = (id) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(v => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div 
        className={`min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 flex flex-wrap gap-2 items-center ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer'}`}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      >
        {selectedIds.length === 0 ? (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        ) : (
          selectedIds.map(id => {
            const opt = options.find(o => o.value === id);
            return (
              <span key={id} className={`bg-purple-100 text-purple-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium ${disabled ? 'opacity-70' : ''}`} onClick={(e) => e.stopPropagation()}>
                {opt?.label || id}
                {!disabled && (
                  <button type="button" onClick={() => handleToggle(id)} className="hover:text-purple-900 focus:outline-none">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">لا تتوفر خيارات</div>
          ) : (
            options.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
              </label>
            ))
          )}
        </div>
      )}
      
      {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
});

const formatLocalDatetime = (utcString) => {
  if (!utcString) return '';
  const d = new Date(utcString);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function PromotionForm({ onCancel, onSuccess, initialData }) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Master Data
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

  const serviceOptions = useMemo(() => (Array.isArray(servicesData) ? servicesData : servicesData?.data || []).map(s => ({ label: s.nameAr, value: s.id })), [servicesData]);
  const providerOptions = useMemo(() => (providersData?.items || []).map(p => ({ label: p.businessNameAr || p.businessName || p.owner?.fullName || 'بدون اسم', value: p.providerId || p.id })), [providersData]);
  const carTypeOptions = useMemo(() => (Array.isArray(carTypesData) ? carTypesData : carTypesData?.data || []).map(c => ({ label: c.nameAr, value: c.id })), [carTypesData]);

  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        applicationMode: initialData.applicationMode || 'COUPON',
        code: initialData.codeCanonical || '',
        nameAr: initialData.nameAr || '',
        nameEn: initialData.nameEn || '',
        discountType: initialData.discountType || 'PERCENTAGE',
        percentageValue: initialData.percentageBps ? initialData.percentageBps / 100 : '',
        fixedValue: initialData.fixedDiscountMinor ? initialData.fixedDiscountMinor / 100 : '',
        minimumOrder: initialData.minimumOrderMinor ? initialData.minimumOrderMinor / 100 : '',
        maximumDiscount: initialData.maximumDiscountMinor ? initialData.maximumDiscountMinor / 100 : '',
        totalUsageLimit: initialData.totalUsageLimit || '',
        perCustomerUsageLimit: initialData.perCustomerUsageLimit || 1,
        priority: initialData.priority || 100,
        startsAt: formatLocalDatetime(initialData.startsAt),
        endsAt: formatLocalDatetime(initialData.endsAt),
        targets: {
          serviceIds: initialData.targets?.serviceIds || [],
          providerIds: initialData.targets?.providerIds || [],
          serviceZoneIds: initialData.targets?.serviceZoneIds || [],
          carTypeIds: initialData.targets?.carTypeIds || []
        }
      };
    }
    return {
      applicationMode: 'COUPON',
      code: '',
      nameAr: '',
      nameEn: '',
      discountType: 'PERCENTAGE',
      percentageValue: '',
      fixedValue: '',
      minimumOrder: '',
      maximumDiscount: '',
      totalUsageLimit: '',
      perCustomerUsageLimit: 1,
      priority: 100,
      startsAt: '',
      endsAt: '',
      targets: {
        serviceIds: [],
        providerIds: [],
        serviceZoneIds: [],
        carTypeIds: []
      }
    };
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFinancialsLocked = initialData && initialData.status !== 'DRAFT';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        const patchPayload = { version: initialData.version };

        if (formData.nameAr !== initialData.nameAr) patchPayload.nameAr = formData.nameAr;
        if (formData.nameEn !== (initialData.nameEn || '')) patchPayload.nameEn = formData.nameEn || undefined;
        
        if (!isFinancialsLocked) {
          const minMinor = formData.minimumOrder ? Math.round(Number(formData.minimumOrder) * 100) : 0;
          if (minMinor !== (initialData.minimumOrderMinor || 0)) patchPayload.minimumOrderMinor = minMinor;
          
          const maxMinor = formData.maximumDiscount ? Math.round(Number(formData.maximumDiscount) * 100) : null;
          if (maxMinor !== (initialData.maximumDiscountMinor || null)) patchPayload.maximumDiscountMinor = maxMinor;

          if (formData.discountType === 'PERCENTAGE') {
            const perc = Math.round(Number(formData.percentageValue) * 100);
            if (perc !== (initialData.percentageBps || 0)) patchPayload.percentageBps = perc;
          } else {
            const fix = Math.round(Number(formData.fixedValue) * 100);
            if (fix !== (initialData.fixedDiscountMinor || 0)) patchPayload.fixedDiscountMinor = fix;
          }

          const oldStartsAt = formatLocalDatetime(initialData.startsAt);
          if (formData.startsAt !== oldStartsAt) patchPayload.startsAt = new Date(formData.startsAt).toISOString();

          const oldEndsAt = formatLocalDatetime(initialData.endsAt);
          if (formData.endsAt !== oldEndsAt) patchPayload.endsAt = new Date(formData.endsAt).toISOString();

          const oldTargetsStr = JSON.stringify({
            providerIds: initialData.targets?.providerIds || [],
            serviceIds: initialData.targets?.serviceIds || [],
            carTypeIds: initialData.targets?.carTypeIds || [],
            serviceZoneIds: initialData.targets?.serviceZoneIds || []
          });
          
          const newTargetsStr = JSON.stringify({
            providerIds: formData.targets.providerIds || [],
            serviceIds: formData.targets.serviceIds || [],
            carTypeIds: formData.targets.carTypeIds || [],
            serviceZoneIds: formData.targets.serviceZoneIds || []
          });

          if (oldTargetsStr !== newTargetsStr) {
            patchPayload.targets = JSON.parse(newTargetsStr);
          }
        }

        const totLim = formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null;
        if (totLim !== (initialData.totalUsageLimit || null)) patchPayload.totalUsageLimit = totLim;

        const perCust = formData.perCustomerUsageLimit ? Number(formData.perCustomerUsageLimit) : 1;
        if (perCust !== (initialData.perCustomerUsageLimit || 1)) patchPayload.perCustomerUsageLimit = perCust;

        const prio = formData.priority ? Number(formData.priority) : 100;
        if (prio !== (initialData.priority || 100)) patchPayload.priority = prio;

        await axiosClient.patch(`/admin/promotions/${initialData.id}`, patchPayload);
        toast.success('تم تحديث العرض الترويجي بنجاح');
      } else {
        const payload = {
          applicationMode: formData.applicationMode,
          nameAr: formData.nameAr,
          discountType: formData.discountType,
          currency: "SAR",
          
          minimumOrderMinor: formData.minimumOrder ? Math.round(Number(formData.minimumOrder) * 100) : 0,
          
          perCustomerUsageLimit: formData.perCustomerUsageLimit ? Number(formData.perCustomerUsageLimit) : 1,
          priority: formData.priority ? Number(formData.priority) : 100,
          
          startsAt: new Date(formData.startsAt).toISOString(),
          endsAt: new Date(formData.endsAt).toISOString(),
          
          targets: {
            providerIds: formData.targets.providerIds || [],
            serviceIds: formData.targets.serviceIds || [],
            carTypeIds: formData.targets.carTypeIds || [],
            serviceZoneIds: formData.targets.serviceZoneIds || []
          }
        };

        if (formData.discountType === 'PERCENTAGE') {
          payload.percentageBps = Math.round(Number(formData.percentageValue) * 100);
        } else if (formData.discountType === 'FIXED') {
          payload.fixedDiscountMinor = Math.round(Number(formData.fixedValue) * 100);
        }

        if (formData.maximumDiscount) {
          payload.maximumDiscountMinor = Math.round(Number(formData.maximumDiscount) * 100);
        }

        if (formData.totalUsageLimit) {
          payload.totalUsageLimit = Number(formData.totalUsageLimit);
        }

        if (formData.applicationMode === 'COUPON') {
          payload.code = formData.code;
        }
        if (formData.nameEn) {
          payload.nameEn = formData.nameEn;
        }

        await axiosClient.post('/admin/promotions', payload);
        toast.success('تمت إضافة العرض الترويجي بنجاح');
      }

      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      if (initialData) {
        queryClient.invalidateQueries({ queryKey: ['admin-promotion', initialData.id] });
      }
      onSuccess();
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      
      let errMsg = 'حدث خطأ أثناء حفظ العرض';
      const data = error.response?.data;
      
      if (data) {
        if (typeof data.message === 'string') {
          errMsg = data.message;
        } else if (Array.isArray(data.message)) {
          errMsg = data.message.map(m => {
            if (typeof m === 'object' && m.constraints) {
              return Object.values(m.constraints).join(', ');
            }
            return typeof m === 'object' ? JSON.stringify(m) : m;
          }).join(' | ');
        }
        
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errMsg += ' - ' + data.errors.map(e => {
              if (typeof e === 'object' && e.constraints) return Object.values(e.constraints).join(', ');
              return typeof e === 'object' ? JSON.stringify(e) : e;
            }).join(' | ');
          } else if (typeof data.errors === 'object') {
            const errDetails = Object.values(data.errors).flat().map(e => typeof e === 'object' ? JSON.stringify(e) : e).join(' | ');
            if (errDetails) errMsg += ' - ' + errDetails;
          }
        }
      }
      
      toast.error(errMsg, { duration: 6000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-100px)]" dir="rtl">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{initialData ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="promotion-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
          
          {isFinancialsLocked && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">تنبيه: تحديث العرض</p>
                <p>لا يمكنك تعديل الحقول المالية، الجدول الزمني، أو الاستهداف عند التحديث للحفاظ على سلامة العمليات. يمكنك تعديل الأسماء وقيود الاستخدام فقط.</p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <section>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم (بالعربية) *</label>
                <input required type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم (بالإنجليزية)</label>
                <input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">طريقة التطبيق *</label>
                <select disabled={!!initialData} name="applicationMode" value={formData.applicationMode} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed">
                  <option value="COUPON">كوبون خصم</option>
                  <option value="AUTOMATIC">خصم تلقائي</option>
                </select>
              </div>
              {formData.applicationMode === 'COUPON' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">كود الخصم *</label>
                  <input required disabled={!!initialData} type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition uppercase disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="مثال: SUMMER24" />
                </div>
              )}
            </div>
          </section>

          {/* Financial Values & Limits */}
          <section>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-green-600" />
              القيم والحدود
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-green-50/30 rounded-xl border border-green-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع الخصم *</label>
                <select disabled={!!initialData} name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-white disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed">
                  <option value="PERCENTAGE">نسبة مئوية (%)</option>
                  <option value="FIXED">مبلغ ثابت</option>
                </select>
              </div>
              
              {formData.discountType === 'PERCENTAGE' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">النسبة المئوية (%) *</label>
                  <input required disabled={isFinancialsLocked} type="number" min="1" max="100" step="0.01" name="percentageValue" value={formData.percentageValue} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="20" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">مبلغ الخصم الثابت (SAR) *</label>
                  <input required disabled={isFinancialsLocked} type="number" min="1" step="0.01" name="fixedValue" value={formData.fixedValue} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="50" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الحد الأدنى للطلب (SAR)</label>
                <input disabled={isFinancialsLocked} type="number" min="0" step="0.01" name="minimumOrder" value={formData.minimumOrder} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الحد الأقصى للخصم (SAR)</label>
                <input disabled={isFinancialsLocked} type="number" min="1" step="0.01" name="maximumDiscount" value={formData.maximumDiscount} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="بدون حد" />
              </div>
            </div>
          </section>

          {/* Usage Limits */}
          <section>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-orange-600" />
              قيود الاستخدام
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-orange-50/30 rounded-xl border border-orange-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">إجمالي مرات الاستخدام</label>
                <input type="number" min="1" name="totalUsageLimit" value={formData.totalUsageLimit} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" dir="ltr" placeholder="غير محدود" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الحد الأقصى للعميل</label>
                <input type="number" min="1" name="perCustomerUsageLimit" value={formData.perCustomerUsageLimit} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" dir="ltr" placeholder="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الأولوية</label>
                <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" dir="ltr" placeholder="100" />
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              الجدول الزمني
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-indigo-50/30 rounded-xl border border-indigo-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ ووقت البدء *</label>
                <input required disabled={isFinancialsLocked} type="datetime-local" name="startsAt" value={formData.startsAt} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ ووقت الانتهاء *</label>
                <input required disabled={isFinancialsLocked} type="datetime-local" name="endsAt" value={formData.endsAt} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" />
              </div>
            </div>
          </section>

          {/* Targets */}
          <section>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              الاستهداف
            </h3>
            <div className="p-5 bg-purple-50/30 rounded-xl border border-purple-100 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TagInput 
                  label="الخدمات المستهدفة" 
                  placeholder="اختر الخدمات..." 
                  options={serviceOptions}
                  selectedIds={formData.targets.serviceIds}
                  onChange={useCallback((ids) => setFormData(prev => ({ ...prev, targets: { ...prev.targets, serviceIds: ids } })), [])}
                  disabled={isFinancialsLocked}
                />
                <TagInput 
                  label="المزودين المستهدفين" 
                  placeholder="اختر المزودين..." 
                  options={providerOptions}
                  selectedIds={formData.targets.providerIds}
                  onChange={useCallback((ids) => setFormData(prev => ({ ...prev, targets: { ...prev.targets, providerIds: ids } })), [])}
                  disabled={isFinancialsLocked}
                />
                <TagInput 
                  label="مناطق التغطية المستهدفة" 
                  placeholder="قريباً (جاري تحديث البيانات)..." 
                  options={[]}
                  selectedIds={formData.targets.serviceZoneIds}
                  onChange={useCallback((ids) => setFormData(prev => ({ ...prev, targets: { ...prev.targets, serviceZoneIds: ids } })), [])}
                  disabled={true}
                />
                <TagInput 
                  label="فئات السيارات المستهدفة" 
                  placeholder="اختر الفئات..." 
                  options={carTypeOptions}
                  selectedIds={formData.targets.carTypeIds}
                  onChange={useCallback((ids) => setFormData(prev => ({ ...prev, targets: { ...prev.targets, carTypeIds: ids } })), [])}
                  disabled={isFinancialsLocked}
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                اترك الحقول فارغة إذا كان العرض يشمل الجميع بدون قيود.
              </p>
            </div>
          </section>

        </form>
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3 sticky bottom-0 z-10 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="promotion-form"
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Check className="w-5 h-5" />
          )}
          {initialData ? 'حفظ التعديلات' : 'إضافة العرض'}
        </button>
      </div>
    </div>
  );
}
