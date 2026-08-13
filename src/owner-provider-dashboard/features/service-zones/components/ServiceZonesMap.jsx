import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapEventsComponent({ isCreatingMode, onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (isCreatingMode && onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapController({ selectedZone }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedZone && selectedZone.latitude && selectedZone.longitude) {
      map.flyTo([selectedZone.latitude, selectedZone.longitude], 13, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedZone, map]);

  return null;
}

export default function ServiceZonesMap({ zones, isCreatingMode, newZoneLocation, onLocationSelect, selectedZone }) {
  const center = [24.71144, 46.67441]; // Riyadh

  return (
    <div className="w-full h-full min-h-[500px] z-0 relative rounded-xl overflow-hidden shadow-sm">
      <MapContainer 
        center={center} 
        zoom={10} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapEventsComponent isCreatingMode={isCreatingMode} onLocationSelect={onLocationSelect} />
        <MapController selectedZone={selectedZone} />
        
        {/* Render New Zone Marker and Circle in Creation Mode */}
        {isCreatingMode && newZoneLocation?.lat && (
          <>
            <Marker position={[newZoneLocation.lat, newZoneLocation.lng]} />
            <Circle 
              center={[newZoneLocation.lat, newZoneLocation.lng]} 
              radius={newZoneLocation.radiusKm * 1000} 
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
            />
          </>
        )}
        {zones && zones.map((zone) => {
          // Fallback safely if location data is missing
          if (!zone.latitude || !zone.longitude) return null;
          
          const isSelected = selectedZone?.id === zone.id;
          
          return (
            <Circle
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: isSelected ? '#3b82f6' : (zone.activeIs ? 'green' : 'gray'),
                weight: isSelected ? 3 : 2,
                fillColor: isSelected ? '#3b82f6' : (zone.activeIs ? 'green' : 'gray'),
                fillOpacity: isSelected ? 0.4 : 0.2
              }}
            >
              <Popup>
                <div className="text-right" dir="rtl">
                  <div className="font-bold text-gray-900 mb-1">{zone.label}</div>
                  <div className="text-xs text-gray-600">{zone.city} {zone.area ? `- ${zone.area}` : ''}</div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
