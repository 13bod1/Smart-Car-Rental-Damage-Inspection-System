import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "https://web-omega-weld-89.vercel.app",
  "https://sjuwebmlknlcyontkdig.supabase.co",
  process.env.NEXT_PUBLIC_APP_URL || "",
].filter(Boolean);

const securityHeaders = [
  // ── Prevent clickjacking ────────────────────────────────────────────────────
  { key: "X-Frame-Options",          value: "DENY" },
  // ── Block MIME-type sniffing ────────────────────────────────────────────────
  { key: "X-Content-Type-Options",   value: "nosniff" },
  // ── Referrer policy ────────────────────────────────────────────────────────
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  // ── XSS protection (legacy browsers) ───────────────────────────────────────
  { key: "X-XSS-Protection",         value: "1; mode=block" },
  // ── DNS prefetch control ────────────────────────────────────────────────────
  { key: "X-DNS-Prefetch-Control",   value: "on" },
  // ── Permissions policy — restrict powerful browser APIs ─────────────────────
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=()", // Geolocation allowed for map
  },
  // ── HSTS — force HTTPS for 2 years ─────────────────────────────────────────
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // ── Content Security Policy ─────────────────────────────────────────────────
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://sjuwebmlknlcyontkdig.supabase.co https://images.unsplash.com https://via.placeholder.com https://server.arcgisonline.com https://*.google.com https://cdn.imagin.studio",
      "connect-src 'self' https://sjuwebmlknlcyontkdig.supabase.co wss://sjuwebmlknlcyontkdig.supabase.co https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ── Step 2: Force HTTPS redirect ───────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://web-omega-weld-89.vercel.app/:path*",
        permanent: true,
      },
    ];
  },

  // ── Step 11: Security headers on all routes ─────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // ── Step 10: CORS for API routes ────────────────────────────────────────
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: ALLOWED_ORIGINS[0] || "https://web-omega-weld-89.vercel.app",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, x-supabase-auth",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },

  // ── Step 12: Prevent directory listing (Next.js enforces this by default) ───
  // No static file server is exposed; all routes go through Next.js router.

  // ── Step 14: Hide internal error details in production ──────────────────────
  productionBrowserSourceMaps: false,

  // ── Harden image domains ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sjuwebmlknlcyontkdig.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.imagin.studio",
      }
    ],
  },
};

export default nextConfig;
