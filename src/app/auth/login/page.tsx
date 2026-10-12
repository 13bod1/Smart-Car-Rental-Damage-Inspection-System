"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReCaptcha } from "@/components/ReCaptcha";
import { LoginSchema } from "@/lib/security";


// Step 6: Track login attempts client-side too (belt-and-suspenders)
const MAX_CLIENT_ATTEMPTS = 5;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [attempts, setAttempts]     = useState(0);
  const [blocked, setBlocked]       = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Step 6: Client-side attempt tracking
    if (blocked) {
      setError("Too many failed attempts. Please wait before trying again.");
      return;
    }

    // Step 9: CAPTCHA check
    if (!captchaToken) {
      setError("Please complete the security challenge.");
      return;
    }

    // Step 3 & 4: Validate inputs with Zod
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email:    parsed.data.email,
        password: parsed.data.password,
      });

      if (err) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Step 6: Block after max attempts
        if (newAttempts >= MAX_CLIENT_ATTEMPTS) {
          setBlocked(true);
          setTimeout(() => { setBlocked(false); setAttempts(0); }, 15 * 60 * 1000);
        }

        // Step 14: Show exact error for debugging
        setError(err.message || "Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="text-center mb-6">
          <Link href="/" className="logo" style={{ fontSize: "1.5rem" }}>AutoRent AI</Link>
          <h2 className="mt-4">Welcome back</h2>
          <p className="text-secondary text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className={`input ${validationErrors.email ? "border-danger" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                maxLength={255}
                required
              />
              {validationErrors.email && (
                <span className="text-xs text-danger mt-1">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`input ${validationErrors.password ? "border-danger" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                maxLength={128}
                required
              />
              {validationErrors.password && (
                <span className="text-xs text-danger mt-1">{validationErrors.password}</span>
              )}
            </div>

            {/* Step 9: reCAPTCHA */}
            <ReCaptcha
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => setError("Security challenge failed. Please refresh.")}
              onExpire={() => setCaptchaToken(null)}
            />


            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
              }}>
                <p className="text-danger text-sm">⚠️ {error}</p>
              </div>
            )}

            {blocked && (
              <div style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
              }}>
                <p className="text-warning text-sm">
                  🔒 Account temporarily locked. Please wait 15 minutes.
                </p>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || blocked || !captchaToken}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-secondary mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-accent">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
