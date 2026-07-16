import { MapPin, Info, Map as MapIcon } from "lucide-react";

export default function LocationCard({ location }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-gray-400" />
        الموقع الجغرافي
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">العنوان</p>
            <p className="text-gray-900 font-medium">{location?.textAddress}</p>
            <p className="text-gray-500 text-sm mt-1">{location?.area}، {location?.city}</p>
          </div>
          
          {location?.instructions && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">تعليمات إضافية</p>
                <p className="text-sm text-blue-800">{location?.instructions}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-48 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
          <MapIcon className="w-10 h-10 mb-2 opacity-50" />
          <span className="text-sm font-medium">عرض الخريطة (قريباً)</span>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
      </div>
    </div>
  );
}
