"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/",           label: "Home" },
  { href: "/fleet",      label: "Browse Fleet" },
  { href: "/snap",       label: "🔍 Snap & Identify" },
  { href: "/dashboard",  label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();

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

        <div className="flex gap-2">
          <Link href="/auth/login"  className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
