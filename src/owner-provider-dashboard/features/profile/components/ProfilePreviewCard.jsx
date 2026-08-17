import React from 'react';
import { MapPin, User } from 'lucide-react';

export default function ProfilePreviewCard({ profile }) {
  if (!profile) return null;

  const {
    coverUrl,
    logoUrl,
    nameBusiness,
    nameBusinessEn,
    approvalStatus,
    address,
    description,
    descriptionEn,
    owner
  } = profile;

  const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('localhost')) {
      const baseUrl = import.meta.env.VITE_SOCKET_URL || 'https://api-dev.shineupapp.tech';
      return url.replace(/^https?:\/\/localhost(:\d+)?/, baseUrl);
    }
    return url;
  };

  const locationString = address 
    ? `${address.city || ''}، ${address.area || ''}`.replace(/^، | ،$/, '').trim() 
    : 'لم يتم تحديد الموقع';

  const isApproved = approvalStatus === 'APPROVED';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Cover Image */}
      <div className="h-32 w-full bg-gradient-to-r from-emerald-400 to-teal-500 relative">
          <img 
            src={sanitizeUrl(coverUrl)} 
            alt="Cover" 
            crossOrigin="anonymous"
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />

      </div>

      {/* Logo Image */}
      <div className="absolute top-20 left-4">
        <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm flex items-center justify-center">
          {logoUrl ? (
            <img 
              src={sanitizeUrl(logoUrl)} 
              alt="Logo" 
              crossOrigin="anonymous"
              className="w-full h-full object-cover" 
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDU5NjY5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRINWE0IDQgMCAwIDAtNCA0djIiPjwvcGF0aD48Y2lyY2xlIGN4PSI4LjUiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                e.target.className = 'w-10 h-10 object-contain text-emerald-600 opacity-50';
              }}
            />
          ) : (
            <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-col items-start">
            <h2 className="text-xl font-bold text-gray-900">{nameBusiness || 'الاسم التجاري'}</h2>
            {nameBusinessEn && (
              <h3 className="text-sm font-medium text-gray-500 mt-0.5 text-left" dir="ltr">{nameBusinessEn}</h3>
            )}
          </div>
          {approvalStatus && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isApproved ? 'مقبول' : approvalStatus}
            </span>
          )}
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 ml-1" />
          {locationString || 'لا يوجد موقع'}
        </div>

        <div className="flex flex-col items-center text-center gap-2 mt-4 w-full">
          <div className="text-gray-600 text-sm whitespace-pre-wrap">
            {description || 'لم يتم تقديم وصف.'}
          </div>
          {descriptionEn && (
            <div className="text-gray-600 text-sm whitespace-pre-wrap border-t border-gray-100 pt-3 mt-1 w-full" dir="ltr">
              {descriptionEn}
            </div>
          )}
        </div>

        <div className="w-full mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-500">المالك:</span>
          <span className="text-sm font-bold text-gray-900">{owner?.fullName || "غير محدد"}</span>
        </div>
      </div>
    </div>
  );
}
