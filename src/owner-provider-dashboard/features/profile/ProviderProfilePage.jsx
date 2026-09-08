import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Send, AlertTriangle, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';
import { useProviderProfileData, useUpdateProviderProfile } from './useProviderProfile';
import { useResubmitApplication } from './hooks/useProviderProfileHooks';
import ProfilePreviewCard from './components/ProfilePreviewCard';
import ProfileForm, { ProfileContactLocation } from './components/ProfileForm';
import useProviderAuthStore from '../../store/providerAuthStore';

export default function ProviderProfilePage() {
  const { data: profile, isLoading } = useProviderProfileData();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProviderProfile();
  const { mutate: resubmitApplication, isPending: isResubmitting } = useResubmitApplication();
  
  const [isEditMode, setIsEditMode] = React.useState(false);
  
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
      fullName: '',
      nameBusinessAr: '',
      nameBusinessEn: '',
      registerCommercial: '',
      descriptionAr: '',
      descriptionEn: '',
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
        fullName: profile.owner?.fullName || profile.fullName || '',
        nameBusinessAr: profile.nameBusinessAr || profile.nameBusiness || '',
        nameBusinessEn: profile.nameBusinessEn || '',
        registerCommercial: profile.registerCommercial || '',
        descriptionAr: profile.descriptionAr || profile.description || '',
        descriptionEn: profile.descriptionEn || '',
        phone: profile.owner?.phone || profile.phone || '',
        email: profile.owner?.email || profile.email || '',
        address: profile.address || { city: '', area: '', street: '', buildingNumber: '' }
      });
    }
  }, [profile, reset]);

  const onSubmit = (formData) => {
    const data = new FormData();
    
    // Append ONLY the allowed text fields
    if (formData.fullName?.trim()) data.append('fullName', formData.fullName.trim());
    if (formData.nameBusinessAr?.trim()) data.append('nameBusinessAr', formData.nameBusinessAr.trim());
    if (formData.nameBusinessEn?.trim()) data.append('nameBusinessEn', formData.nameBusinessEn.trim());
    if (formData.registerCommercial?.trim()) data.append('registerCommercial', formData.registerCommercial.trim());
    
    if (formData.descriptionAr?.trim()) {
      data.append('descriptionAr', formData.descriptionAr.trim());
    }
    if (formData.descriptionEn?.trim()) {
      data.append('descriptionEn', formData.descriptionEn.trim());
    }
    
    if (formData.address) {
      if (formData.address.city?.trim()) data.append('addressCity', formData.address.city.trim());
      if (formData.address.area?.trim()) data.append('addressArea', formData.address.area.trim());
      if (formData.address.street?.trim()) data.append('addressStreet', formData.address.street.trim());
      if (formData.address.buildingNumber?.trim()) data.append('addressBuildingNumber', formData.address.buildingNumber.trim());
    }
    
    // Handle file inputs (exclude verificationDocument strictly)
    if (formData.logoFile && formData.logoFile.length > 0) {
      data.append('logo', formData.logoFile[0]);
    }
    if (formData.coverFile && formData.coverFile.length > 0) {
      data.append('cover', formData.coverFile[0]);
    }

    updateProfile(data, {
      onSuccess: () => {
        toast.success("تم تحديث الملف التجاري بنجاح");
        setIsEditMode(false);
      },
      onError: (err) => {
        console.error("Profile Update Error:", err);
        toast.error(getApiErrorMessage(err, 'حدث خطأ أثناء تحديث الملف التجاري'), { duration: 6000 });
      }
    });
  };

  const watchLogoFile = watch('logoFile');
  const watchCoverFile = watch('coverFile');
  const watchNameBusiness = watch('nameBusinessAr');
  const watchNameBusinessEn = watch('nameBusinessEn');
  const watchDescription = watch('descriptionAr');
  const watchDescriptionEn = watch('descriptionEn');
  const watchFullName = watch('fullName');
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
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-96 bg-gray-200 rounded-xl"></div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const previewProfile = {
    ...profile,
    owner: {
      ...profile?.owner,
      fullName: watchFullName || profile?.owner?.fullName || profile?.fullName
    },
    nameBusiness: watchNameBusiness || profile?.nameBusinessAr || profile?.nameBusiness,
    nameBusinessEn: watchNameBusinessEn || profile?.nameBusinessEn,
    description: watchDescription || profile?.descriptionAr || profile?.description,
    descriptionEn: watchDescriptionEn || profile?.descriptionEn,
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
          toast.error(getApiErrorMessage(err, 'حدث خطأ أثناء إرسال الطلب'));
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
        <div className="flex gap-3">
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              تعديل البيانات
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  if (profile) {
                    reset({
                      fullName: profile.owner?.fullName || profile.fullName || '',
                      nameBusinessAr: profile.nameBusinessAr || profile.nameBusiness || '',
                      nameBusinessEn: profile.nameBusinessEn || '',
                      registerCommercial: profile.registerCommercial || '',
                      descriptionAr: profile.descriptionAr || profile.description || '',
                      descriptionEn: profile.descriptionEn || '',
                      phone: profile.owner?.phone || profile.phone || '',
                      email: profile.owner?.email || profile.email || '',
                      address: profile.address || { city: '', area: '', street: '', buildingNumber: '' }
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                إلغاء
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isUpdating || isResubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </>
          )}
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6 h-fit">
            <ProfilePreviewCard profile={previewProfile} />
            <ProfileContactLocation 
              profile={profile}
              register={register}
              isEditMode={isEditMode}
            />
          </div>
          
          <div className="lg:col-span-2">
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
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
