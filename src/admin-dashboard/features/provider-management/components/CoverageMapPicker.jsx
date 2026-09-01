import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultCenter = [24.7136, 46.6753];

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ disabled, onChange }) {
  useMapEvents({
    click: (event) => {
      if (!disabled) onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapViewport({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 12));
  }, [map, position]);
  return null;
}

/** Map picker used by the admin coverage editor; clicking the map updates coordinates. */
export default function CoverageMapPicker({
  latitude,
  longitude,
  radiusMeters,
  disabled = false,
  onChange,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radius = Number(radiusMeters);
  const hasPosition = Number.isFinite(lat) && Number.isFinite(lng);
  const position = hasPosition ? [lat, lng] : defaultCenter;

  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <MapContainer
        center={position}
        zoom={hasPosition ? 13 : 10}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapClickHandler disabled={disabled} onChange={onChange} />
        <MapViewport position={position} />
        {hasPosition && (
          <>
            <Marker position={position} />
            <Circle
              center={position}
              radius={Number.isFinite(radius) && radius > 0 ? radius : 0}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
