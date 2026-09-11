import React, { useEffect, useState } from 'react';
import { UploadCloud, Building2, MapPin, X, FileImage, FileText, ExternalLink } from 'lucide-react';
import Card from '../../../../shared/components/ui/Card';
import providerAxiosClient from '../../../api/providerAxiosClient';
import { getApiErrorMessage } from '../../../../admin-dashboard/api/axiosClient';
import toast from 'react-hot-toast';

export function ProfileContactLocation({ profile, register, isEditMode }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-600" />
        معلومات التواصل والموقع
      </h3>
      
      {isEditMode ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المالك / Owner Name</label>
            <input
              type="text"
              placeholder="اسم المالك"
              {...register('fullName')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الجوال</label>
              <div className="w-full px-3 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg text-sm cursor-not-allowed flex items-center justify-between" dir="ltr">
                <span className="truncate">{profile?.owner?.phone || profile?.phone || '---'}</span>
                <span className="text-[10px] text-gray-400 font-medium shrink-0 bg-gray-200 px-1.5 py-0.5 rounded">غير قابل للتعديل</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                {...register('owner.email')}
                dir="ltr"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mb-3">تفاصيل العنوان</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 text-xs">المدينة</label>
              <input
                type="text"
                placeholder="المدينة"
                {...register('address.city')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 text-xs">المنطقة</label>
              <input
                type="text"
                placeholder="المنطقة"
                {...register('address.area')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 text-xs">الشارع</label>
              <input
                type="text"
                placeholder="الشارع"
                {...register('address.street')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 text-xs">رقم المبنى</label>
              <input
                type="text"
                placeholder="رقم المبنى"
                {...register('address.buildingNumber')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mt-4">
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">اسم المالك</span>
            <span className="text-base font-semibold text-gray-900">{profile?.owner?.fullName || profile?.fullName || '---'}</span>
          </div>
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">رقم الجوال</span>
            <span className="text-base font-semibold text-gray-900 text-left w-auto max-w-full" dir="ltr">{profile?.owner?.phone || profile?.phone || '---'}</span>
          </div>
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">البريد الإلكتروني</span>
            <span className="text-base font-semibold text-gray-900 text-left w-auto max-w-full" dir="ltr">{profile?.owner?.email || profile?.email || '---'}</span>
          </div>
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">المدينة</span>
            <span className="text-base font-semibold text-gray-900">{profile?.address?.city || '---'}</span>
          </div>
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">المنطقة</span>
            <span className="text-base font-semibold text-gray-900">{profile?.address?.area || '---'}</span>
          </div>
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">الشارع</span>
            <span className="text-base font-semibold text-gray-900">{profile?.address?.street || '---'}</span>
          </div>
          <div className="flex flex-col items-start gap-1 w-full text-right">
            <span className="text-sm font-medium text-gray-500">رقم المبنى</span>
            <span className="text-base font-semibold text-gray-900">{profile?.address?.buildingNumber || '---'}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ProfileForm({ profile, register, setValue, watch, errors, isEditMode }) {
  return (
    <div className="space-y-6">
      {/* BASIC INFO */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          المعلومات الأساسية
        </h3>
        
        {isEditMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم التجاري</label>
              <input
                type="text"
                placeholder="الاسم التجاري"
                {...register('nameBusinessAr', { required: 'الاسم التجاري مطلوب' })}
                className={`w-full px-3 py-2 border ${errors.nameBusinessAr ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
              {errors.nameBusinessAr && <p className="text-red-500 text-xs mt-1">{errors.nameBusinessAr.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم التجاري (إنجليزي) / Business Name (EN)</label>
              <input
                type="text"
                placeholder="Business Name"
                {...register('nameBusinessEn')}
                dir="ltr"
                className={`w-full px-3 py-2 border ${errors.nameBusinessEn ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
              {errors.nameBusinessEn && <p className="text-red-500 text-xs mt-1">{errors.nameBusinessEn.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">السجل التجاري</label>
              <input
                type="text"
                placeholder="رقم السجل التجاري"
                {...register('registerCommercial')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-6 mt-4">
            <div className="flex flex-col items-start gap-1 w-full text-right">
              <span className="text-sm font-medium text-gray-500">الاسم التجاري</span>
              <div className="flex flex-col items-start gap-1 w-full text-right">
                <span className="text-base font-semibold text-gray-900 block">{profile?.nameBusinessAr || profile?.nameBusiness || '---'}</span>
                {profile?.nameBusinessEn && (
                  <span className="text-sm text-gray-500 block text-left w-auto max-w-full" dir="ltr">{profile.nameBusinessEn}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start gap-1 w-full text-right">
              <span className="text-sm font-medium text-gray-500">السجل التجاري</span>
              <span className="text-base font-semibold text-gray-900">{profile?.registerCommercial || '---'}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FileUploadZone 
            label="الشعار" 
            name="logoFile" 
            existingUrl={profile?.logoUrl}
            register={register} 
            watch={watch}
            setValue={setValue}
            isEditMode={isEditMode}
          />
          <FileUploadZone 
            label="صورة الغلاف" 
            name="coverFile" 
            existingUrl={profile?.coverUrl}
            register={register} 
            watch={watch}
            setValue={setValue}
            isEditMode={isEditMode}
          />
          <FileUploadZone 
            label="مستند التوثيق" 
            name="verificationDocument" 
            existingUrl={profile?.verificationDocument}
            register={register} 
            watch={watch}
            setValue={setValue}
            isEditMode={false} // Force read-only
          />
        </div>
      </Card>

      {/* BUSINESS DESCRIPTION */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">وصف النشاط التجاري</h3>
        <div>
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف النشاط (عربي)</label>
                <textarea
                  {...register('descriptionAr')}
                  rows={4}
                  placeholder="حدثنا عن نشاطك التجاري..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description (EN)</label>
                <textarea
                  {...register('descriptionEn')}
                  rows={4}
                  dir="ltr"
                  placeholder="Tell us about your business..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col items-start gap-1 w-full text-right">
                <span className="text-sm font-medium text-gray-500">الوصف (عربي)</span>
                <span className="text-base font-semibold text-gray-900 whitespace-pre-wrap">{profile?.descriptionAr || profile?.description || '---'}</span>
              </div>
              <div className="flex flex-col items-start gap-1 w-full text-right">
                <span className="text-sm text-gray-500">Description (EN)</span>
                <span dir="ltr" className="text-base text-gray-900 text-left w-auto max-w-full whitespace-pre-wrap">
                  {profile?.descriptionEn || '---'}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>


    </div>
  );
}

function FileUploadZone({ label, name, existingUrl, register, watch, setValue, isEditMode }) {
  const fileList = watch(name);
  const file = fileList && fileList.length > 0 ? fileList[0] : null;
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fetchedImgSrc, setFetchedImgSrc] = useState(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (!file && existingUrl) {
      let urlStr = typeof existingUrl === 'string' ? existingUrl : (existingUrl?.downloadUrl || existingUrl?.url || existingUrl?.path || (existingUrl?.mediaId ? `/media/${existingUrl.mediaId}` : ''));
      
      if (urlStr && urlStr.includes('localhost')) {
        const baseUrl = import.meta.env.VITE_SOCKET_URL || 'https://api-dev.shineupapp.tech';
        urlStr = urlStr.replace(/^https?:\/\/localhost(:\d+)?/, baseUrl);
      }
      const isImage = name === 'logoFile' || name === 'coverFile' || (urlStr && urlStr.match(/\.(jpeg|jpg|gif|png|webp)$/i));
      
      if (isImage && urlStr) {
        if (urlStr.startsWith('http') || urlStr.startsWith('data:')) {
          setFetchedImgSrc(urlStr);
        } else {
          let isMounted = true;
          const fetchImage = async () => {
            try {
              const cleanPath = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
              const res = await providerAxiosClient.get(cleanPath, { responseType: 'blob' });
              if (isMounted) {
                const objectUrl = window.URL.createObjectURL(res.data);
                setFetchedImgSrc(objectUrl);
              }
            } catch (e) {
              console.error('Failed to fetch image preview', e);
            }
          };
          fetchImage();
          return () => { isMounted = false; };
        }
      }
    }
  }, [file, existingUrl, name]);

  const handleRemove = (e) => {
    e.preventDefault();
    setValue(name, null);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // State 1: A new file is selected locally
  if (file) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex flex-col relative transition-colors h-full min-h-[120px]">
        <button 
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            {file.type.startsWith('image/') ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
        </div>
        <a 
          href={previewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          معاينة
        </a>
      </div>
    );
  }

  // State 2: Existing File Preview (Server Image)
  if (!file && existingUrl) {
    let urlStr = typeof existingUrl === 'string' 
      ? existingUrl 
      : (existingUrl?.downloadUrl || existingUrl?.url || existingUrl?.path || (existingUrl?.mediaId ? `/media/${existingUrl.mediaId}` : ''));
      
    if (urlStr && urlStr.includes('localhost')) {
      const baseUrl = import.meta.env.VITE_SOCKET_URL || 'https://api-dev.shineupapp.tech';
      urlStr = urlStr.replace(/^https?:\/\/localhost(:\d+)?/, baseUrl);
    }
      
    const isImage = name === 'logoFile' || name === 'coverFile' || (urlStr && urlStr.match(/\.(jpeg|jpg|gif|png|webp)$/i));

    const handleDownload = async (e, path) => {
      e.preventDefault();
      if (!path) {
        const dbg = typeof existingUrl === 'object' ? JSON.stringify(existingUrl) : String(existingUrl);
        toast.error(`بيانات الملف: ${dbg.substring(0, 100)}`, { duration: 6000 });
        return;
      }
      
      if (path.startsWith('http')) {
        window.open(path, '_blank');
        return;
      }

      try {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const res = await providerAxiosClient.get(cleanPath, { responseType: 'blob' });
        
        // Ensure we pass the correct content type to the blob
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Open in new tab
        window.open(url, '_blank');
        
        // Note: we don't revoke immediately so the new tab can load it
      } catch (err) {
        console.error('Download error:', err);
        const status = err?.response?.status || '';
        
        // Fallback: if Axios fails (e.g. 404 or CORS), try to just open the URL directly in the browser
        // as the backend might be serving it statically without the /api/v1 prefix.
        const baseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || '/api';
        const cleanBase = baseUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '');
        const fallbackUrl = `${cleanBase}${path.startsWith('/') ? path : `/${path}`}`;
        
        if (status === 404) {
          toast.error('عذراً، لم يتم العثور على الملف في الخادم. قد يكون محمي أو تم حذفه.');
        } else {
          toast.error(getApiErrorMessage(err, `خطأ أثناء فتح الملف`));
        }
        
        // Try fallback anyway
        window.open(fallbackUrl, '_blank');
      }
    };

    return (
      <div className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col items-center justify-center relative group min-h-[120px]">
        {isImage ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 border border-gray-100 bg-gray-50 flex items-center justify-center">
            {fetchedImgSrc ? (
              <img src={fetchedImgSrc} alt={label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-100">
                <FileImage className="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>
        ) : (
          <FileText className="w-8 h-8 text-emerald-600 mb-2" />
        )}
        
        <p className="text-xs font-medium text-gray-700 truncate w-full text-center mb-1" dir="ltr" title={typeof existingUrl === 'object' && (existingUrl?.originalName || existingUrl?.fileName) ? (existingUrl?.originalName || existingUrl?.fileName) : ''}>
          {typeof existingUrl === 'object' && (existingUrl?.originalName || existingUrl?.fileName) 
            ? (existingUrl?.originalName || existingUrl?.fileName)
            : (name === 'verificationDocument' ? 'مستند التوثيق' : 'ملف محفوظ')}
        </p>
        <p className="text-[10px] text-emerald-600 mb-2 font-medium">تم الحفظ بنجاح</p>
        
        <div className="flex gap-2 w-full mt-auto">
          <button 
            type="button"
            onClick={(e) => handleDownload(e, urlStr)}
            className="flex-1 text-xs text-center py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md transition-colors"
          >
            عرض
          </button>
          {isEditMode && (
            <label className="flex-1 text-xs text-center py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md cursor-pointer transition-colors">
              تغيير
              <input type="file" {...register(name)} className="hidden" accept="image/*,.pdf" />
            </label>
          )}
        </div>
      </div>
    );
  }

  // State 3: Empty Default Upload UI
  if (!isEditMode) {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center text-center flex-1 min-h-[120px]">
          <p className="text-sm font-medium text-gray-500">لا يوجد {label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-colors relative cursor-pointer group flex-1 min-h-[120px]">
        <input 
          type="file" 
          {...register(name)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={name === 'verificationDocument' ? "application/pdf,image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp"}
        />
        <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:scale-110 transition-all">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        <p className="text-xs text-gray-500">اختر أو اسحب الملف هنا</p>
      </div>
    </div>
  );
}
