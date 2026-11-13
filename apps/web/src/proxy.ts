import { NextRequest, NextResponse } from "next/server";

// ─── Simple in-memory rate limiter ────────────────────────────────────────────
// For production scale, swap this map with Upstash Redis.
// This covers Step 6: rate limiting for auth endpoints.

interface RateEntry {
  count:     number;
  resetAt:   number;
  blockedAt: number | null;
}

const store = new Map<string, RateEntry>();

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
  /** How long to block after limit exceeded (seconds) */
  blockSec: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  // Still in block period?
  if (entry?.blockedAt) {
    const unblockAt = entry.blockedAt + options.blockSec * 1000;
    if (now < unblockAt) {
      return { allowed: false, remaining: 0, resetAt: unblockAt };
    }
    // Block expired — reset
    store.delete(key);
  }

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowSec * 1000;
    store.set(key, { count: 1, resetAt, blockedAt: null });
    return { allowed: true, remaining: options.limit - 1, resetAt };
  }

  entry.count += 1;

  if (entry.count > options.limit) {
    entry.blockedAt = now;
    store.set(key, entry);
    return { allowed: false, remaining: 0, resetAt: now + options.blockSec * 1000 };
  }

  return { allowed: true, remaining: options.limit - entry.count, resetAt: entry.resetAt };
}

// ─── Extract client IP from Vercel/proxy headers ──────────────────────────────
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// ─── Next.js Proxy (previously 'middleware') ─────────────────────────────────
// Applied to auth routes + API routes to enforce rate limits and security headers.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // ── Rate limit: login (5 attempts / 60 sec, blocked 15 min on breach) ────────
  if (pathname === "/auth/login" && request.method === "POST") {
    const result = checkRateLimit(`login:${ip}`, {
      limit:     5,
      windowSec: 60,
      blockSec:  900, // 15 minutes
    });

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many login attempts. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type":     "application/json",
            "Retry-After":      String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // ── Rate limit: signup (3 per hour per IP) ────────────────────────────────
  if (pathname === "/auth/signup" && request.method === "POST") {
    const result = checkRateLimit(`signup:${ip}`, {
      limit:     3,
      windowSec: 3600,
      blockSec:  3600,
    });

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many signup attempts. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // ── Rate limit: general API (100 req / 60 sec) ─────────────────────────────
  if (pathname.startsWith("/api/")) {
    const result = checkRateLimit(`api:${ip}`, {
      limit:     100,
      windowSec: 60,
      blockSec:  60,
    });

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const response = NextResponse.next();

  // ── Step 11: Add security headers at edge ────────────────────────────────────
  response.headers.set("X-Frame-Options",        "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection",       "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/api/:path*",
    "/dashboard/:path*",
  ],
};
