"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createStateIcon = (stateCode, count) => {
  return L.divIcon({
    html: `<div style="background-color: #296167; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 600; font-family: Manrope, sans-serif; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); line-height: 1.1; cursor: pointer;">
      <span style="font-size: 14px; letter-spacing: 0.5px;">${stateCode}</span>
      <span style="font-size: 10px; opacity: 0.85;">${count} salons</span>
    </div>`,
    className: 'custom-state-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

function MapContent({ salons, center, onSelectSalon }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    }
  });

  useEffect(() => {
    if (center) {
      map.setView(center, 11, { animate: true });
    }
  }, [center, map]);

  // Group by state
  const stateGroups = {};
  salons.forEach((salon) => {
    const parts = salon.city.split(", ");
    const stateCode = parts.length > 1 ? parts[1] : salon.city;
    
    if (!stateGroups[stateCode]) {
      stateGroups[stateCode] = { state: stateCode, count: 0, lat: 0, lng: 0 };
    }
    stateGroups[stateCode].count += 1;
    stateGroups[stateCode].lat += salon.lat;
    stateGroups[stateCode].lng += salon.lng;
  });

  const clusters = Object.values(stateGroups).map(g => ({
    state: g.state,
    count: g.count,
    lat: g.lat / g.count,
    lng: g.lng / g.count
  }));

  // If zoomed out, show state clusters
  if (zoom < 7) {
    return clusters.map(cluster => (
      <Marker
        key={cluster.state}
        position={[cluster.lat, cluster.lng]}
        icon={createStateIcon(cluster.state, cluster.count)}
        eventHandlers={{
          click: () => {
            map.setView([cluster.lat, cluster.lng], 9, { animate: true });
          }
        }}
      />
    ));
  }

  // If zoomed in, show individual salons
  return salons.map((salon) => (
    <Marker
      key={salon.name}
      position={[salon.lat, salon.lng]}
      eventHandlers={{
        click: () => {
          onSelectSalon(salon);
          // Optional: slightly zoom in when clicking a specific salon marker
          map.setView([salon.lat, salon.lng], 13, { animate: true });
        },
      }}
    >
      <Popup>
        <div style={{ fontFamily: "Manrope, sans-serif" }}>
          <strong style={{ color: "#2A2420", fontSize: "14px" }}>{salon.name}</strong><br/>
          <span style={{ color: "#3B3632", fontSize: "12px" }}>{salon.city}</span><br/>
          <span style={{ color: "#296167", fontSize: "12px", fontWeight: "600" }}>Fit Score: {salon.fit_score}</span>
        </div>
      </Popup>
    </Marker>
  ));
}

export default function Map({ salons, center, onSelectSalon, selectedSalon }) {
  const defaultCenter = center || [39.8283, -98.5795]; // US Center
  const initialZoom = center ? 11 : 4;

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}>
      <MapContainer center={defaultCenter} zoom={initialZoom} style={{ height: "100%", width: "100%", borderRadius: "16px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapContent salons={salons} center={center} onSelectSalon={onSelectSalon} />
      </MapContainer>
    </div>
  );
}
