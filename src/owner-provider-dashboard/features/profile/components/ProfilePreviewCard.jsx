import React from 'react';
import { MapPin, User } from 'lucide-react';

export default function ProfilePreviewCard({ profile }) {
  if (!profile) return null;

  const {
    coverUrl,
    logoUrl,
    nameBusiness,
    fullName,
    approvalStatus,
    address,
    description
  } = profile;

  const locationString = address 
    ? `${address.city || ''}, ${address.area || ''}`.replace(/^, | ,$/, '').trim() 
    : 'Location not provided';

  const isApproved = approvalStatus === 'APPROVED';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Cover Image */}
      <div className="h-32 w-full bg-gradient-to-r from-emerald-400 to-teal-500 relative">
          <img 
            src={coverUrl} 
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
              src={logoUrl} 
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
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-gray-900">{nameBusiness || 'Business Name'}</h2>
          {approvalStatus && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isApproved ? 'Approved' : approvalStatus}
            </span>
          )}
        </div>
        {fullName && (
          <div className="text-sm text-gray-500 mb-2">
            Owner: {fullName}
          </div>
        )}

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {locationString || 'No location'}
        </div>

        <div className="text-gray-600 text-sm whitespace-pre-wrap">
          {description || 'No description provided.'}
        </div>
      </div>
    </div>
  );
}
