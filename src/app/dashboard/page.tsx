"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile, Rental, AIDamageReport, Vehicle, UserRole } from "@/lib/types";
import { DamageReportCard } from "@/components/DamageReportCard";
import { Navbar } from "@/components/Navbar";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

type Tab = "requests" | "rentals" | "fleet" | "reports";

interface ReservationItem {
  id: string;
  vehicle_id: string;
  vehicle_name?: string;
  vehicle_plate?: string;
  vehicle_category?: string;
  vehicle_image?: string;
  renter_id?: string;
  renter_name?: string;
  renter_email?: string;
  renter_phone?: string;
  billing_city?: string;
  start_date: string;
  end_date: string;
  total_price_egp: number;
  status: string;
  created_at: string;
  vehicle?: Vehicle;
  renter?: Profile;
  notes?: string;
}

export default function DashboardPage() {
  const { lang, dir, trans } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reports, setReports] = useState<AIDamageReport[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = profile?.role === "owner";

  const loadData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthLoading(false);
      setLoading(false);
      return;
    }

    // 1. Fetch user profile
    let prof: Profile | null = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) prof = data;
    } catch {}

    const resolvedRole = (prof?.role || user.user_metadata?.role || "renter") as UserRole;

    const safeProfile: Profile = prof || {
      id: user.id,
      role: resolvedRole,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      phone: null,
      national_id: null,
      license_url: null,
      avatar_url: user.user_metadata?.avatar_url || null,
      kyc_verified: false,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    };

    setProfile(safeProfile);
    setAuthLoading(false);

    const ownerRole = resolvedRole === "owner";

    // 2. Fetch real bookings from persistent backend API
    let apiBookings: any[] = [];
    try {
      const res = await fetch("/api/rentals/list", { cache: "no-store" });
      const d = await res.json();
      if (d.success && Array.isArray(d.bookings)) {
        apiBookings = d.bookings;
      }
    } catch {}

    // 3. Fetch real bookings from localStorage sync
    let localBookings: any[] = [];
    try {
      localBookings = JSON.parse(localStorage.getItem("autorent_real_bookings") || "[]");
    } catch {}

    // Merge backend and local real bookings
    const combinedRealBookings = [...apiBookings];
    for (const lb of localBookings) {
      const existingIdx = combinedRealBookings.findIndex((b) => b.id === lb.id);
      if (existingIdx === -1) {
        combinedRealBookings.push(lb);
      } else {
        // If local has newer decision, take it
        if (lb.status !== combinedRealBookings[existingIdx].status) {
          combinedRealBookings[existingIdx] = lb;
        }
      }
    }

    // 4. Fetch Supabase records if available
    let vehiclesList: Vehicle[] = [];
    let dbReservations: any[] = [];
    let dbRentals: Rental[] = [];

    if (ownerRole) {
      const [vehiclesRes, reservationsRes, rentalsRes, reportsRes] = await Promise.all([
        supabase
          .from("vehicles")
          .select("*")
          .or(`owner_id.eq.${user.id},owner_id.eq.00000000-0000-0000-0000-000000000001`)
          .order("created_at", { ascending: false }),
        supabase
          .from("reservations")
          .select("*, vehicle:vehicles(*)")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("rentals")
          .select("*, vehicle:vehicles(*)")
          .or(`owner_id.eq.${user.id},owner_id.eq.00000000-0000-0000-0000-000000000001`)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("ai_damage_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      vehiclesList = vehiclesRes.data || [];
      dbReservations = reservationsRes.data || [];
      dbRentals = rentalsRes.data || [];
      setReports(reportsRes.data || []);
    } else {
      const [reservationsRes, rentalsRes, reportsRes] = await Promise.all([
        supabase
          .from("reservations")
          .select("*, vehicle:vehicles(*)")
          .eq("renter_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("rentals")
          .select("*, vehicle:vehicles(*)")
          .eq("renter_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("ai_damage_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      dbReservations = reservationsRes.data || [];
      dbRentals = rentalsRes.data || [];
      setReports(reportsRes.data || []);
    }

    setMyVehicles(vehiclesList);

    // 5. Build Unified Requests list (Pending)
    const allRequests: ReservationItem[] = [];

    // Add all pending real bookings from renters
    for (const b of combinedRealBookings) {
      if (b.status === "pending") {
        allRequests.push({
          id: b.id,
          vehicle_id: b.vehicle_id,
          vehicle_name: b.vehicle_name,
          vehicle_plate: b.vehicle_plate,
          vehicle_category: b.vehicle_category,
          vehicle_image: b.vehicle_image,
          renter_name: b.renter_name,
          renter_email: b.renter_email,
          renter_phone: b.renter_phone,
          billing_city: b.billing_city,
          start_date: b.start_date,
          end_date: b.end_date,
          total_price_egp: b.total_price_egp,
          status: "pending",
          created_at: b.created_at,
          notes: b.notes,
        });
      }
    }

    // Add database reservations
    for (const r of dbReservations) {
      if (!allRequests.some((x) => x.id === r.id)) {
        allRequests.push({
          id: r.id,
          vehicle_id: r.vehicle_id,
          start_date: r.start_date,
          end_date: r.end_date,
          total_price_egp: r.total_price_egp,
          status: r.status,
          created_at: r.created_at,
          vehicle: r.vehicle,
          notes: r.notes,
        });
      }
    }

    // 6. Build Unified Rentals list (Active & Completed)
    const activeAndCompletedRentals: Rental[] = [...dbRentals.filter((r) => r.status !== "pending")];

    for (const b of combinedRealBookings) {
      if (b.status === "accepted" || b.status === "completed") {
        if (!activeAndCompletedRentals.some((r) => r.id === b.id)) {
          activeAndCompletedRentals.push({
            id: b.id,
            vehicle_id: b.vehicle_id,
            renter_id: b.renter_id || "renter_direct",
            owner_id: user.id,
            start_date: b.start_date,
            end_date: b.end_date,
            actual_return_at: b.status === "completed" ? new Date().toISOString() : null,
            pickup_mileage: null,
            return_mileage: null,
            daily_rate: b.daily_rate || 650,
            total_days: 3,
            subtotal: b.total_price_egp,
            security_deposit: 3000,
            deposit_status: "held",
            deposit_deduction: 0,
            status: b.status === "accepted" ? "active" : "completed",
            notes: `Renter: ${b.renter_name} (${b.renter_phone})`,
            created_at: b.created_at,
            updated_at: b.updated_at || b.created_at,
            vehicle: {
              id: b.vehicle_id,
              owner_id: user.id,
              make: b.vehicle_name?.split(" ")[1] || "Rental",
              model: b.vehicle_name?.split(" ").slice(2).join(" ") || "Vehicle",
              year: parseInt(b.vehicle_name?.split(" ")[0]) || 2024,
              color: null,
              plate_number: b.vehicle_plate || "EGP-1234",
              vin: null,
              category: (b.vehicle_category as any) || "standard",
              daily_rate: b.daily_rate || 650,
              market_value: null,
              security_deposit: 3000,
              mileage: 15000,
              status: b.status === "accepted" ? "rented" : "available",
              description: null,
              features: null,
              thumbnail_url: b.vehicle_image || null,
              created_at: b.created_at,
              updated_at: b.created_at,
            },
          });
        }
      }
    }

    setReservations(allRequests);
    setRentals(activeAndCompletedRentals);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    // Listen to storage events when a renter books in another tab or window
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener("storage", handleStorageChange);

    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        loadData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "rentals" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Compute live statistics directly from active/completed rentals and pending requests
  const stats = {
    totalRentals: rentals.length,
    activeRentals: rentals.filter((r) => r.status === "active").length,
    completed: rentals.filter((r) => r.status === "completed").length,
    totalRevenue: rentals
      .filter((r) => r.status === "completed" || r.status === "active")
      .reduce((sum, r) => sum + (r.subtotal || (r.daily_rate ? r.daily_rate * 3 : 0)), 0),
    pendingRequests: reservations.filter((r) => r.status === "pending").length,
  };

  // Fleet Owner Decision Action: Accept or Reject
  const handleRespond = async (requestId: string, action: "accept" | "reject") => {
    setRespondingId(requestId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/rentals/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: requestId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decision could not be processed");

      // Update localStorage real bookings sync
      try {
        const local = JSON.parse(localStorage.getItem("autorent_real_bookings") || "[]");
        const updated = local.map((b: any) =>
          b.id === requestId ? { ...b, status: action === "accept" ? "accepted" : "rejected" } : b
        );
        localStorage.setItem("autorent_real_bookings", JSON.stringify(updated));
      } catch {}

      if (action === "accept") {
        setActionSuccess("🎉 Rental Request APPROVED! Contract is now ACTIVE and numbers have updated.");
      } else {
        setActionSuccess("Rental request was declined.");
      }

      await loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to submit decision");
    } finally {
      setRespondingId(null);
    }
  };

  // Owner action: Complete rental
  const handleCompleteRental = async (rentalId: string) => {
    setRespondingId(rentalId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/rentals/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId, action: "complete" }),
      });

      if (!res.ok) throw new Error("Could not complete rental");

      try {
        const local = JSON.parse(localStorage.getItem("autorent_real_bookings") || "[]");
        const updated = local.map((b: any) => (b.id === rentalId ? { ...b, status: "completed" } : b));
        localStorage.setItem("autorent_real_bookings", JSON.stringify(updated));
      } catch {}

      setActionSuccess("🏁 Rental completed! Vehicle returned to fleet and stats updated.");
      await loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to complete rental");
    } finally {
      setRespondingId(null);
    }
  };

  const sidebarItems = isOwner
    ? [
        { tab: "requests", icon: "⚡", label: trans.ownerApprovalsTab, badge: stats.pendingRequests },
        { tab: "rentals",  icon: "🔑", label: trans.activeRentalsTab },
        { tab: "fleet",    icon: "🚗", label: trans.myFleetTab },
        { tab: "reports",  icon: "🤖", label: trans.damageReportsTab },
      ]
    : [
        { tab: "rentals",  icon: "📋", label: trans.myBookingsTab },
        { tab: "requests", icon: "📨", label: lang === "ar" ? "طلباتي" : "My Requests", badge: stats.pendingRequests },
        { tab: "fleet",    icon: "🚗", label: trans.browseFleet },
        { tab: "reports",  icon: "🤖", label: trans.damageReportsTab },
      ];

  if (authLoading) {
    return (
      <div className="page-wrapper flex items-center justify-center h-screen">
        <div className="spinner animate-pulse-glow" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-wrapper" dir={dir} style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
          <span style={{ fontSize: "4rem" }}>🔒</span>
          <h2 className="mt-4">{trans.pleaseSignIn}</h2>
          <p className="text-secondary mt-2">{trans.needAccount}</p>
          <Link href="/auth/login" className="btn btn-primary mt-6">{trans.signIn}</Link>
        </div>
      </div>
    );
  }

  const pendingRequests = reservations.filter((r) => r.status === "pending");

  return (
    <div className="page-wrapper" dir={dir} style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
      <Navbar />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Profile Card */}
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "var(--gradient-card)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
          }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: isOwner ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "linear-gradient(135deg, #059669, #10b981)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, color: "#ffffff", fontSize: "1.1rem",
                overflow: "hidden",
                boxShadow: isOwner ? "0 0 12px rgba(59,130,246,0.35)" : "0 0 12px rgba(16,185,129,0.35)",
              }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (profile.full_name || "U")[0].toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{profile.full_name || "User"}</div>
                <span style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: isOwner ? "rgba(59,130,246,0.18)" : "rgba(16,185,129,0.18)",
                  color: isOwner ? "#93c5fd" : "#6ee7b7",
                  fontWeight: 700,
                  display: "inline-block",
                  marginTop: 2,
                }}>
                  {isOwner ? (lang === "ar" ? "🏢 مالك أسطول" : "🏢 Fleet Owner") : (lang === "ar" ? "🙋 مستأجر" : "🙋 Renter")}
                </span>
              </div>
            </div>
          </div>

          <div className="sidebar-section-label">{lang === "ar" ? "الإدارة" : "Management"}</div>
          {sidebarItems.map((item) => (
            <button
              key={item.tab}
              id={`sidebar-${item.tab}`}
              className={`sidebar-item ${activeTab === item.tab ? "active" : ""}`}
              onClick={() => setActiveTab(item.tab as Tab)}
            >
              <span>{item.icon}</span>
              {item.label}
              {"badge" in item && (item as any).badge > 0 && (
                <span style={{
                  marginLeft: lang === "ar" ? "0" : "auto",
                  marginRight: lang === "ar" ? "auto" : "0",
                  background: "var(--danger)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700,
                }}>
                  {(item as any).badge}
                </span>
              )}
            </button>
          ))}
          <div className="divider" />
          <div className="sidebar-section-label">{lang === "ar" ? "إجراءات سريعة" : "Quick Actions"}</div>
          <Link href="/fleet" className="sidebar-item">
            <span>🚗</span> {trans.browseFleet}
          </Link>
          <Link href="/snap" className="sidebar-item">
            <span>📸</span> {trans.snapTitle}
          </Link>
          <Link href="/compare" className="sidebar-item">
            <span>🏁</span> {trans.compareTitle}
          </Link>
        </aside>

        {/* Content */}
        <main className="dashboard-content">
          {/* Notifications / Alerts */}
          {actionSuccess && (
            <div className="animate-fade-in" style={{
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span className="text-success font-semibold text-sm">{actionSuccess}</span>
              <button onClick={() => setActionSuccess(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
            </div>
          )}

          {actionError && (
            <div className="animate-fade-in" style={{
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span className="text-danger font-semibold text-sm">⚠️ {actionError}</span>
              <button onClick={() => setActionError(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
            </div>
          )}

          {/* Dynamic Live Counter Cards */}
          <div className="grid-4 mb-8">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{stats.totalRentals}</div>
              <div className="stat-label">{lang === "ar" ? "إجمالي الحجوزات" : "Total Rentals"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔑</div>
              <div className="stat-value text-info">{stats.activeRentals}</div>
              <div className="stat-label">{lang === "ar" ? "نشط حالياً" : "Active Now"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value text-success">{stats.completed}</div>
              <div className="stat-label">{lang === "ar" ? "مكتملة بنجاح" : "Completed"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value text-accent">{formatCurrency(stats.totalRevenue)}</div>
              <div className="stat-label">{lang === "ar" ? "إجمالي الإيرادات" : "Revenue"}</div>
            </div>
          </div>

          {/* FLEET OWNER: Direct Decision Center for Real Incoming Requests */}
          {isOwner && (
            <div className="card mb-8 animate-fade-in" style={{
              border: pendingRequests.length > 0 ? "1px solid rgba(245,158,11,0.45)" : "1px solid var(--border)",
              background: pendingRequests.length > 0
                ? "linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(19,23,34,0.85) 100%)"
                : "var(--bg-surface)",
            }}>
              <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: "1.8rem" }}>⚡</span>
                  <div>
                    <h2 style={{ fontSize: "1.3rem", margin: 0 }}>
                      {lang === "ar" ? "مركز قرارات وموافقات الأسطول" : "Fleet Approvals & Decision Center"}
                    </h2>
                    <p className="text-secondary text-sm mt-1">
                      {lang === "ar"
                        ? "طلبات الحجز المباشرة من العملاء تظهر هنا فوراً لمراجعتها والموافقة عليها."
                        : "Real rental bookings from customers appear here directly for your approval."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadData}
                  className="btn btn-sm btn-ghost"
                  style={{ border: "1px solid var(--border)", padding: "0.45rem 1rem" }}
                  title="Check for new incoming bookings"
                >
                  {lang === "ar" ? "🔄 تحديث الطلبات" : "🔄 Refresh Bookings"}
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div style={{
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border)",
                }}>
                  <p style={{ fontSize: "2.5rem", margin: 0 }}>🚗</p>
                  <h4 className="mt-2">{lang === "ar" ? "لا توجد طلبات حجز معلقة حالياً" : "No pending requests right now"}</h4>
                  <p className="text-secondary text-sm mt-1 max-w-md mx-auto">
                    {lang === "ar"
                      ? "بمجرد قيام أي عميل بحجز سيارة من الأسطول، ستظهر تفاصيل حجزه كاملة هنا لمراجعتها واتخاذ القرار."
                      : "As soon as a renter reserves a vehicle from the fleet, their real booking details (name, phone, dates, price) will appear right here for your decision."}
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link href="/fleet" className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--border)" }}>
                      {lang === "ar" ? "استعراض الأسطول المتاح" : "View Available Fleet"}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span style={{
                      background: "var(--warning)",
                      color: "#000",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                    }}>
                      {pendingRequests.length} {lang === "ar" ? "إجراء مطلوب" : "ACTION REQUIRED"}
                    </span>
                    <span className="text-xs text-secondary">
                      {lang === "ar"
                        ? "يرجى مراجعة بيانات العميل والموافقة على الحجز أو رفضه."
                        : "Review customer credentials and decide to approve or decline."}
                    </span>
                  </div>

                  {pendingRequests.map((req) => {
                    const carTitle = req.vehicle
                      ? `${req.vehicle.year} ${req.vehicle.make} ${req.vehicle.model}`
                      : req.vehicle_name || (lang === "ar" ? "سيارة من الأسطول" : "Fleet Vehicle");

                    return (
                      <div
                        key={req.id}
                        className="card animate-fade-in"
                        style={{
                          background: "var(--bg-base)",
                          border: "1px solid rgba(245,158,11,0.35)",
                          borderLeft: dir === "rtl" ? "none" : "5px solid var(--warning)",
                          borderRight: dir === "rtl" ? "5px solid var(--warning)" : "none",
                          padding: "1.25rem",
                        }}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div style={{ flex: 1 }}>
                            <div className="flex items-center gap-3">
                              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>{carTitle}</h3>
                              {(req.vehicle?.category || req.vehicle_category) && (
                                <span className="badge" style={{ textTransform: "uppercase" }}>
                                  {req.vehicle?.category || req.vehicle_category}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-secondary mt-2">
                              {lang === "ar" ? "📅 فترة الإيجار:" : "📅 Rental Period:"} <strong>{formatDate(req.start_date)}</strong> → <strong>{formatDate(req.end_date)}</strong>
                            </p>

                            {/* Real Renter Information */}
                            <div style={{
                              marginTop: "0.75rem",
                              padding: "0.75rem",
                              background: "rgba(59,130,246,0.06)",
                              border: "1px solid rgba(59,130,246,0.2)",
                              borderRadius: "var(--radius-sm)",
                            }}>
                              <div className="font-semibold text-sm" style={{ color: "var(--accent-light)" }}>
                                {lang === "ar" ? "👤 العميل:" : "👤 Customer:"} {req.renter_name || (lang === "ar" ? "عميل مباشر" : "Direct Customer")}
                              </div>
                              <div className="text-xs text-secondary mt-1 flex flex-wrap gap-4">
                                {req.renter_phone && <span>{lang === "ar" ? "📞 الهاتف:" : "📞 Phone:"} {req.renter_phone}</span>}
                                {req.renter_email && <span>{lang === "ar" ? "✉️ البريد:" : "✉️ Email:"} {req.renter_email}</span>}
                                {req.billing_city && <span>{lang === "ar" ? "📍 المدينة:" : "📍 City:"} {req.billing_city}</span>}
                              </div>
                            </div>
                          </div>

                          <div className={lang === "ar" ? "text-left" : "text-right"}>
                            <span style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: "var(--radius-sm)",
                              background: "rgba(245,158,11,0.15)",
                              color: "var(--warning)",
                              display: "inline-block",
                              marginBottom: "0.5rem",
                            }}>
                              {lang === "ar" ? "⏳ بانتظار قرارك" : "⏳ Awaiting Your Decision"}
                            </span>
                            <div className="font-bold text-accent" style={{ fontSize: "1.35rem" }}>
                              {formatCurrency(req.total_price_egp)}
                            </div>
                          </div>
                        </div>

                        {/* Owner Decision Action Buttons */}
                        <div className="flex gap-3 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              color: "var(--danger)",
                              flex: 1,
                              fontWeight: 700,
                            }}
                            onClick={() => handleRespond(req.id, "reject")}
                            disabled={respondingId === req.id}
                          >
                            {lang === "ar" ? "❌ رفض الطلب" : "❌ Decline Request"}
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              border: "none",
                              fontWeight: 800,
                              flex: 2,
                              boxShadow: "0 0 15px rgba(16,185,129,0.35)",
                            }}
                            onClick={() => handleRespond(req.id, "accept")}
                            disabled={respondingId === req.id}
                          >
                            {respondingId === req.id
                              ? (lang === "ar" ? "جاري الاعتماد..." : "Processing...")
                              : (lang === "ar" ? "✅ قبول واعتماد الحجز" : "✅ APPROVE & ACCEPT RENTAL")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Secondary Tab Content */}
          {loading ? (
            <div className="flex justify-center" style={{ padding: "4rem" }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {activeTab === "requests" && (
                <div>
                  <h3 className="mb-4">{lang === "ar" ? "📋 سجل جميع طلبات الإيجار الواردة" : "📋 All Incoming Rental Requests History"}</h3>
                  {reservations.length === 0 ? (
                    <div className="card text-center" style={{ padding: "3rem" }}>
                      <p style={{ fontSize: "2.5rem" }}>📭</p>
                      <h4>{lang === "ar" ? "لا توجد طلبات مسجلة حتى الآن" : "No requests recorded yet"}</h4>
                      <p className="text-secondary text-sm mt-1">
                        {lang === "ar" ? "ستظهر طلبات الحجز المكتملة هنا فور تسجيلها." : "Bookings made by renters will appear here."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {reservations.map((r) => {
                        const title = r.vehicle
                          ? `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}`
                          : r.vehicle_name || (lang === "ar" ? "سيارة مستأجرة" : "Rental Vehicle");

                        return (
                          <div key={r.id} className="card animate-fade-in" style={{ padding: "1.25rem" }}>
                            <div className="flex justify-between items-center flex-wrap gap-3">
                              <div>
                                <h4>{title}</h4>
                                <p className="text-sm text-muted mt-1">
                                  {formatDate(r.start_date)} → {formatDate(r.end_date)}
                                </p>
                                {r.renter_name && (
                                  <p className="text-xs text-secondary mt-1">{lang === "ar" ? "👤 العميل:" : "👤 Renter:"} {r.renter_name}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                                  {r.status === "accepted" ? (lang === "ar" ? "✅ معتمد" : "✅ Approved") : r.status === "pending" ? (lang === "ar" ? "⏳ قيد الانتظار" : "⏳ Pending") : (lang === "ar" ? "❌ ملغي/مرفوض" : r.status)}
                                </span>
                                <div className="font-bold text-accent">{formatCurrency(r.total_price_egp)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "rentals" && (
                <div className="animate-fade-in">
                  <h2 className="mb-4">{isOwner ? (lang === "ar" ? "🔑 عقود وإيجارات الأسطول النشطة" : "🔑 Managed Fleet Rentals & Contracts") : (lang === "ar" ? "حجوزاتك" : "Your Rentals")}</h2>
                  {rentals.length === 0 ? (
                    <div className="card text-center" style={{ padding: "4rem" }}>
                      <p style={{ fontSize: "3rem" }}>📋</p>
                      <h3 className="mt-4">{lang === "ar" ? "لا توجد إيجارات نشطة حتى الآن" : "No active rentals yet"}</h3>
                      <p className="text-secondary mt-2">
                        {isOwner
                          ? (lang === "ar" ? "عند الموافقة على طلبات الحجز من العملاء، ستظهر العقود النشطة هنا." : "When you approve rental requests from customers, active contracts will appear here.")
                          : (lang === "ar" ? "احجز سيارتك الأولى لبدء رحلتك الآن." : "Book your first car to get started.")}
                      </p>
                      {!isOwner && <Link href="/fleet" className="btn btn-primary mt-6">{trans.browseFleet}</Link>}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {rentals.map((rental) => {
                        const isActive = rental.status === "active";
                        return (
                          <div key={rental.id} className="card animate-fade-in" style={{ padding: "1.25rem" }}>
                            <div className="flex justify-between items-center flex-wrap gap-3">
                              <div>
                                <h3 style={{ margin: 0 }}>
                                  {rental.vehicle
                                    ? `${rental.vehicle.year} ${rental.vehicle.make} ${rental.vehicle.model}`
                                    : (lang === "ar" ? "سيارة مستأجرة" : "Rental Vehicle")}
                                </h3>
                                <p className="text-sm text-muted mt-1">
                                  📅 {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                                  {rental.total_days ? (lang === "ar" ? ` · ${rental.total_days} أيام` : ` · ${rental.total_days} days`) : ""}
                                </p>
                                {rental.notes && (
                                  <p className="text-xs text-secondary mt-1">{rental.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-3 items-center">
                                <span className={`badge ${getStatusBadgeClass(rental.status)}`}>{rental.status}</span>
                                <div className={lang === "ar" ? "text-left" : "text-right"}>
                                  <div className="font-bold text-accent" style={{ fontSize: "1.1rem" }}>
                                    {formatCurrency(rental.subtotal || rental.daily_rate * 3)}
                                  </div>
                                  <div className="text-xs text-muted">{lang === "ar" ? "مبلغ التأمين:" : "Deposit:"} {formatCurrency(rental.security_deposit)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Owner action: Complete active rental */}
                            {isOwner && isActive && (
                              <div className="flex justify-end gap-3 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                                <button
                                  className="btn btn-sm btn-ghost"
                                  style={{
                                    border: "1px solid rgba(16,185,129,0.3)",
                                    color: "var(--success)",
                                    fontWeight: 700,
                                  }}
                                  onClick={() => handleCompleteRental(rental.id)}
                                  disabled={respondingId === rental.id}
                                >
                                  {respondingId === rental.id ? (lang === "ar" ? "جاري التحديث..." : "Updating...") : (lang === "ar" ? "🏁 إنهاء الإيجار واستلام السيارة" : "🏁 Mark Completed & Return Car")}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "fleet" && (
                isOwner ? (
                  <OwnerFleetTab vehicles={myVehicles} lang={lang} />
                ) : (
                  <div className="card text-center" style={{ padding: "4rem" }}>
                    <p style={{ fontSize: "3rem" }}>🚗</p>
                    <h3 className="mt-4">{trans.browseFleet}</h3>
                    <p className="text-secondary mt-2">{lang === "ar" ? "ابحث واستأجر سيارتك المثالية بأفضل الأسعار." : "Find and rent your perfect vehicle."}</p>
                    <Link href="/fleet" className="btn btn-primary mt-6">{trans.browseFleet}</Link>
                  </div>
                )
              )}

              {activeTab === "reports" && <ReportsTab reports={reports} lang={lang} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── Owner Fleet Tab ──────────────────────────────────────────────────── */
function OwnerFleetTab({ vehicles, lang }: { vehicles: Vehicle[]; lang: "en" | "ar" }) {
  if (vehicles.length === 0) {
    return (
      <div className="card text-center" style={{ padding: "4rem" }}>
        <p style={{ fontSize: "3rem" }}>🚗</p>
        <h3 className="mt-4">{lang === "ar" ? "لا توجد سيارات في أسطولك حالياً" : "No vehicles in your fleet"}</h3>
        <p className="text-secondary mt-2">{lang === "ar" ? "ستظهر سياراتك هنا بمجرد إضافتها إلى المنصة." : "Your vehicles will appear here when added to the platform."}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">{lang === "ar" ? `🚗 سيارات الأسطول المدارة (${vehicles.length})` : `🚗 Managed Fleet Vehicles (${vehicles.length})`}</h2>
      <div className="flex flex-col gap-4">
        {vehicles.slice(0, 25).map((v) => (
          <div key={v.id} className="card animate-fade-in" style={{ padding: "1.25rem" }}>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ margin: 0 }}>{v.year} {v.make} {v.model}</h3>
                <p className="text-sm text-muted mt-1">
                  {lang === "ar" ? "اللوحة:" : "Plate:"} {v.plate_number} · {v.color || "—"} · {v.mileage?.toLocaleString()} {lang === "ar" ? "كم" : "km"}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <span className={`badge ${getStatusBadgeClass(v.status)}`}>{v.status}</span>
                <div className={lang === "ar" ? "text-left" : "text-right"}>
                  <div className="font-bold text-primary">{formatCurrency(v.daily_rate)}{lang === "ar" ? "/يوم" : "/day"}</div>
                  <div className="text-xs text-muted">{lang === "ar" ? "مبلغ التأمين:" : "Deposit:"} {formatCurrency(v.security_deposit)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reports Tab ──────────────────────────────────────────────────────── */
function ReportsTab({ reports, lang }: { reports: AIDamageReport[]; lang: "en" | "ar" }) {
  if (reports.length === 0) {
    return (
      <div className="card text-center" style={{ padding: "4rem" }}>
        <p style={{ fontSize: "3rem" }}>🤖</p>
        <h3 className="mt-4">{lang === "ar" ? "لا توجد تقارير ذكاء اصطناعي بعد" : "No AI Reports Yet"}</h3>
        <p className="text-secondary mt-2">{lang === "ar" ? "تظهر التقارير هنا عند انتهاء الإيجار وتحليل صور فحص السيارة بالذكاء الاصطناعي." : "Reports appear here when a rental ends and damage inspection photos are analyzed."}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">{lang === "ar" ? "تقارير فحص الأضرار بالذكاء الاصطناعي" : "AI Damage Reports"}</h2>
      <div className="flex flex-col gap-4">
        {reports.map((r) => <DamageReportCard key={r.id} report={r} />)}
      </div>
    </div>
  );
}
