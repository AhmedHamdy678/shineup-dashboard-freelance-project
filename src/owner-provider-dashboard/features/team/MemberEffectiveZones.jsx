import React, { useState, useEffect } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import providerAxiosClient from '../../api/providerAxiosClient';
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';

// Component to handle bounds
function MapBoundsController({ zones }) {
  const map = useMap();
  useEffect(() => {
    if (zones && zones.length > 0) {
      const validZones = zones.filter(z => z.latitude && z.longitude);
      if (validZones.length > 0) {
        const bounds = L.latLngBounds(
          validZones.map(z => [z.latitude, z.longitude])
        );
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }
  }, [zones, map]);
  return null;
}

export default function MemberEffectiveZones({ memberId }) {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const response = await providerAxiosClient.get(`/providers/me/members/${memberId}/effective-service-zones`);
        
        let fetchedZones = [];
        const resData = response.data;
        

        if (Array.isArray(resData)) {
          fetchedZones = resData;
        } else if (resData && Array.isArray(resData.zones)) {
          fetchedZones = resData.zones;
        } else if (resData && Array.isArray(resData.items)) {
          fetchedZones = resData.items;
        } else if (resData && Array.isArray(resData.data)) {
          fetchedZones = resData.data;
        } else if (resData && Array.isArray(resData.item)) {
          fetchedZones = resData.item;
        }
        
        setZones(fetchedZones);
      } catch (err) {
        console.error('Failed to fetch effective service zones:', err);
        setError(getApiErrorMessage(err, 'حدث خطأ أثناء جلب مناطق التغطية الخاصة بالموظف.'));
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchZones();
    }
  }, [memberId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-48 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
          <div className="bg-gray-100 rounded-xl h-full"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-50 rounded-lg"></div>
            <div className="h-16 bg-gray-50 rounded-lg"></div>
            <div className="h-16 bg-gray-50 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  const center = [24.71144, 46.67441]; // Fallback to Riyadh

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <MapIcon className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-lg">النطاق الجغرافي للموظف</h3>
      </div>

      {zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-center">
          <MapPin className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">لم يتم تعيين هذا الموظف في أي منطقة تغطية حتى الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mini Map */}
          <div className="lg:col-span-2 h-[300px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 z-0 relative">
            <MapContainer 
              center={center} 
              zoom={10} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <MapBoundsController zones={zones} />
              
              {zones.map((zone) => {
                if (!zone.latitude || !zone.longitude) return null;
                return (
                  <Circle
                    key={zone.id}
                    center={[zone.latitude, zone.longitude]}
                    radius={zone.radiusMeters}
                    pathOptions={{
                      color: 'green',
                      fillColor: 'green',
                      fillOpacity: 0.2
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>

          {/* Zones List */}
          <div className="lg:col-span-3 h-[300px] overflow-y-auto pr-2 space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{zone.label}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {zone.city} {zone.area ? `- ${zone.area}` : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium bg-white px-2 py-1 rounded text-gray-600 border border-gray-100 shadow-sm">
                      النطاق: {zone.radiusMeters ? (zone.radiusMeters / 1000).toFixed(1) : 0} كم
                    </span>
                    {zone.activeIs !== undefined && (
                      <span className={`text-[10px] font-medium px-2 py-1 rounded shadow-sm ${zone.activeIs ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {zone.activeIs ? 'منطقة نشطة' : 'منطقة غير نشطة'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
