"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { VehicleCard } from "@/components/VehicleCard";
import { createClient } from "@/lib/supabase/client";
import { Vehicle, VehicleCategory } from "@/lib/types";

const CATEGORIES: { value: VehicleCategory | "all"; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "economy",  label: "🚗 Economy" },
  { value: "standard", label: "🚙 Standard" },
  { value: "luxury",   label: "🏎️ Luxury" },
  { value: "suv",      label: "🚐 SUV" },
  { value: "van",      label: "🚌 Van" },
];

export default function FleetPage() {
  const [vehicles, setVehicles]         = useState<Vehicle[]>([]);
  const [loading, setLoading]           = useState(true);
  const [category, setCategory]         = useState<VehicleCategory | "all">("all");
  const [search, setSearch]             = useState("");

  useEffect(() => {
    const supabase = createClient();
    async function fetchVehicles() {
      setLoading(true);
      let query = supabase
        .from("vehicles")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (category !== "all") query = query.eq("category", category);
      if (search)              query = query.ilike("make", `%${search}%`);

      const { data } = await query;
      setVehicles(data || []);
      setLoading(false);
    }
    fetchVehicles();
  }, [category, search]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="mb-6">
          <h1>Browse Our Fleet</h1>
          <p className="text-secondary mt-1">
            {vehicles.length} available vehicles ready to rent
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <input
            id="search-vehicles"
            type="text"
            className="input"
            placeholder="Search by make (Toyota, BMW…)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                id={`filter-${c.value}`}
                className={`btn btn-sm ${category === c.value ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center" style={{ padding: "4rem" }}>
            <div className="spinner" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card text-center" style={{ padding: "4rem" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</p>
            <h3>No vehicles found</h3>
            <p className="text-secondary mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
