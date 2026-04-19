"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, List as ListIcon, Info, ChevronLeft, Crosshair } from "lucide-react";

// Dynamically import Map to prevent SSR errors with Leaflet
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E4ECED] flex items-center justify-center text-[#7C9FA3]">
      Loading map...
    </div>
  ),
});

const COLORS = {
  light: "#E2E2DE",
  key: "#296167",
  darkKey: "#214E52",
  brown: "#653D24",
  extraDark: "#2A2420",
  dark: "#3B3632",
  white: "#FFFFFF",
  water50: "#E4ECED",
  water300: "#7C9FA3",
  brown200: "#C1B1A7",
  brown100: "#E0D8D3",
};

const SUGGESTED_LOCATIONS = [
  { name: "New York, NY", lat: 40.7128, lng: -74.0060 },
  { name: "Miami, FL", lat: 25.7617, lng: -80.1918 },
  { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
];

const SCORE_BREAKDOWN = {
  revenue_tier: 30,
  luxury_signal: 25,
  aesthetic_fit: 20,
  location_match: 15,
  expansion_readiness: 10,
};

// Haversine formula to calculate distance in miles
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ScoreRing = ({ score }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? COLORS.key : score >= 60 ? COLORS.brown : COLORS.brown200;
  return (
    <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="30" cy="30" r={r} fill="none" stroke={COLORS.light} strokeWidth="4" />
      <circle
        cx="30" cy="30" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x="30" y="34"
        textAnchor="middle"
        style={{
          transform: "rotate(90deg) translate(0, -60px)",
          fontSize: "13px",
          fontWeight: "600",
          fill: COLORS.extraDark,
          fontFamily: "Manrope, sans-serif",
        }}
      >
        {score}
      </text>
    </svg>
  );
};

const ScoreBar = ({ label, value, max }) => (
  <div style={{ marginBottom: "8px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
      <span style={{ fontSize: "11px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", textTransform: "capitalize" }}>
        {label.replace(/_/g, " ")}
      </span>
      <span style={{ fontSize: "11px", fontWeight: "600", color: COLORS.key, fontFamily: "Manrope, sans-serif" }}>
        {value}/{max}
      </span>
    </div>
    <div style={{ height: "3px", background: COLORS.light, borderRadius: "2px" }}>
      <div style={{
        height: "100%",
        width: `${(value / max) * 100}%`,
        background: `linear-gradient(90deg, ${COLORS.key}, ${COLORS.water300})`,
        borderRadius: "2px",
        transition: "width 0.6s ease",
      }} />
    </div>
  </div>
);

const AestheticBadge = ({ tag }) => {
  const map = {
    "modern-minimal": { bg: "#E4ECED", color: COLORS.darkKey },
    "classic-luxe": { bg: "#E0D8D3", color: COLORS.dark },
    "organic-wellness": { bg: "#d6e8d6", color: "#2d5a2d" },
    "clinical-medical": { bg: "#dde4f0", color: "#2d3d6b" },
  };
  const style = map[tag] || { bg: COLORS.light, color: COLORS.dark };
  return (
    <span style={{
      fontSize: "10px",
      padding: "3px 8px",
      borderRadius: "20px",
      background: style.bg,
      color: style.color,
      fontFamily: "Manrope, sans-serif",
      fontWeight: "600",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      display: "inline-block"
    }}>
      {tag}
    </span>
  );
};

const SalonCard = ({ salon, selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "16px",
      borderBottom: `0.5px solid ${COLORS.light}`,
      cursor: "pointer",
      background: selected ? COLORS.water50 : COLORS.white,
      borderLeft: selected ? `3px solid ${COLORS.key}` : "3px solid transparent",
      transition: "all 0.2s ease",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "14px",
          fontWeight: "600",
          color: COLORS.extraDark,
          marginBottom: "2px",
          lineHeight: "1.3",
        }}>
          {salon.name}
        </div>
        <div style={{ fontSize: "12px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", marginBottom: "6px" }}>
          {salon.city} · {salon.business_type.replace(/_/g, " ")}
        </div>
        <AestheticBadge tag={salon.aesthetic_tag} />
      </div>
      <div style={{ marginLeft: "12px", flexShrink: 0 }}>
        <ScoreRing score={salon.fit_score} />
      </div>
    </div>
    <div style={{ marginTop: "8px", fontSize: "11px", color: COLORS.brown, fontFamily: "Manrope, sans-serif", fontStyle: "italic", lineHeight: "1.4" }}>
      {salon.hook}
    </div>
  </div>
);

const DetailPanel = ({ salon, onBack }) => {
  const [emailVisible, setEmailVisible] = useState(false);

  if (!salon) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: COLORS.water50 }}>
        <Info color={COLORS.water300} size={20} />
      </div>
      <p style={{ fontSize: "13px", color: COLORS.brown200, fontFamily: "Manrope, sans-serif" }}>Select a salon to view details</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile back button */}
      <div className="md:hidden p-4 border-b flex items-center gap-2" style={{ borderColor: COLORS.light }}>
        <button onClick={onBack} className="flex items-center text-sm font-medium" style={{ color: COLORS.key, fontFamily: "Manrope, sans-serif" }}>
          <ChevronLeft size={16} /> Back to list
        </button>
      </div>

      <div style={{ padding: "24px", overflowY: "auto", flex: 1, boxSizing: "border-box" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            color: COLORS.extraDark,
            marginBottom: "4px",
            lineHeight: "1.2",
          }}>
            {salon.name}
          </div>
          <div style={{ fontSize: "13px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", marginBottom: "10px" }}>
            {salon.city} · {salon.revenue_tier} revenue · {salon.location_count} location{salon.location_count > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <AestheticBadge tag={salon.aesthetic_tag} />
            <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: "#E0D8D3", color: COLORS.dark, fontFamily: "Manrope, sans-serif", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {salon.business_type.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Fit Score", value: `${salon.fit_score}/100` },
            { label: "Est. Weekly Clients", value: salon.estimated_weekly_clients || "—" },
            { label: "Retail Uplift", value: salon.projected_retail_uplift_usd ? `$${salon.projected_retail_uplift_usd.toLocaleString()}/mo` : "—" },
            { label: "Revenue Tier", value: salon.revenue_tier },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: COLORS.water50, borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontSize: "10px", color: COLORS.water300, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: COLORS.extraDark, fontFamily: "Manrope, sans-serif" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: COLORS.water300, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Fit Score Breakdown</div>
          {salon.score_breakdown && Object.entries(SCORE_BREAKDOWN).map(([key, max]) => (
            <ScoreBar key={key} label={key} value={salon.score_breakdown[key] || 0} max={max} />
          ))}
        </div>

        <div style={{ marginBottom: "20px", padding: "14px", background: COLORS.brown100, borderRadius: "10px", borderLeft: `3px solid ${COLORS.brown}` }}>
          <div style={{ fontSize: "10px", color: COLORS.brown, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Signal</div>
          <p style={{ fontSize: "13px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", lineHeight: "1.5", margin: 0, fontStyle: "italic" }}>
            "{salon.hook}"
          </p>
        </div>

        {salon.testimonial_angle && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", color: COLORS.water300, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Outreach Angle</div>
            <p style={{ fontSize: "13px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", lineHeight: "1.5", margin: 0 }}>
              {salon.testimonial_angle}
            </p>
          </div>
        )}

        {salon.outreach_email && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setEmailVisible(!emailVisible)}
              style={{
                width: "100%", padding: "10px 16px",
                background: emailVisible ? COLORS.key : "transparent",
                color: emailVisible ? COLORS.white : COLORS.key,
                border: `1px solid ${COLORS.key}`,
                borderRadius: "8px",
                fontFamily: "Manrope, sans-serif",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}
            >
              {emailVisible ? "Hide Draft Email" : "View Draft Email"}
            </button>
            {emailVisible && (
              <div style={{
                marginTop: "10px", padding: "16px",
                background: COLORS.white, border: `0.5px solid ${COLORS.light}`,
                borderRadius: "10px",
              }}>
                <div style={{ fontSize: "10px", color: COLORS.brown200, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Draft · Pending Approval</div>
                <p style={{ fontSize: "13px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap" }}>
                  {salon.outreach_email}
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", paddingBottom: "20px" }}>
          {salon.website && (
            <a href={salon.website} target="_blank" rel="noreferrer" style={{
              flex: 1, padding: "10px",
              background: COLORS.key, color: COLORS.white,
              borderRadius: "8px", textAlign: "center",
              fontFamily: "Manrope, sans-serif", fontSize: "12px", fontWeight: "600",
              textDecoration: "none", letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Visit Site
            </a>
          )}
          {salon.instagram && (
            <a href={`https://instagram.com/${salon.instagram.replace("@","")}`} target="_blank" rel="noreferrer" style={{
              flex: 1, padding: "10px",
              background: "transparent", color: COLORS.key,
              border: `1px solid ${COLORS.key}`,
              borderRadius: "8px", textAlign: "center",
              fontFamily: "Manrope, sans-serif", fontSize: "12px", fontWeight: "600",
              textDecoration: "none", letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MaReSignal() {
  const [allSalons, setAllSalons] = useState([]);
  const [displayedSalons, setDisplayedSalons] = useState([]);
  const [selected, setSelected] = useState(null);
  
  const [status, setStatus] = useState("loading"); // idle, loading, done
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("fit_score");
  
  // Mobile responsive views: 'list' | 'map' | 'detail'
  const [mobileView, setMobileView] = useState("list");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load static data on mount
  useEffect(() => {
    fetch("/salons.json")
      .then(res => res.json())
      .then(data => {
        setAllSalons(data);
        setDisplayedSalons(data);
        setStatus("done");
      })
      .catch(err => {
        setError("Failed to load salon data.");
        setStatus("idle");
      });
  }, []);

  // Filter salons when location changes
  useEffect(() => {
    if (location && allSalons.length > 0) {
      // Filter salons within ~100 miles
      const filtered = allSalons.filter(s => {
        if (!s.lat || !s.lng) return true; // keep if no coords
        const dist = getDistance(location.lat, location.lng, s.lat, s.lng);
        return dist <= 100;
      });
      setDisplayedSalons(filtered);
    } else {
      setDisplayedSalons(allSalons);
    }
  }, [location, allSalons]);

  const handleSelectSalon = (salon) => {
    setSelected(salon);
    if (window.innerWidth < 768) {
      setMobileView("detail");
    }
  };

  const detectLocation = () => {
    setStatus("loading");
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setStatus("done");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setSearchQuery("Current Location");
        setStatus("done");
        if (window.innerWidth < 768) setMobileView("map");
      },
      () => {
        setError("Location permission denied. Showing all salons.");
        setLocation(null);
        setStatus("done");
      }
    );
  };

  const selectSuggestion = (loc) => {
    setLocation({ lat: loc.lat, lng: loc.lng });
    setSearchQuery(loc.name);
    setShowSuggestions(false);
    setSelected(null);
    if (window.innerWidth < 768) setMobileView("map");
  };

  const clearLocation = () => {
    setLocation(null);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const sorted = [...displayedSalons].sort((a, b) => {
    if (sortBy === "fit_score") return b.fit_score - a.fit_score;
    if (sortBy === "revenue") return (b.revenue_tier > a.revenue_tier ? 1 : -1);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#F5F1EA] font-sans" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 shadow-sm shrink-0 gap-4" style={{ background: COLORS.extraDark, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: COLORS.white, letterSpacing: "-0.01em" }}>
            MaRe <span style={{ color: COLORS.water300 }}>Signal</span>
          </div>
          <div style={{ fontSize: "11px", color: COLORS.brown200, marginTop: "2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Luxury Salon Prospector
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="flex items-center bg-white rounded-lg px-3 py-2">
            <Search size={16} color={COLORS.dark} />
            <input
              type="text"
              placeholder="Search hotspots (e.g. Miami, New York)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 ml-2 text-sm outline-none text-[#1A1A1A] bg-transparent"
            />
            {searchQuery && (
              <button onClick={clearLocation} className="text-xs text-[#7C9FA3] hover:text-[#296167]">Clear</button>
            )}
          </div>
          
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-[#E2E2DE] z-50 overflow-hidden">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#7C9FA3] bg-[#E4ECED]">
                High-Revenue Hotspots
              </div>
              {SUGGESTED_LOCATIONS.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase())).map(loc => (
                <div
                  key={loc.name}
                  onClick={() => selectSuggestion(loc)}
                  className="px-4 py-3 text-sm text-[#1A1A1A] hover:bg-[#F5F1EA] cursor-pointer border-b border-[#E2E2DE] last:border-0"
                >
                  {loc.name}
                </div>
              ))}
              <div 
                onClick={detectLocation}
                className="px-4 py-3 text-sm text-[#296167] font-semibold hover:bg-[#F5F1EA] cursor-pointer flex items-center gap-2 bg-[#E4ECED]/30"
              >
                <Crosshair size={14} /> Use My Current Location
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Bar */}
      {error && (
        <div className="p-2 text-xs text-center shrink-0" style={{ background: "#FFF3E0", color: "#8B4513" }}>
          {error}
        </div>
      )}

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b bg-white shrink-0" style={{ borderColor: COLORS.light }}>
        <button 
          onClick={() => setMobileView("list")}
          className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${mobileView === "list" ? "border-b-2" : "text-opacity-60"}`}
          style={{ borderColor: COLORS.key, color: mobileView === "list" ? COLORS.key : COLORS.dark }}
        >
          <ListIcon size={16} /> List
        </button>
        <button 
          onClick={() => setMobileView("map")}
          className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${mobileView === "map" ? "border-b-2" : "text-opacity-60"}`}
          style={{ borderColor: COLORS.key, color: mobileView === "map" ? COLORS.key : COLORS.dark }}
        >
          <MapPin size={16} /> Map
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column: List OR Detail (Mobile handles visibility via state, Desktop shows List and conditionally Detail if modal is preferred, but let's stick to List vs Detail in the left panel) */}
        <div className={`w-full md:w-[350px] lg:w-[400px] flex-col bg-white border-r border-[${COLORS.light}] shrink-0
          ${(mobileView === "list" || mobileView === "detail") ? "flex" : "hidden md:flex"}
        `}>
          
          {/* Active Panel Logic */}
          {(!selected || (window.innerWidth < 768 && mobileView === "list")) ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-3 border-b border-[#E2E2DE] shrink-0 bg-[#F5F1EA]/50">
                <span className="text-[10px] text-[#7C9FA3] uppercase tracking-wider">
                  {displayedSalons.length} results near {searchQuery || "you"}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-[11px] text-[#3B3632] bg-transparent outline-none cursor-pointer"
                >
                  <option value="fit_score">Sort: Fit Score</option>
                  <option value="revenue">Sort: Revenue</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sorted.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#7C9FA3]">No luxury salons found within 100 miles of this location.</div>
                ) : (
                  sorted.map((salon, i) => (
                    <SalonCard
                      key={i}
                      salon={salon}
                      selected={selected?.name === salon.name}
                      onClick={() => handleSelectSalon(salon)}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className={`h-full ${mobileView === "detail" ? "block" : "hidden md:block"}`}>
               {/* Desktop back to list button (optional since they can just click another card, but good for UX) */}
               <div className="hidden md:flex p-3 border-b items-center bg-[#F5F1EA]/50 cursor-pointer hover:bg-[#E2E2DE]" onClick={() => setSelected(null)}>
                 <ChevronLeft size={16} color={COLORS.key} /> 
                 <span className="text-sm font-semibold ml-1" style={{ color: COLORS.key }}>Back to List</span>
               </div>
               <div className="h-[calc(100%-45px)] md:h-[calc(100%-45px)] h-full overflow-hidden">
                 <DetailPanel salon={selected} onBack={() => { setSelected(null); setMobileView("list"); }} />
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div className={`flex-1 bg-[#E4ECED] relative ${mobileView === "map" ? "block" : "hidden md:block"}`}>
          {status === "done" && (
            <Map 
              salons={displayedSalons} 
              center={location} 
              selectedSalon={selected}
              onSelectSalon={handleSelectSalon} 
            />
          )}
        </div>

      </div>
    </div>
  );
}
