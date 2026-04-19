"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to dynamically change map center
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function Map({ salons, center, onSelectSalon, selectedSalon }) {
  const defaultCenter = center || [39.8283, -98.5795]; // US Center
  const zoom = center ? 11 : 4;

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}>
      <MapContainer center={defaultCenter} zoom={zoom} style={{ height: "100%", width: "100%", borderRadius: "16px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={defaultCenter} />
        {salons.map((salon) => {
          // Custom marker for selected vs unselected could be done here
          return (
            <Marker
              key={salon.name}
              position={[salon.lat, salon.lng]}
              eventHandlers={{
                click: () => onSelectSalon(salon),
              }}
            >
              <Popup>
                <div style={{ fontFamily: "Manrope, sans-serif" }}>
                  <strong>{salon.name}</strong><br/>
                  {salon.city}<br/>
                  Fit Score: {salon.fit_score}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
