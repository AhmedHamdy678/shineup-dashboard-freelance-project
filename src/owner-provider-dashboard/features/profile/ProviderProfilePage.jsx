import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProviderProfileData, useUpdateProviderProfile } from './useProviderProfile';
import { useResubmitApplication } from './hooks/useProviderProfileHooks';
import ProfilePreviewCard from './components/ProfilePreviewCard';
import ProfileForm from './components/ProfileForm';
import useProviderAuthStore from '../../store/providerAuthStore';

export default function ProviderProfilePage() {
  const { data: profile, isLoading } = useProviderProfileData();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProviderProfile();
  const { mutate: resubmitApplication, isPending: isResubmitting } = useResubmitApplication();
  
  const setProfileStatus = useProviderAuthStore((s) => s.setProfileStatus);
  const profileStatus = useProviderAuthStore((s) => s.profileStatus);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nameBusiness: '',
      registerCommercial: '',
      description: '',
      phone: '',
      email: '',
      address: {
        city: '',
        area: '',
        street: '',
        buildingNumber: ''
      }
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        nameBusiness: profile.nameBusiness || '',
        registerCommercial: profile.registerCommercial || '',
        description: profile.description || '',
        phone: profile.owner?.phone || profile.phone || '',
        email: profile.owner?.email || profile.email || '',
        address: profile.address || { city: '', area: '', street: '', buildingNumber: '' }
      });
    }
  }, [profile, reset]);

  const onSubmit = (formData) => {
    const data = new FormData();
    
    // We do not append nameBusiness here, because the backend throws a validation error 
    // for it (likely because the business name cannot be changed after registration, 
    // or it requires a different localized key like nameBusinessAr).
    if (formData.registerCommercial?.trim()) data.append('registerCommercial', formData.registerCommercial.trim());
    
    // Based on Postman, the backend expects descriptionAr and descriptionEn
    if (formData.description?.trim()) {
      data.append('descriptionAr', formData.description.trim());
      data.append('descriptionEn', formData.description.trim()); // Send the same to both if we only have one input
    }
    
    // Clean up address object and append using flat keys (addressCity, addressArea, etc.)
    if (formData.address) {
      if (formData.address.city?.trim()) data.append('addressCity', formData.address.city.trim());
      if (formData.address.area?.trim()) data.append('addressArea', formData.address.area.trim());
      if (formData.address.street?.trim()) data.append('addressStreet', formData.address.street.trim());
      if (formData.address.buildingNumber?.trim()) data.append('addressBuildingNumber', formData.address.buildingNumber.trim());
    }
    
    // Handle file inputs
    if (formData.logoFile && formData.logoFile.length > 0) {
      data.append('logo', formData.logoFile[0]);
    }
    if (formData.coverFile && formData.coverFile.length > 0) {
      data.append('cover', formData.coverFile[0]);
    }
    if (formData.verificationDocument && formData.verificationDocument.length > 0) {
      data.append('verificationDocument', formData.verificationDocument[0]);
    }

    updateProfile(data, {
      onSuccess: () => {
        toast.success("تم تحديث الملف التجاري بنجاح");
      },
      onError: (err) => {
        console.error("Profile Update Error:", err);
        const data = err.response?.data;
        let msg = data?.message || err.message || "حدث خطأ أثناء تحديث الملف التجاري";
        
        // If message is an array (NestJS validation)
        if (Array.isArray(data?.message)) {
          msg = data.message.join(' | ');
        }
        
        // If there's an errors array or object
        if (data?.errors) {
          msg += " - " + JSON.stringify(data.errors);
        }

        toast.error(`خطأ: ${msg}`, { duration: 6000 });
      }
    });
  };

  const watchLogoFile = watch('logoFile');
  const watchCoverFile = watch('coverFile');
  const watchNameBusiness = watch('nameBusiness');
  const watchDescription = watch('description');
  const watchAddress = watch('address');

  // Generate live preview data
  const [liveLogoUrl, setLiveLogoUrl] = React.useState(null);
  const [liveCoverUrl, setLiveCoverUrl] = React.useState(null);

  useEffect(() => {
    if (watchLogoFile && watchLogoFile.length > 0) {
      const url = URL.createObjectURL(watchLogoFile[0]);
      setLiveLogoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLiveLogoUrl(null);
    }
  }, [watchLogoFile]);

  useEffect(() => {
    if (watchCoverFile && watchCoverFile.length > 0) {
      const url = URL.createObjectURL(watchCoverFile[0]);
      setLiveCoverUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLiveCoverUrl(null);
    }
  }, [watchCoverFile]);

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading profile...</div>;
  }

  const previewProfile = {
    ...profile,
    nameBusiness: watchNameBusiness || profile?.nameBusiness,
    description: watchDescription || profile?.description,
    logoUrl: liveLogoUrl || profile?.logoUrl,
    coverUrl: liveCoverUrl || profile?.coverUrl,
    address: {
      ...profile?.address,
      city: watchAddress?.city || profile?.address?.city,
      area: watchAddress?.area || profile?.address?.area,
    }
  };

  const handleResubmit = () => {
    if (window.confirm('هل أنت متأكد من أنك قمت بتحديث جميع البيانات المطلوبة وتريد إعادة إرسال الطلب للإدارة؟')) {
      resubmitApplication(undefined, {
        onSuccess: () => {
          toast.success('تم إرسال طلبك للمراجعة بنجاح.');
          // Setting the status to PENDING_REVIEW locks the dashboard UI immediately
          setProfileStatus('PENDING_REVIEW');
        },
        onError: (err) => {
          const msg = err.response?.data?.message || err.message || 'حدث خطأ أثناء إرسال الطلب';
          toast.error(`خطأ: ${msg}`);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {profileStatus === 'REJECTED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">طلبك مرفوض، يرجى تحديث بياناتك</h3>
              <p className="text-sm text-red-700 mt-1">
                بعد الانتهاء من تحديث وحفظ بيانات الملف التجاري، اضغط على زر "إعادة إرسال الطلب" ليتم مراجعته من قبل الإدارة.
              </p>
            </div>
          </div>
          <button
            onClick={handleResubmit}
            disabled={isResubmitting || isUpdating}
            className="shrink-0 flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isResubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            إعادة إرسال الطلب للمراجعة
          </button>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md pb-4 pt-2 -mt-2 flex justify-between items-center border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الملف التجاري</h1>
          <p className="text-gray-500 mt-1">تحديث بيانات وصور الملف التجاري الخاص بك</p>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isUpdating || isResubmitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfilePreviewCard profile={previewProfile} />
        </div>
        
        <div className="lg:col-span-2">
          <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
            <ProfileForm 
              profile={{
                ...profile,
                logoUrl: profile?.logoUrl || profile?.files?.logo?.url || profile?.files?.logo,
                coverUrl: profile?.coverUrl || profile?.files?.cover?.url || profile?.files?.cover,
                verificationDocument: profile?.verificationDocument || profile?.files?.verificationDocument?.url || profile?.files?.verificationDocument
              }}
              register={register} 
              setValue={setValue}
              watch={watch} 
              errors={errors} 
            />
          </form>
        </div>
      </div>
    </div>
  );
}
