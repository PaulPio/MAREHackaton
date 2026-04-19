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

const createStateIcon = (count) => {
  let numIcons = 1;
  if (count >= 2 && count <= 3) numIcons = 2;
  if (count >= 4) numIcons = 3;

  const svgStr = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l10 8h-2v11H4V10H2L12 2z"/>
    <rect x="7" y="12" width="4" height="4" fill="white"/>
    <rect x="13" y="14" width="3" height="5" fill="white"/>
  </svg>`;

  const iconsHtml = svgStr.repeat(numIcons);

  return L.divIcon({
    html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translateY(-10px);">
      <div style="background: #7C9FA3; padding: 6px; border-radius: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: all 0.2s ease;">
        <div style="background: white; padding: 6px 10px; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 4px; color: #296167; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
           ${iconsHtml}
        </div>
      </div>
      <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid #7C9FA3; margin-top: -1px;"></div>
    </div>`,
    className: 'custom-state-icon',
    iconSize: [80, 50],
    iconAnchor: [40, 40]
  });
};

function MapContent({ salons, center, onSelectSalon, selectedSalon }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [prevSelected, setPrevSelected] = useState(selectedSalon);
  const defaultCenter = [39.8283, -98.5795];

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    }
  });

  // Handle zooming when a location is picked from search
  useEffect(() => {
    if (center) {
      // Use flyTo for smooth parabolic animation
      map.flyTo(center, 11, { duration: 1.5, easeLinearity: 0.25 });
    } else {
      // If user cleared the search (center became null), fly to USA map
      map.flyTo(defaultCenter, 4, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, map]);

  // Handle zoom out when unselecting a salon (clicking "Back")
  useEffect(() => {
    if (prevSelected && !selectedSalon) {
      // If they had a center selected (like Miami), fly to that city's zoom (11)
      // Otherwise, fly to the USA zoom (4)
      map.flyTo(center || defaultCenter, center ? 11 : 4, { duration: 1.5, easeLinearity: 0.25 });
    }
    setPrevSelected(selectedSalon);
  }, [selectedSalon, prevSelected, center, map]);

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

  // If zoomed out, show state clusters with house icons based on density
  if (zoom < 7) {
    return clusters.map(cluster => (
      <Marker
        key={cluster.state}
        position={[cluster.lat, cluster.lng]}
        icon={createStateIcon(cluster.count)}
        eventHandlers={{
          click: () => {
            // Smoothly fly into the state cluster
            map.flyTo([cluster.lat, cluster.lng], 10, { duration: 1.5, easeLinearity: 0.25 });
          }
        }}
      />
    ));
  }

  // If zoomed in, show individual salons
  return salons.map((salon, i) => (
    <Marker
      key={salon.name + i}
      position={[salon.lat, salon.lng]}
      eventHandlers={{
        click: () => {
          onSelectSalon(salon);
          // Smoothly fly to the exact salon location
          map.flyTo([salon.lat, salon.lng], 15, { duration: 1.5, easeLinearity: 0.25 });
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
        <MapContent salons={salons} center={center} onSelectSalon={onSelectSalon} selectedSalon={selectedSalon} />
      </MapContainer>
    </div>
  );
}
