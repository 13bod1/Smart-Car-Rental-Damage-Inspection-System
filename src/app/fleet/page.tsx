"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { VehicleCard } from "@/components/VehicleCard";
import { createClient } from "@/lib/supabase/client";
import { Vehicle, VehicleCategory } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";

export default function FleetPage() {
  const { lang, dir } = useLanguage();
  const T = t[lang];

  const CATEGORIES: { value: VehicleCategory | "all"; label: string }[] = [
    { value: "all",      label: T.all },
    { value: "economy",  label: T.economy },
    { value: "standard", label: T.standard },
    { value: "luxury",   label: T.luxury },
    { value: "suv",      label: T.suv },
    { value: "van",      label: T.van },
  ];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState<VehicleCategory | "all">("all");
  const [search, setSearch]     = useState("");

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
    <div className="page-wrapper" dir={dir}>
      <Navbar />

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="mb-6">
          <h1>{T.browseOurFleet}</h1>
          <p className="text-secondary mt-1">
            {vehicles.length} {T.availableVehicles}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <input
            id="search-vehicles"
            type="text"
            className="input"
            placeholder={T.searchPlaceholder}
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
            <h3>{T.noVehiclesFound}</h3>
            <p className="text-secondary mt-2">{T.tryAdjustingFilters}</p>
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
