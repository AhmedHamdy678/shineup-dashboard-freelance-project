import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../../../admin-dashboard/api/axiosClient';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import providerAxiosClient from '../../../api/providerAxiosClient';
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

export default function ProviderPromotionForm({ initialData, onClose }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: servicesRes } = useQuery({
    queryKey: ['provider-services-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/providers/me/services');
      return res.data;
    }
  });

  const { data: membersRes } = useQuery({
    queryKey: ['provider-members-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/providers/me/members');
      return res.data;
    }
  });

  const { data: carTypesRes } = useQuery({
    queryKey: ['catalog-car-types-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/catalog/car-types');
      return res.data;
    }
  });

  const { data: zonesRes } = useQuery({
    queryKey: ['provider-service-zones-list'],
    queryFn: async () => {
      const res = await providerAxiosClient.get('/providers/me/service-zones?page=1&limit=100&activeIs=true');
      return res.data;
    }
  });

  const serviceOptions = useMemo(() => {
    const items = servicesRes?.items || servicesRes?.data || (Array.isArray(servicesRes) ? servicesRes : []);
    return items.map(s => ({ label: s.overrideNameDisplay || s.service?.nameAr || s.nameAr || s.name || s.id, value: s.service?.id || s.serviceId || s.id }));
  }, [servicesRes]);

  const memberOptions = useMemo(() => {
    const items = membersRes?.items || membersRes?.data || (Array.isArray(membersRes) ? membersRes : []);
    return items.map(m => ({ label: m.user?.fullName || m.fullName || m.id, value: m.id }));
  }, [membersRes]);

  const carTypeOptions = useMemo(() => {
    const items = carTypesRes?.items || carTypesRes?.data || (Array.isArray(carTypesRes) ? carTypesRes : []);
    return items.map(c => ({ label: c.nameAr || c.name || c.id, value: c.id }));
  }, [carTypesRes]);

  const zoneOptions = useMemo(() => {
    const items = zonesRes?.items || zonesRes?.data || (Array.isArray(zonesRes) ? zonesRes : []);
    return items.map(z => ({ label: z.label || z.nameAr || z.name || z.id, value: z.id }));
  }, [zonesRes]);


  const [formData, setFormData] = useState({
    applicationMode: initialData?.applicationMode || 'COUPON',
    code: initialData?.codeCanonical || '',
    nameAr: initialData?.nameAr || '',
    nameEn: initialData?.nameEn || '',
    descriptionAr: initialData?.descriptionAr || '',
    descriptionEn: initialData?.descriptionEn || '',
    discountType: initialData?.discountType || 'PERCENTAGE',
    percentageValue: initialData?.percentageBps ? initialData.percentageBps / 100 : '',
    fixedValue: initialData?.fixedDiscountMinor ? initialData.fixedDiscountMinor / 100 : '',
    minimumOrder: initialData?.minimumOrderMinor ? initialData.minimumOrderMinor / 100 : '',
    maximumDiscount: initialData?.maximumDiscountMinor ? initialData.maximumDiscountMinor / 100 : '',
    totalUsageLimit: initialData?.totalUsageLimit || '',
    perCustomerUsageLimit: initialData?.perCustomerUsageLimit || 1,
    priority: initialData?.priority || 100,
    startsAt: initialData?.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : '',
    endsAt: initialData?.endsAt ? new Date(initialData.endsAt).toISOString().slice(0, 16) : '',
    targets: {
      serviceIds: initialData?.targets?.serviceIds || [],
      providerMemberIds: initialData?.targets?.providerMemberIds || [],
      carTypeIds: initialData?.targets?.carTypeIds || [],
      serviceZoneIds: initialData?.targets?.serviceZoneIds || []
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFinancialsLocked = initialData && initialData.status !== 'DRAFT';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (initialData) {
        const patchPayload = { version: initialData.version };

        if (formData.nameAr !== initialData.nameAr) patchPayload.nameAr = formData.nameAr;
        if (formData.nameEn !== (initialData.nameEn || '')) patchPayload.nameEn = formData.nameEn || undefined;
        if (formData.descriptionAr !== (initialData.descriptionAr || '')) patchPayload.descriptionAr = formData.descriptionAr || undefined;
        if (formData.descriptionEn !== (initialData.descriptionEn || '')) patchPayload.descriptionEn = formData.descriptionEn || undefined;
        
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
        }

        const totLim = formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null;
        if (totLim !== (initialData.totalUsageLimit || null)) patchPayload.totalUsageLimit = totLim;

        const perCust = formData.perCustomerUsageLimit ? Number(formData.perCustomerUsageLimit) : 1;
        if (perCust !== (initialData.perCustomerUsageLimit || 1)) patchPayload.perCustomerUsageLimit = perCust;

        const prio = formData.priority ? Number(formData.priority) : 100;
        if (prio !== (initialData.priority || 100)) patchPayload.priority = prio;

        const originalStartsAt = initialData?.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : '';
        if (formData.startsAt !== originalStartsAt) patchPayload.startsAt = new Date(formData.startsAt).toISOString();

        const originalEndsAt = initialData?.endsAt ? new Date(initialData.endsAt).toISOString().slice(0, 16) : '';
        if (formData.endsAt !== originalEndsAt) patchPayload.endsAt = new Date(formData.endsAt).toISOString();

        const oldTargetsStr = JSON.stringify({
          providerMemberIds: initialData.targets?.providerMemberIds || [],
          serviceIds: initialData.targets?.serviceIds || [],
          carTypeIds: initialData.targets?.carTypeIds || [],
          serviceZoneIds: initialData.targets?.serviceZoneIds || []
        });
        
        const newTargetsStr = JSON.stringify({
          providerMemberIds: formData.targets.providerMemberIds || [],
          serviceIds: formData.targets.serviceIds || [],
          carTypeIds: formData.targets.carTypeIds || [],
          serviceZoneIds: formData.targets.serviceZoneIds || []
        });

        if (oldTargetsStr !== newTargetsStr) {
          patchPayload.targets = JSON.parse(newTargetsStr);
        }

        await providerAxiosClient.patch(`/providers/me/promotions/${initialData.id}`, patchPayload, {
          headers: { 'Accept-Language': 'ar' }
        });
        toast.success("تم تحديث العرض الترويجي بنجاح");
      } else {
        // القيم المقبولة من الـ API: 'PERCENTAGE' أو 'FIXED_AMOUNT'
        const payload = {
          applicationMode: formData.applicationMode,
          nameAr: formData.nameAr,
          descriptionAr: formData.descriptionAr,
          discountType: formData.discountType,
          currency: "SAR",
          perCustomerUsageLimit: formData.perCustomerUsageLimit ? Number(formData.perCustomerUsageLimit) : 1,
          priority: formData.priority ? Number(formData.priority) : 100,
          startsAt: new Date(formData.startsAt).toISOString(),
          endsAt: new Date(formData.endsAt).toISOString(),
          targets: formData.targets
        };

        // إرسال الحد الأدنى فقط إذا كان أكبر من 0
        if (formData.minimumOrder && Number(formData.minimumOrder) > 0) {
          payload.minimumOrderMinor = Math.round(Number(formData.minimumOrder) * 100);
        }

        if (formData.applicationMode === 'COUPON') {
          payload.code = formData.code;
        }

        if (formData.discountType === 'PERCENTAGE') {
          payload.percentageBps = Math.round(Number(formData.percentageValue) * 100);
          if (formData.maximumDiscount) {
            payload.maximumDiscountMinor = Math.round(Number(formData.maximumDiscount) * 100);
          }
        } else if (formData.discountType === 'FIXED_AMOUNT') {
          payload.fixedDiscountMinor = Math.round(Number(formData.fixedValue) * 100);
        }

        if (formData.totalUsageLimit) {
          payload.totalUsageLimit = Number(formData.totalUsageLimit);
        }
        
        if (formData.nameEn) {
          payload.nameEn = formData.nameEn;
        }
        
        if (formData.descriptionEn) {
          payload.descriptionEn = formData.descriptionEn;
        }

        await providerAxiosClient.post('/providers/me/promotions', payload, {
          headers: { 'Accept-Language': 'ar' }
        });
        toast.success("تم إنشاء العرض الترويجي بنجاح");
      }

      queryClient.invalidateQueries({ queryKey: ['provider-promotions'] });
      if (initialData) {
        queryClient.invalidateQueries({ queryKey: ['provider-promotion', initialData.id] });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, initialData ? 'حدث خطأ أثناء تحديث العرض' : 'حدث خطأ أثناء إنشاء العرض الترويجي'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-100px)]" dir="rtl">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{initialData ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="provider-promotion-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
          
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
                <input required type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" dir="ltr" />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف (بالعربية) *</label>
                  <textarea required name="descriptionAr" value={formData.descriptionAr} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف (بالإنجليزية)</label>
                  <textarea required name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" rows={3} dir="ltr" />
                </div>
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
                  <option value="FIXED_AMOUNT">مبلغ ثابت</option>
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
              
              {formData.discountType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الحد الأقصى للخصم (SAR)</label>
                  <input disabled={isFinancialsLocked} type="number" min="1" step="0.01" name="maximumDiscount" value={formData.maximumDiscount} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="بدون حد" />
                </div>
              )}
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
                  label="أعضاء الفريق المستهدفين" 
                  placeholder="اختر الأعضاء..." 
                  options={memberOptions}
                  selectedIds={formData.targets.providerMemberIds}
                  onChange={useCallback((ids) => setFormData(prev => ({ ...prev, targets: { ...prev.targets, providerMemberIds: ids } })), [])}
                  disabled={isFinancialsLocked}
                />
                <TagInput 
                  label="مناطق التغطية المستهدفة" 
                  placeholder="اختر المناطق..." 
                  options={zoneOptions}
                  selectedIds={formData.targets.serviceZoneIds}
                  onChange={useCallback((ids) => setFormData(prev => ({ ...prev, targets: { ...prev.targets, serviceZoneIds: ids } })), [])}
                  disabled={isFinancialsLocked}
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
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="provider-promotion-form"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
        >
          {isSubmitting ? (
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
