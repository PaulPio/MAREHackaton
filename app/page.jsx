"use client";
import { useState, useEffect } from "react";

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

const SCORE_BREAKDOWN = {
  revenue_tier: 30,
  luxury_signal: 25,
  aesthetic_fit: 20,
  location_match: 15,
  expansion_readiness: 10,
};

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

const DetailPanel = ({ salon }) => {
  const [emailVisible, setEmailVisible] = useState(false);

  if (!salon) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: COLORS.water50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.water300} strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <p style={{ fontSize: "13px", color: COLORS.brown200, fontFamily: "Manrope, sans-serif" }}>Select a salon to view details</p>
    </div>
  );

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
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

      <div style={{ display: "flex", gap: "8px" }}>
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
  );
};

export default function MaReSignal() {
  const [salons, setSalons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("fit_score");

  const detectLocation = () => {
    setStatus("locating");
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setStatus("idle");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        fetchSalons(coords);
      },
      () => {
        setError("Location permission denied. Using Miami as default.");
        const miami = { lat: 25.7617, lng: -80.1918 };
        setLocation(miami);
        fetchSalons(miami);
      }
    );
  };

  const fetchSalons = async (coords) => {
    setStatus("loading");
    setSalons([]);
    setSelected(null);

    try {
      // For the offline hackathon demo, we load the pre-baked salons.json data.
      // In a real environment, you would fetch from an API or import directly.
      const res = await fetch("/salons.json"); // Assuming salons.json is in public folder or available at this route
      
      // Fallback to static mock if fetch fails (e.g. running locally without server)
      let parsed;
      if (res.ok) {
        parsed = await res.json();
      } else {
        // Fallback mock data if fetch fails
        parsed = [];
      }
      
      // Simulate processing time
      setTimeout(() => {
        if (parsed.length > 0) {
          setSalons(parsed);
          setSelected(parsed[0]);
          setStatus("done");
        } else {
          setError("Please ensure salons.json is available to load the pre-baked data.");
          setStatus("idle");
        }
      }, 1500);

    } catch (e) {
      setError("Could not load salon data. Please try again.");
      setStatus("idle");
    }
  };

  const sorted = [...salons].sort((a, b) => {
    if (sortBy === "fit_score") return b.fit_score - a.fit_score;
    if (sortBy === "revenue") return (b.revenue_tier > a.revenue_tier ? 1 : -1);
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{
      fontFamily: "Manrope, sans-serif",
      background: COLORS.white,
      minHeight: "600px",
      border: `0.5px solid ${COLORS.light}`,
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        background: COLORS.extraDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
      }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: COLORS.white, letterSpacing: "-0.01em" }}>
            MaRe <span style={{ color: COLORS.water300 }}>Signal</span>
          </div>
          <div style={{ fontSize: "11px", color: COLORS.brown200, marginTop: "2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Luxury Salon Prospector
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {status === "done" && (
            <span style={{ fontSize: "11px", color: COLORS.water300, background: "rgba(41,97,103,0.2)", padding: "4px 10px", borderRadius: "20px" }}>
              {salons.length} salons found
            </span>
          )}
          <button
            onClick={detectLocation}
            disabled={status === "loading" || status === "locating"}
            style={{
              padding: "8px 16px",
              background: status === "done" ? "transparent" : COLORS.key,
              color: status === "done" ? COLORS.water300 : COLORS.white,
              border: `1px solid ${COLORS.key}`,
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              fontFamily: "Manrope, sans-serif",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              opacity: status === "loading" || status === "locating" ? 0.6 : 1,
            }}
          >
            {status === "locating" ? "Locating..." : status === "loading" ? "Searching..." : status === "done" ? "Refresh" : "Find Nearby Salons"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "10px 24px", background: "#FFF3E0", fontSize: "12px", color: "#8B4513", fontFamily: "Manrope, sans-serif" }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {(status === "loading" || status === "locating") && (
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            border: `2px solid ${COLORS.light}`,
            borderTop: `2px solid ${COLORS.key}`,
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: COLORS.dark, fontSize: "13px", fontFamily: "Manrope, sans-serif" }}>
            {status === "locating" ? "Detecting your location..." : "Searching for luxury salons near you..."}
          </p>
          <p style={{ color: COLORS.brown200, fontSize: "11px", fontFamily: "Manrope, sans-serif", marginTop: "4px" }}>
            Scoring against MaRe's luxury criteria
          </p>
        </div>
      )}

      {/* Idle State */}
      {status === "idle" && (
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: COLORS.water50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.key} strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: COLORS.extraDark, marginBottom: "8px" }}>
            Discover qualified partners near you
          </p>
          <p style={{ fontSize: "13px", color: COLORS.dark, fontFamily: "Manrope, sans-serif", maxWidth: "320px", margin: "0 auto 24px", lineHeight: "1.6" }}>
            MaRe Signal uses your location to surface luxury salons that match MaRe's partner criteria — scored, enriched, and ready for outreach.
          </p>
          <button onClick={detectLocation} style={{
            padding: "12px 28px",
            background: COLORS.key, color: COLORS.white,
            border: "none", borderRadius: "8px",
            fontSize: "13px", fontWeight: "600",
            fontFamily: "Manrope, sans-serif",
            cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            Use My Location
          </button>
        </div>
      )}

      {/* Main Layout */}
      {status === "done" && salons.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "520px" }}>
          {/* Salon List */}
          <div style={{ borderRight: `0.5px solid ${COLORS.light}`, overflowY: "auto" }}>
            <div style={{
              padding: "10px 16px",
              borderBottom: `0.5px solid ${COLORS.light}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: COLORS.white,
              position: "sticky", top: 0, zIndex: 1,
            }}>
              <span style={{ fontSize: "10px", color: COLORS.water300, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  fontSize: "11px", color: COLORS.dark,
                  border: "none", background: "transparent",
                  fontFamily: "Manrope, sans-serif", cursor: "pointer",
                }}
              >
                <option value="fit_score">Fit Score</option>
                <option value="revenue">Revenue</option>
                <option value="name">Name</option>
              </select>
            </div>
            {sorted.map((salon, i) => (
              <SalonCard
                key={i}
                salon={salon}
                selected={selected?.name === salon.name}
                onClick={() => setSelected(salon)}
              />
            ))}
          </div>

          {/* Detail Panel */}
          <div style={{ overflow: "hidden" }}>
            <DetailPanel salon={selected} />
          </div>
        </div>
      )}
    </div>
  );
}

