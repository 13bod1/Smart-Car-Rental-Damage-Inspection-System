"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

const navItems = [
  { href: "/",           label: "Home",        icon: "🏠" },
  { href: "/fleet",      label: "Browse Fleet", icon: "🚗" },
  { href: "/snap",       label: "Snap & ID",    icon: "📸" },
  { href: "/damage",     label: "Damage Scan",  icon: "🛡️" },
  { href: "/compare",    label: "Compare",      icon: "🏁" },
  { href: "/roadtrip",   label: "Roadtrip",     icon: "🌴" },
  { href: "/services",   label: "Map",          icon: "🗺️" },
  { href: "/dashboard",  label: "Dashboard",    icon: "📊" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
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
        if (!error && data) {
          p = data;
        }
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

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveProfile(session?.user);
    });

    // Real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveProfile(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
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
    <nav className="navbar">
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

        {/* User profile / Auth buttons in top right */}
        <div className="flex gap-4 items-center nav-actions" style={{ position: "relative" }}>
          {!loading && profile ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 profile-pill-btn"
                style={{
                  background: isOwner
                    ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.06))"
                    : "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))",
                  border: isOwner
                    ? "1px solid rgba(59,130,246,0.35)"
                    : "1px solid rgba(16,185,129,0.35)",
                  borderRadius: "9999px",
                  padding: "4px 12px 4px 6px",
                  cursor: "pointer",
                  color: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Avatar with role status ring */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: isOwner
                      ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                      : "linear-gradient(135deg, #059669, #10b981)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    boxShadow: isOwner
                      ? "0 0 10px rgba(59,130,246,0.4)"
                      : "0 0 10px rgba(16,185,129,0.4)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    (profile.full_name || "U")[0].toUpperCase()
                  )}
                </div>

                {/* Profile Name & Role Badge */}
                <div className="flex flex-col items-start text-left" style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile.full_name || "Account"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: isOwner ? "var(--accent-light, #60a5fa)" : "var(--success, #34d399)",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {isOwner ? "🏢 Fleet Owner" : "🙋 Renter"}
                  </span>
                </div>

                {/* Dropdown Chevron */}
                <span style={{ fontSize: "0.7rem", opacity: 0.7, marginLeft: 2 }}>▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 220,
                    background: "var(--surface, #131722)",
                    border: "1px solid var(--border, rgba(255,255,255,0.12))",
                    borderRadius: "var(--radius-md, 12px)",
                    padding: "0.75rem",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ paddingBottom: "0.5rem", borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{profile.full_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary, #94a3b8)", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {userEmail || "Signed in"}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 4,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isOwner ? "rgba(59,130,246,0.2)" : "rgba(16,185,129,0.2)",
                        color: isOwner ? "#93c5fd" : "#6ee7b7",
                      }}
                    >
                      {isOwner ? "🏢 Fleet Owner Account" : "🙋 Renter Account"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: "flex-start", width: "100%", fontSize: "0.85rem" }}
                    >
                      📊 {isOwner ? "Owner Dashboard" : "My Dashboard"}
                    </Link>
                    <Link
                      href="/fleet"
                      onClick={() => setDropdownOpen(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: "flex-start", width: "100%", fontSize: "0.85rem" }}
                    >
                      🚗 {isOwner ? "Manage Fleet" : "Browse Vehicles"}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-ghost btn-sm text-danger"
                      style={{ justifyContent: "flex-start", width: "100%", fontSize: "0.85rem", marginTop: 4 }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !loading && (
            <>
              <Link href="/auth/login"  className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
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
            <span className="tab-label">{item.label.replace("Browse ", "").replace("Snap & ID", "Snap").replace("Damage Scan", "Damage")}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
