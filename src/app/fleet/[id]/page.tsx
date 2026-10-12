"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { RentalTerms } from "@/components/RentalTerms";
import { CheckoutForm } from "@/components/CheckoutForm";
import { createClient } from "@/lib/supabase/client";
import { Vehicle } from "@/lib/types";
import { getVehicleImage } from "@/lib/utils";
import Image from "next/image";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
      setVehicle(data);
      setLoading(false);
    };
    if (id) fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (success) {
      setTimeout(() => router.push("/dashboard"), 3000);
    }
  }, [success, router]);

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center h-screen">
        <div className="spinner animate-pulse-glow" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="page-wrapper flex flex-col items-center justify-center h-screen">
        <h1>Vehicle Not Found</h1>
        <button onClick={() => router.push("/fleet")} className="btn btn-primary mt-4">Back to Fleet</button>
      </div>
    );
  }


  const displayImage = getVehicleImage(vehicle.make, vehicle.model, vehicle.year || 2023, vehicle.thumbnail_url);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "1200px" }}>
        
        <button onClick={() => router.push("/fleet")} className="btn btn-ghost mb-6" style={{ paddingLeft: 0 }}>
          ← Back to Fleet
        </button>

        <div className="grid-2" style={{ gap: "3rem" }}>
          
          {/* Image Gallery */}
          <div className="card p-0" style={{ overflow: "hidden", border: "none" }}>
            <div style={{ position: "relative", width: "100%", height: "450px", background: "transparent" }}>
              {displayImage ? (
                <Image src={displayImage} alt={vehicle.model} fill style={{ objectFit: "contain" }} />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl">🚗</div>
              )}
              <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--primary)" }}>
                  {vehicle.category.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Booking */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="hero-eyebrow">{vehicle.year}</div>
              <h1 style={{ fontSize: "2.5rem" }}>{vehicle.make} {vehicle.model}</h1>
              <p className="text-secondary mt-2">{vehicle.color} • Plate: {vehicle.plate_number}</p>
            </div>

            <div className="grid-2 gap-4">
              <div className="stat-card" style={{ background: "var(--bg-surface)" }}>
                <div className="stat-label">Daily Rate</div>
                <div className="stat-value text-primary">{vehicle.daily_rate} EGP</div>
              </div>
              <div className="stat-card" style={{ background: "var(--bg-surface)" }}>
                <div className="stat-label">Refundable Deposit</div>
                <div className="stat-value text-accent">{vehicle.security_deposit} EGP</div>
              </div>
            </div>

            <CheckoutForm vehicle={vehicle} onSuccess={() => setSuccess(true)} />
            
            {success && (
              <div className="card mt-4 bg-success-light text-success font-bold text-center">
                ✅ Booking request sent successfully! You will be redirected to your dashboard.
              </div>
            )}
            
            <RentalTerms />
          </div>
        </div>
      </div>
    </div>
  );
}
