"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface RoadtripResult {
  recommended_car: string;
  why_this_car: string;
  total_distance_km: number;
  estimated_fuel_cost_egp: string;
  itinerary: ItineraryDay[];
  playlist_vibe: string;
  tips: string[];
}

// --- Geocoding types ---
interface GeoResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

// --- Passenger limits per vehicle type ---
const VEHICLE_CAPACITIES = [
  { max: 2, label: "Coupe / Sports", emoji: "🏎️" },
  { max: 4, label: "Sedan", emoji: "🚗" },
  { max: 5, label: "Sedan / Compact SUV", emoji: "🚙" },
  { max: 7, label: "SUV / Minivan", emoji: "🚐" },
  { max: 8, label: "Large SUV / Van", emoji: "🚌" },
];

function getVehicleForPassengers(count: number) {
  return VEHICLE_CAPACITIES.find(v => count <= v.max) || VEHICLE_CAPACITIES[VEHICLE_CAPACITIES.length - 1];
}

// --- Destination Autocomplete Component ---
function DestinationSearch({ value, onSelect, onClear }: {
  value: string;
  onSelect: (name: string, displayName: string, lat: number, lng: number) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSelected, setIsSelected] = useState(!!value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
    setIsSelected(!!value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Reset query to last selected value if user didn't pick
        if (!isSelected && value) {
          setQuery(value);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSelected, value]);

  const searchGeo = useCallback(async (q: string): Promise<GeoResult[]> => {
    if (q.trim().length < 2) return [];
    try {
      const res = await fetch(`/api/geocoding/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch {
      return [];
    }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsSelected(false);
    setActiveIndex(-1);
    onClear();

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      setIsLoading(true);
      setIsOpen(true);
      debounceRef.current = setTimeout(async () => {
        const geoResults = await searchGeo(val);
        setResults(geoResults);
        setIsLoading(false);
        setIsOpen(true);
      }, 350);
    } else {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelect = (result: GeoResult) => {
    setQuery(result.name);
    setIsOpen(false);
    setResults([]);
    setIsSelected(true);
    onSelect(result.name, result.displayName, result.lat, result.lng);
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

  const handleClearInput = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setIsSelected(false);
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}>
        <input
          ref={inputRef}
          id="roadtrip-destination"
          className="input"
          type="text"
          placeholder="Search a real place… e.g. Luxor, Abu Simbel"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={{
            paddingLeft: "2.2rem",
            paddingRight: query ? "2.2rem" : undefined,
            borderColor: isSelected ? "var(--success)" : undefined,
          }}
        />
        <span style={{
          position: "absolute",
          left: "0.75rem",
          fontSize: "1rem",
          opacity: 0.45,
          pointerEvents: "none",
        }}>
          {isSelected ? "✅" : "🔍"}
        </span>

        {query && (
          <button
            type="button"
            onClick={handleClearInput}
            style={{
              position: "absolute",
              right: "0.6rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              padding: "4px",
              lineHeight: 1,
            }}
            aria-label="Clear destination"
          >
            ✕
          </button>
        )}
      </div>

      {/* Hint */}
      {!isSelected && query.length > 0 && query.length < 3 && (
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Type at least 3 characters to search…
        </p>
      )}
      {isSelected && (
        <p style={{ fontSize: "0.72rem", color: "var(--success)", marginTop: "4px" }}>
          ✓ Real destination selected
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: "4px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          maxHeight: "240px",
          overflowY: "auto",
        }}>
          {isLoading && (
            <div style={{ padding: "14px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{
                width: "14px", height: "14px",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Searching places…</span>
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim().length >= 3 && (
            <div style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
              No places found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((r, i) => (
            <button
              key={`geo-${i}`}
              type="button"
              onClick={() => handleSelect(r)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 14px",
                border: "none",
                background: activeIndex === i ? "rgba(99,102,241,0.1)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
                fontFamily: "inherit",
                color: "inherit",
              }}
            >
              <span style={{
                width: "30px", height: "30px",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "8px", background: "rgba(99,102,241,0.1)",
                fontSize: "0.95rem", flexShrink: 0,
              }}>
                📍
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function RoadtripPlannerPage() {
  const [destination, setDestination] = useState("");
  const [destinationValid, setDestinationValid] = useState(false);
  const [days, setDays] = useState("3");
  const [passengers, setPassengers] = useState("4");
  const [passengerError, setPassengerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadtripResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passengerCount = parseInt(passengers) || 0;
  const vehicleMatch = getVehicleForPassengers(passengerCount);
  const MAX_PASSENGERS = 8;

  const handlePassengerChange = (val: string) => {
    // Only allow digits
    const cleaned = val.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned) || 0;

    if (num > MAX_PASSENGERS) {
      setPassengerError(`Maximum ${MAX_PASSENGERS} passengers. No car can fit ${num} people! 🚫`);
      setPassengers(String(MAX_PASSENGERS));
      return;
    }
    if (cleaned && num < 1) {
      setPassengerError("At least 1 passenger needed.");
      setPassengers("1");
      return;
    }

    setPassengerError(null);
    setPassengers(cleaned);
  };

  const handleDaysChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned) || 0;
    if (num > 14) {
      setDays("14");
    } else {
      setDays(cleaned);
    }
  };

  const handleDestinationSelect = (name: string) => {
    setDestination(name);
    setDestinationValid(true);
  };

  const handleDestinationClear = () => {
    setDestination("");
    setDestinationValid(false);
  };

  const canSubmit = destinationValid && destination.length > 0 && passengerCount >= 1 && passengerCount <= MAX_PASSENGERS && parseInt(days) >= 1 && parseInt(days) <= 14;

  const planTrip = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch("/api/ai/roadtrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days: parseInt(days), passengers: parseInt(passengers) }),
      });

      if (!resp.ok) {
        throw new Error("Failed to generate plan.");
      }

      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "800px" }}>
        <div className="mb-6 text-center">
          <div className="hero-eyebrow" style={{ display: "inline-flex" }}>
            <span>🌴</span> AI Travel Assistant
          </div>
          <h1>AI Roadtrip Planner</h1>
          <p className="text-secondary mt-2">
            Tell us where you want to go, and our AI will build the perfect itinerary and pick the best rental car for the journey.
          </p>
        </div>

        {/* Form */}
        <div className="card mb-6" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="label">Destination (from Aswan)</label>
            <DestinationSearch
              value={destination}
              onSelect={handleDestinationSelect}
              onClear={handleDestinationClear}
            />
          </div>

          <div className="grid-2" style={{ gap: "1rem" }}>
            <div className="form-group">
              <label className="label">Trip Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="14"
                className="input"
                value={days}
                onChange={e => handleDaysChange(e.target.value)}
                placeholder="1 – 14"
              />
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Max 14 days
              </p>
            </div>

            <div className="form-group">
              <label className="label">Passengers</label>
              <input
                type="number"
                min="1"
                max={MAX_PASSENGERS}
                className="input"
                value={passengers}
                onChange={e => handlePassengerChange(e.target.value)}
                placeholder={`1 – ${MAX_PASSENGERS}`}
                style={{
                  borderColor: passengerError ? "var(--danger)" : undefined,
                }}
              />
              {passengerError ? (
                <p style={{ fontSize: "0.72rem", color: "var(--danger)", marginTop: "4px", fontWeight: 600 }}>
                  {passengerError}
                </p>
              ) : passengerCount >= 1 ? (
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {vehicleMatch.emoji} Best fit: {vehicleMatch.label} (up to {vehicleMatch.max} seats)
                </p>
              ) : null}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={planTrip}
            disabled={loading || !canSubmit}
          >
            {loading ? "Planning..." : "🗺️ Generate Roadtrip"}
          </button>

          {!canSubmit && !loading && (
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
              {!destinationValid ? "👆 Search and select a real destination above" : "Fill all fields to continue"}
            </p>
          )}
        </div>

        {error && (
          <div className="card mb-4" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            <p className="text-danger">⚠️ {error}</p>
          </div>
        )}

        {loading && (
          <div className="card flex flex-col items-center gap-4" style={{ padding: "3rem" }}>
            <div className="spinner animate-pulse-glow" />
            <p className="text-secondary">AI is calculating routes, fuel costs, and planning stops...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-in flex flex-col gap-6">
            
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", borderColor: "var(--accent)" }}>
              <h2 className="mb-2">🚗 Recommended: {result.recommended_car}</h2>
              <p className="text-secondary mb-4">{result.why_this_car}</p>

              <div className="grid-2" style={{ gap: "1rem" }}>
                <div className="stat-card" style={{ background: "var(--bg-surface)" }}>
                  <div className="stat-label">Total Distance</div>
                  <div className="stat-value text-accent">{result.total_distance_km} km</div>
                </div>
                <div className="stat-card" style={{ background: "var(--bg-surface)" }}>
                  <div className="stat-label">Est. Fuel Cost</div>
                  <div className="stat-value text-danger">{result.estimated_fuel_cost_egp} EGP</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4">📍 Your Itinerary</h3>
              <div className="flex flex-col gap-4">
                {result.itinerary.map(item => (
                  <div key={item.day} style={{ borderLeft: "4px solid var(--accent)", paddingLeft: "1rem" }}>
                    <p className="text-xs text-accent font-bold mb-1">DAY {item.day}</p>
                    <h4 className="mb-1">{item.title}</h4>
                    <p className="text-sm text-secondary">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="card">
                <h3 className="mb-3">🎵 Playlist Vibe</h3>
                <p className="text-sm">{result.playlist_vibe}</p>
              </div>
              <div className="card">
                <h3 className="mb-3">💡 Pro Tips</h3>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.875rem" }} className="text-secondary">
                  {result.tips.map((tip, i) => <li key={i} className="mb-1">{tip}</li>)}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
