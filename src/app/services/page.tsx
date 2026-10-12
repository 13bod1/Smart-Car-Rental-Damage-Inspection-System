"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";

// Dynamically import the map because Leaflet relies on the window object
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="spinner animate-pulse-glow" />
      <p className="mt-4 text-secondary">Loading satellite data...</p>
    </div>
  )
});

const FILTERS = [
  { id: "all", label: "All Services", icon: "📍" },
  { id: "gas", label: "Benzene", icon: "⛽" },
  { id: "wash", label: "Car Wash", icon: "🧽" },
  { id: "ev", label: "EV Chargers", icon: "⚡" },
  { id: "mechanic", label: "Mechanics", icon: "🔧" },
  { id: "parking", label: "Parking", icon: "🅿️" },
  { id: "tourist", label: "Tourist Spots", icon: "🏛️" },
];

export default function ServicesMapPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="page-wrapper" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.5rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div className="mb-4">
          <div className="hero-eyebrow" style={{ display: "inline-flex" }}>
            <span>🗺️</span> Driver Companion
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl">Aswan Satellite Map</h1>
          <p className="text-secondary mt-1">
            Explore Aswan with real-time satellite imagery. Find benzene stations, parking, and iconic tourist spots like the High Dam.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`btn btn-sm ${filter === f.id ? "btn-primary" : "btn-secondary"}`}
              style={{ whiteSpace: "nowrap", borderRadius: "var(--radius-full)" }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Map Container */}
        <div className="card" style={{ flex: 1, padding: "0.5rem", position: "relative", minHeight: "400px" }}>
          <MapComponent filter={filter} />
          
          {/* Decorative glass overlay */}
          <div style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            border: "1px solid rgba(255,255,255,0.5)"
          }}>
            <span className="text-xs font-bold text-slate-800">Aswan, Egypt</span>
            <div style={{ width: "8px", height: "8px", background: "var(--success)", borderRadius: "50%", boxShadow: "0 0 8px var(--success)" }} />
            <span className="text-xs text-slate-500">Live Satellite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
