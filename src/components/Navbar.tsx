"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, dir } = useLanguage();
  const T = t[lang];

  const navItems = [
    { href: "/",          label: T.home,        icon: "🏠" },
    { href: "/fleet",     label: T.browseFleet,  icon: "🚗" },
    { href: "/snap",      label: T.snapId,       icon: "📸" },
    { href: "/damage",    label: T.damageScan,   icon: "🛡️" },
    { href: "/compare",   label: T.compare,      icon: "🏁" },
    { href: "/roadtrip",  label: T.roadtrip,     icon: "🌴" },
    { href: "/services",  label: T.map,          icon: "🗺️" },
    { href: "/dashboard", label: T.dashboard,    icon: "📊" },
  ];

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const resolveProfile = async (sessionUser: any) => {
      if (!sessionUser) {
        setProfile(null);
        setUserEmail(null);
        setLoading(false);
        return;
      }

      setUserEmail(sessionUser.email || null);

      let p: Profile | null = null;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();
        if (!error && data) p = data;
      } catch {
        // Fallback to user metadata
      }

      if (!p) {
        p = {
          id: sessionUser.id,
          role: (sessionUser.user_metadata?.role as any) || "renter",
          full_name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.email?.split("@")[0] ||
            "User",
          phone: null,
          national_id: null,
          license_url: null,
          avatar_url: sessionUser.user_metadata?.avatar_url || null,
          kyc_verified: false,
          created_at: sessionUser.created_at || new Date().toISOString(),
          updated_at: sessionUser.updated_at || new Date().toISOString(),
        };
      }
      setProfile(p);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveProfile(session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveProfile(session?.user);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    setUserEmail(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const isOwner = profile?.role === "owner";

  return (
    <nav className="navbar" dir={dir}>
      <div className="navbar-inner">
        <Link href="/" className="logo">AutoRent AI</Link>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Language switcher + auth */}
        <div className="flex gap-3 items-center nav-actions" style={{ position: "relative" }}>
          {/* Language Toggle */}
          <div className="lang-switcher">
            <button
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
              aria-label="English"
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === "ar" ? "active" : ""}`}
              onClick={() => setLang("ar")}
              aria-label="العربية"
            >
              ع
            </button>
          </div>

          {!loading && profile ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 profile-pill-btn"
                style={{
                  background: isOwner
                    ? "rgba(37,99,235,0.08)"
                    : "rgba(5,150,105,0.08)",
                  border: isOwner
                    ? "1px solid rgba(37,99,235,0.25)"
                    : "1px solid rgba(5,150,105,0.25)",
                  borderRadius: "9999px",
                  padding: "4px 12px 4px 6px",
                  cursor: "pointer",
                  color: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 34, height: 34,
                    borderRadius: "50%",
                    background: isOwner
                      ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                      : "linear-gradient(135deg, #059669, #10b981)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, color: "#ffffff", fontSize: "0.95rem",
                    overflow: "hidden", flexShrink: 0,
                  }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (profile.full_name || "U")[0].toUpperCase()
                  )}
                </div>

                {/* Name & Role */}
                <div className="flex flex-col items-start text-left" style={{ minWidth: 0 }}>
                  <span style={{
                    fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2,
                    maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {profile.full_name || "Account"}
                  </span>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600,
                    color: isOwner ? "#2563eb" : "#059669",
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    {isOwner ? `🏢 ${T.fleetOwner}` : `🙋 ${T.renter}`}
                  </span>
                </div>

                <span style={{ fontSize: "0.7rem", opacity: 0.6, marginLeft: 2 }}>▼</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: dir === "rtl" ? "unset" : 0,
                    left: dir === "rtl" ? 0 : "unset",
                    width: 220,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem",
                    boxShadow: "var(--shadow-hover)",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {profile.full_name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {userEmail || "Signed in"}
                    </div>
                    <span style={{
                      display: "inline-block", marginTop: 4, fontSize: "0.68rem", fontWeight: 700,
                      padding: "2px 6px", borderRadius: 4,
                      background: isOwner ? "rgba(37,99,235,0.1)" : "rgba(5,150,105,0.1)",
                      color: isOwner ? "#2563eb" : "#059669",
                    }}>
                      {isOwner ? `🏢 ${T.fleetOwner}` : `🙋 ${T.renter}`}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: "flex-start", width: "100%", fontSize: "0.85rem" }}>
                      📊 {isOwner ? T.ownerDashboard : T.myDashboard}
                    </Link>
                    <Link href="/fleet" onClick={() => setDropdownOpen(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: "flex-start", width: "100%", fontSize: "0.85rem" }}>
                      🚗 {isOwner ? T.manageFleet : T.browseVehicles}
                    </Link>
                    <button onClick={handleSignOut}
                      className="btn btn-ghost btn-sm text-danger"
                      style={{ justifyContent: "flex-start", width: "100%", fontSize: "0.85rem", marginTop: 4 }}>
                      🚪 {T.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !loading && (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">{T.signIn}</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">{T.getStarted}</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-tab-bar">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`tab-item ${pathname === item.href ? "active" : ""}`}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
