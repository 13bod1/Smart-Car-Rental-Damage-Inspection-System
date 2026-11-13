"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useRef, useCallback } from "react";

// Real POIs around Aswan, Egypt
const LOCATIONS = [
  // Gas Stations (Benzene)
  { id: 1, type: "gas", lat: 24.0889, lng: 32.8998, name: "Misr Petroleum - Corniche", emoji: "⛽", desc: "24/7 station on the Nile Corniche. Premium 95 & 92." },
  { id: 2, type: "gas", lat: 24.0935, lng: 32.9065, name: "TotalEnergies Aswan", emoji: "⛽", desc: "Full service with Bonjour convenience store." },
  { id: 3, type: "gas", lat: 24.0782, lng: 32.8870, name: "Co-Op Benzene Station", emoji: "⛽", desc: "Near Aswan Dam road. Diesel & petrol." },
  { id: 4, type: "gas", lat: 24.1010, lng: 32.9120, name: "Wataniya Gas", emoji: "⛽", desc: "Budget-friendly prices. Air & water free." },
  // Car Washes
  { id: 5, type: "wash", lat: 24.0920, lng: 32.9030, name: "Nile Shine Auto Wash", emoji: "🧽", desc: "Full detailing & ceramic coating available." },
  { id: 6, type: "wash", lat: 24.0850, lng: 32.8950, name: "Aswan Steam Wash", emoji: "🧽", desc: "Eco-friendly steam cleaning. Interior deep clean." },
  { id: 7, type: "wash", lat: 24.0970, lng: 32.9100, name: "QuickClean Express", emoji: "🧽", desc: "15-minute express wash while you wait." },
  // EV Charging
  { id: 8, type: "ev", lat: 24.0905, lng: 32.9010, name: "Revolta Charger - Sofitel", emoji: "⚡", desc: "Fast DC 50kW charger near Sofitel Hotel." },
  { id: 9, type: "ev", lat: 24.0960, lng: 32.9080, name: "Infinity EV Hub", emoji: "⚡", desc: "Type 2 AC + CCS2 DC charging." },
  // Mechanics & Tire Shops
  { id: 10, type: "mechanic", lat: 24.0830, lng: 32.8920, name: "Abu Ahmed Garage", emoji: "🔧", desc: "Trusted mechanic. AC repair & engine diagnostics." },
  { id: 11, type: "mechanic", lat: 24.0990, lng: 32.9050, name: "Aswan Tire Center", emoji: "🔧", desc: "Bridgestone & Michelin dealer. Alignment service." },
  { id: 12, type: "mechanic", lat: 24.0870, lng: 32.8990, name: "ProFix Auto Workshop", emoji: "🔧", desc: "AutoRent AI certified inspection partner." },
  // Parking
  { id: 13, type: "parking", lat: 24.0910, lng: 32.8985, name: "Corniche Public Parking", emoji: "🅿️", desc: "Shaded parking near the Nile. 10 EGP/hour." },
  { id: 14, type: "parking", lat: 24.0955, lng: 32.9040, name: "Aswan Souq Parking", emoji: "🅿️", desc: "Guarded lot next to the old market." },
  // Tourist Spots
  { id: 15, type: "tourist", lat: 24.0876, lng: 32.8844, name: "Philae Temple", emoji: "🏛️", desc: "Ancient temple of Isis. 15 min drive from city." },
  { id: 16, type: "tourist", lat: 24.0284, lng: 32.8780, name: "High Dam (السد العالي)", emoji: "🏛️", desc: "The iconic Aswan High Dam. Great for photos." },
  { id: 17, type: "tourist", lat: 24.0786, lng: 32.8853, name: "Unfinished Obelisk", emoji: "🏛️", desc: "Ancient granite quarry. UNESCO heritage site." },
  { id: 18, type: "tourist", lat: 24.0888, lng: 32.8970, name: "Nubian Village", emoji: "🏛️", desc: "Colorful village on Elephantine Island." },
];

// --- Types for search results ---
interface SearchResultPOI {
  kind: "poi";
  id: number;
  name: string;
  emoji: string;
  type: string;
  lat: number;
  lng: number;
}

interface SearchResultGeo {
  kind: "geo";
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string; // e.g. "city", "road", "amenity"
}

type SearchResult = SearchResultPOI | SearchResultGeo;

function createEmojiIcon(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 1.2rem;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      border: 2.5px solid white;
    ">${emoji}</div>`,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function createSearchPinIcon() {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #6366f1, #a855f7);
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      font-size: 1.3rem;
      box-shadow: 0 4px 18px rgba(99,102,241,0.5);
      border: 3px solid white;
      animation: searchPinBounce 0.5s ease-out;
    "><span style="transform: rotate(45deg);">📍</span></div>
    <style>
      @keyframes searchPinBounce {
        0% { transform: rotate(-45deg) scale(0) translateY(-20px); opacity: 0; }
        60% { transform: rotate(-45deg) scale(1.15); opacity: 1; }
        100% { transform: rotate(-45deg) scale(1); }
      }
    </style>`,
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 42],
  });
}

const getTypeStyle = (type: string) => {
  switch (type) {
    case "gas": return { color: "#ef4444", label: "Benzene" };
    case "wash": return { color: "#3b82f6", label: "Car Wash" };
    case "ev": return { color: "#22c55e", label: "EV Charger" };
    case "mechanic": return { color: "#f59e0b", label: "Mechanic" };
    case "parking": return { color: "#8b5cf6", label: "Parking" };
    case "tourist": return { color: "#ec4899", label: "Tourist Spot" };
    default: return { color: "#6b7280", label: "Other" };
  }
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

// --- Search Bar Component ---
function MapSearchBar({ onSelect }: { onSelect: (lat: number, lng: number, name: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search local POIs (instant)
  const searchLocalPOIs = useCallback((q: string): SearchResultPOI[] => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return LOCATIONS
      .filter(loc => loc.name.toLowerCase().includes(lower) || loc.type.toLowerCase().includes(lower))
      .map(loc => ({
        kind: "poi" as const,
        id: loc.id,
        name: loc.name,
        emoji: loc.emoji,
        type: loc.type,
        lat: loc.lat,
        lng: loc.lng,
      }));
  }, []);

  // Geocode via server route (debounced)
  const searchGeo = useCallback(async (q: string): Promise<SearchResultGeo[]> => {
    if (q.trim().length < 2) return [];
    try {
      const res = await fetch(`/api/geocoding/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.results || []).map((item: any) => ({
        kind: "geo" as const,
        name: item.name,
        displayName: item.displayName,
        lat: item.lat,
        lng: item.lng,
        type: item.type || "place",
      }));
    } catch {
      return [];
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    // Instantly show local POI matches
    const poiResults = searchLocalPOIs(value);
    setResults(poiResults);
    setIsOpen(poiResults.length > 0 || value.trim().length >= 3);

    // Debounce geocoding API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      setIsLoading(true);
      debounceRef.current = setTimeout(async () => {
        const geoResults = await searchGeo(value);
        const freshPoiResults = searchLocalPOIs(value);
        setResults([...freshPoiResults, ...geoResults]);
        setIsLoading(false);
        setIsOpen(true);
      }, 400);
    } else {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    setResults([]);
    onSelect(result.lat, result.lng, result.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "1rem",
        left: "1rem",
        zIndex: 500,
        width: "min(360px, calc(100% - 140px))",
      }}
    >
      {/* Search Input */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderRadius: isOpen && results.length > 0 ? "12px 12px 0 0" : "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.3)",
        padding: "0",
        overflow: "hidden",
        transition: "border-radius 0.2s ease",
      }}>
        <span style={{ padding: "0 0 0 12px", fontSize: "1.1rem", opacity: 0.5 }}>🔍</span>
        <input
          ref={inputRef}
          id="map-search-input"
          type="text"
          placeholder="Search places, streets, landmarks…"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "12px 8px",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "#1a1a2e",
            fontFamily: "inherit",
          }}
        />
        {isLoading && (
          <div style={{
            width: "18px",
            height: "18px",
            border: "2px solid #e2e8f0",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            marginRight: "8px",
            flexShrink: 0,
          }} />
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 12px",
              fontSize: "1rem",
              color: "#94a3b8",
              lineHeight: 1,
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          maxHeight: "280px",
          overflowY: "auto",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}>
          {results.length === 0 && !isLoading && query.trim().length >= 3 && (
            <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              No places found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.length === 0 && !isLoading && query.trim().length > 0 && query.trim().length < 3 && (
            <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              Type at least 3 characters to search places…
            </div>
          )}

          {/* POI results section */}
          {results.filter(r => r.kind === "poi").length > 0 && (
            <>
              <div style={{ padding: "6px 14px 2px", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Our Services
              </div>
              {results.filter(r => r.kind === "poi").map((r, i) => {
                const poi = r as SearchResultPOI;
                const globalIdx = results.indexOf(r);
                const style = getTypeStyle(poi.type);
                return (
                  <button
                    key={`poi-${poi.id}`}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: activeIndex === globalIdx ? "rgba(99,102,241,0.08)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      background: style.color + "18",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}>
                      {poi.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {poi.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: style.color, fontWeight: 600 }}>
                        {style.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* Geocoded places section */}
          {results.filter(r => r.kind === "geo").length > 0 && (
            <>
              <div style={{ padding: "8px 14px 2px", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderTop: results.some(r => r.kind === "poi") ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                Places
              </div>
              {results.filter(r => r.kind === "geo").map((r, i) => {
                const geo = r as SearchResultGeo;
                const globalIdx = results.indexOf(r);
                return (
                  <button
                    key={`geo-${i}`}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: activeIndex === globalIdx ? "rgba(99,102,241,0.08)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      background: "rgba(99,102,241,0.1)",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}>
                      🌍
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {geo.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {geo.displayName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {isLoading && results.length > 0 && (
            <div style={{ padding: "8px 14px", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>
              Searching more places…
            </div>
          )}
        </div>
      )}

      {/* Spinner keyframes injected once */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface MapComponentProps {
  filter: string;
}

export default function MapComponent({ filter }: MapComponentProps) {
  const aswanCenter: [number, number] = [24.0889, 32.8998];
  const [center, setCenter] = useState<[number, number]>(aswanCenter);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [searchPin, setSearchPin] = useState<{ pos: [number, number]; name: string } | null>(null);

  const locateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLoc(newLoc);
          setCenter(newLoc);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check browser permissions.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSearchSelect = (lat: number, lng: number, name: string) => {
    // Check if this is one of our POIs — if so, don't add a separate pin
    const isPOI = LOCATIONS.some(loc => loc.lat === lat && loc.lng === lng);
    if (!isPOI) {
      setSearchPin({ pos: [lat, lng], name });
    } else {
      setSearchPin(null);
    }
    setCenter([lat, lng]);
  };

  const filteredLocations = filter === "all"
    ? LOCATIONS
    : LOCATIONS.filter(loc => loc.type === filter);

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", zIndex: 1, position: "relative" }}>
      
      {/* Smart Search Bar — only real named places */}
      <MapSearchBar onSelect={handleSearchSelect} />

      {/* Locate Me Button Overlay */}
      <button 
        onClick={locateUser}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 400,
          background: "var(--accent)",
          color: "white",
          border: "none",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        📍 Locate Me
      </button>

      <MapContainer
        center={aswanCenter}
        zoom={14}
        maxZoom={21}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        {/* Real Google Maps Satellite Imagery */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxNativeZoom={20}
          maxZoom={21}
        />
        
        {/* Labels overlay (Google hybrid labels) */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
          maxNativeZoom={20}
          maxZoom={21}
        />
        <MapUpdater center={center} />

        {userLoc && (
          <Marker position={userLoc} icon={createEmojiIcon("🧍", "#3b82f6")}>
            <Popup>
              <strong>You are here!</strong>
            </Popup>
          </Marker>
        )}

        {/* Search result pin (for geocoded places, not POIs) */}
        {searchPin && (
          <Marker position={searchPin.pos} icon={createSearchPinIcon()}>
            <Popup>
              <div style={{ padding: "0.25rem", textAlign: "center", minWidth: "160px" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📍</div>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", color: "#111" }}>{searchPin.name}</h3>
                <span style={{
                  display: "inline-block",
                  background: "rgba(99,102,241,0.12)",
                  color: "#6366f1",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}>
                  Search Result
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {filteredLocations.map(loc => {
          const style = getTypeStyle(loc.type);
          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createEmojiIcon(loc.emoji, style.color)}
            >
              <Popup>
                <div style={{ padding: "0.25rem", textAlign: "center", minWidth: "180px" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{loc.emoji}</div>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", color: "#111" }}>{loc.name}</h3>
                  <span style={{
                    display: "inline-block",
                    background: style.color + "20",
                    color: style.color,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}>
                    {style.label}
                  </span>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>{loc.desc}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
