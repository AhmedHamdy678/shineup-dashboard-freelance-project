import { MapPin, Navigation, Info, Building2, MapPinned } from "lucide-react";

export default function LocationCard({ location }) {
  if (!location) return null;

  const mapsUrl =
    location.latitude && location.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          الموقع الجغرافي
        </h3>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            فتح في خرائط جوجل
          </a>
        )}
      </div>

      {/* Location Details */}
      <div className="space-y-3">
        {/* Full Address */}
        {location.textAddress && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <MapPinned className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">العنوان الكامل</p>
              <p className="text-sm font-medium text-gray-900">{location.textAddress}</p>
            </div>
          </div>
        )}

        {/* City & Area */}
        {(location.area || location.city) && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Building2 className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">المنطقة والمدينة</p>
              <p className="text-sm font-medium text-gray-900">
                {[location.area, location.city].filter(Boolean).join("، ")}
              </p>
            </div>
          </div>
        )}

        {/* Customer Instructions */}
        {location.instructions && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-amber-600 font-semibold mb-0.5">تعليمات العميل</p>
              <p className="text-sm text-amber-900">{location.instructions}</p>
            </div>
          </div>
        )}

        {/* Coordinates badge */}
        {location.latitude && location.longitude && (
          <p className="text-xs text-gray-400 text-center pt-1">
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}
