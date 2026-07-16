import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitOnboarding } from './hooks/useProviderProfileHooks';
import useProviderAuthStore from '../../store/providerAuthStore';

export default function ProviderOnboardingPage() {
  const navigate = useNavigate();
  const submitMutation = useSubmitOnboarding();
  const setProfileStatus = useProviderAuthStore((s) => s.setProfileStatus);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // Watch file inputs for displaying names (optional)
  const logoFile = watch('logo');
  const coverFile = watch('cover');
  const verificationDocument = watch('verificationDocument');

  const onSubmit = (data) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('typeProvider', data.typeProvider);
    formData.append('nameBusinessAr', data.nameBusinessAr);
    formData.append('nameBusinessEn', data.nameBusinessEn);
    formData.append('registerCommercial', data.registerCommercial);
    
    if (data.descriptionAr) formData.append('descriptionAr', data.descriptionAr);
    if (data.descriptionEn) formData.append('descriptionEn', data.descriptionEn);

    formData.append('addressTitle', data.addressTitle);
    formData.append('addressCity', data.addressCity);
    if (data.addressArea) formData.append('addressArea', data.addressArea);
    if (data.addressStreet) formData.append('addressStreet', data.addressStreet);
    if (data.addressBuildingNumber) formData.append('addressBuildingNumber', data.addressBuildingNumber);
    if (data.addressNotes) formData.append('addressNotes', data.addressNotes);
    if (data.addressLatitude) formData.append('addressLatitude', data.addressLatitude);
    if (data.addressLongitude) formData.append('addressLongitude', data.addressLongitude);

    // Append files if they exist
    if (data.logo && data.logo[0]) {
      formData.append('logo', data.logo[0]);
    }
    if (data.cover && data.cover[0]) {
      formData.append('cover', data.cover[0]);
    }
    if (data.verificationDocument && data.verificationDocument[0]) {
      formData.append('verificationDocument', data.verificationDocument[0]);
    }

    submitMutation.mutate(formData, {
      onSuccess: (res) => {
        toast.success('تم إرسال بيانات العمل بنجاح');
        setProfileStatus('PENDING_REVIEW'); // Or whatever the API returns
        navigate('/provider/pending-approval', { replace: true });
      },
      onError: (err) => {
        console.error("Onboarding Submit Error:", err);
        const data = err?.response?.data;
        let msg = data?.message || err?.message || 'حدث خطأ أثناء حفظ البيانات';
        
        if (Array.isArray(data?.message)) {
          msg = data.message.join(' | ');
        }
        
        if (data?.errors) {
          msg += " - " + JSON.stringify(data.errors);
        }

        toast.error(msg, { duration: 6000 });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">إعداد ملف العمل الخاص بك</h1>
          <p className="text-emerald-100">أكمل بيانات عملك للبدء في استقبال الحجوزات</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم العمل (بالعربية)</label>
                <input
                  type="text"
                  {...register('nameBusinessAr', { required: 'هذا الحقل مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="مركز العناية بالسيارات"
                />
                {errors.nameBusinessAr && <p className="text-red-500 text-xs mt-1">{errors.nameBusinessAr.message}</p>}
              </div>

              {/* Business Name English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم العمل (بالإنجليزية)</label>
                <input
                  type="text"
                  {...register('nameBusinessEn', { required: 'هذا الحقل مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="Car Care Center"
                  dir="ltr"
                />
                {errors.nameBusinessEn && <p className="text-red-500 text-xs mt-1">{errors.nameBusinessEn.message}</p>}
              </div>

              {/* Provider Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع الحساب</label>
                <select
                  {...register('typeProvider', { required: 'نوع الحساب مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">اختر نوع الحساب...</option>
                  <option value="COMPANY">شركة / مؤسسة</option>
                  <option value="INDIVIDUAL">فرد / مستقل</option>
                </select>
                {errors.typeProvider && <p className="text-red-500 text-xs mt-1">{errors.typeProvider.message}</p>}
              </div>

              {/* Commercial Registration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">السجل التجاري</label>
                <input
                  type="text"
                  {...register('registerCommercial', { required: 'السجل التجاري مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="1010XXXXXX"
                />
                {errors.registerCommercial && <p className="text-red-500 text-xs mt-1">{errors.registerCommercial.message}</p>}
              </div>

              {/* Description Arabic */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف العمل (بالعربية)</label>
                <textarea
                  {...register('descriptionAr', { required: 'الوصف بالعربية مطلوب' })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="وصف تفصيلي للخدمات المقدمة..."
                />
                {errors.descriptionAr && <p className="text-red-500 text-xs mt-1">{errors.descriptionAr.message}</p>}
              </div>

              {/* Description English */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف العمل (بالإنجليزية)</label>
                <textarea
                  {...register('descriptionEn', { required: 'الوصف بالإنجليزية مطلوب' })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="Detailed description of provided services..."
                  dir="ltr"
                />
                {errors.descriptionEn && <p className="text-red-500 text-xs mt-1">{errors.descriptionEn.message}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المدينة</label>
                <input
                  type="text"
                  {...register('addressCity', { required: 'المدينة مطلوبة' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="الرياض"
                />
                {errors.addressCity && <p className="text-red-500 text-xs mt-1">{errors.addressCity.message}</p>}
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المنطقة / الحي</label>
                <input
                  type="text"
                  {...register('addressArea', { required: 'الحي مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="حي العليا"
                />
                {errors.addressArea && <p className="text-red-500 text-xs mt-1">{errors.addressArea.message}</p>}
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الشارع</label>
                <input
                  type="text"
                  {...register('addressStreet', { required: 'الشارع مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="شارع التحلية"
                />
                {errors.addressStreet && <p className="text-red-500 text-xs mt-1">{errors.addressStreet.message}</p>}
              </div>

              {/* Building Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم المبنى</label>
                <input
                  type="text"
                  {...register('addressBuildingNumber', { required: 'رقم المبنى مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="1234"
                  dir="ltr"
                />
                {errors.addressBuildingNumber && <p className="text-red-500 text-xs mt-1">{errors.addressBuildingNumber.message}</p>}
              </div>

              {/* Full Address / Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">العنوان بالتفصيل (للعرض)</label>
                <input
                  type="text"
                  {...register('addressTitle', { required: 'العنوان مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="شارع التحلية، حي العليا"
                />
                {errors.addressTitle && <p className="text-red-500 text-xs mt-1">{errors.addressTitle.message}</p>}
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">خط العرض (Latitude)</label>
                <input
                  type="text"
                  {...register('addressLatitude', { required: 'خط العرض مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="24.7136"
                  dir="ltr"
                />
                {errors.addressLatitude && <p className="text-red-500 text-xs mt-1">{errors.addressLatitude.message}</p>}
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">خط الطول (Longitude)</label>
                <input
                  type="text"
                  {...register('addressLongitude', { required: 'خط الطول مطلوب' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="46.6753"
                  dir="ltr"
                />
                {errors.addressLongitude && <p className="text-red-500 text-xs mt-1">{errors.addressLongitude.message}</p>}
              </div>

              {/* Address Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ملاحظات العنوان</label>
                <textarea
                  {...register('addressNotes')}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="بالقرب من معلم معين، الدور الثاني..."
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">المرفقات والصور</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Logo Upload */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">شعار العمل (Logo)</label>
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-emerald-500 transition group">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 mb-2" />
                    <span className="text-xs text-gray-500 text-center">
                      {logoFile && logoFile.length > 0 ? logoFile[0].name : 'اضغط لاختيار صورة'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" {...register('logo', { required: 'الشعار مطلوب' })} />
                  </label>
                  {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo.message}</p>}
                </div>

                {/* Cover Upload */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة الغلاف (Cover)</label>
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-emerald-500 transition group">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 mb-2" />
                    <span className="text-xs text-gray-500 text-center">
                      {coverFile && coverFile.length > 0 ? coverFile[0].name : 'اضغط لاختيار صورة'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" {...register('cover')} />
                  </label>
                </div>

                {/* Verification Doc */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">وثيقة التحقق</label>
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-emerald-500 transition group">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 mb-2" />
                    <span className="text-xs text-gray-500 text-center">
                      {verificationDocument && verificationDocument.length > 0 ? verificationDocument[0].name : 'السجل التجاري أو رخصة العمل'}
                    </span>
                    <input type="file" className="hidden" accept=".pdf,image/*" {...register('verificationDocument', { required: 'وثيقة التحقق مطلوبة' })} />
                  </label>
                  {errors.verificationDocument && <p className="text-red-500 text-xs mt-1">{errors.verificationDocument.message}</p>}
                </div>

              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {submitMutation.isPending ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
