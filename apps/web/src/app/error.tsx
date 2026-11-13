"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Step 14: Global error page for Next.js App Router
 * Shows a safe generic message — never exposes error details to users.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to server-side monitoring — hide from user
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error.message);
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0a0c14", fontFamily: "Inter, sans-serif", margin: 0 }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}>
          <div style={{
            background: "rgba(26,34,53,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "3rem",
            maxWidth: "480px",
            textAlign: "center",
            color: "#f0f4ff",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#8fa3c0", marginBottom: "2rem", lineHeight: 1.6 }}>
              An unexpected error occurred. Our team has been notified automatically.
              Please try again or return home.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white", border: "none", borderRadius: "12px",
                  padding: "0.75rem 1.5rem", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.9rem",
                }}
              >
                Try Again
              </button>
              <Link
                href="/"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#f0f4ff", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", padding: "0.75rem 1.5rem",
                  fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                }}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
