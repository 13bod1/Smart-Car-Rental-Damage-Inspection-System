"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReCaptcha } from "@/components/ReCaptcha";
import { SignupSchema, PASSWORD_RULES } from "@/lib/security";


import { useLanguage } from "@/lib/LanguageContext";

// Step 7: Visual password strength indicator
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= PASSWORD_RULES.minLength) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "",         color: "transparent" },
    { label: "Very Weak", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#f59e0b" },
    { label: "Strong",    color: "#84cc16" },
    { label: "Very Strong", color: "#10b981" },
  ];
  return { score, ...levels[score] };
}

export default function SignupPage() {
  const router = useRouter();
  const { lang, dir, trans } = useLanguage();
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [role, setRole]             = useState<"renter" | "owner">("renter");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Step 9: CAPTCHA required
    if (!captchaToken) {
      setError(lang === "ar" ? "يرجى إكمال التحدي الأمني." : "Please complete the security challenge.");
      return;
    }

    // Step 3, 4, 7: Validate all inputs with Zod (includes strong password rules)
    const parsed = SignupSchema.safeParse({ fullName, email, password, role });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setLoading(true);

    // Verify reCAPTCHA token with Google Siteverify API via server route
    try {
      const captchaRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        setLoading(false);
        setError(captchaData.error || (lang === "ar" ? "فشل التحقق الأمني. يرجى المحاولة لاحقاً." : "Security verification failed. Please try again."));
        return;
      }
    } catch {
      // Continue if network error on verification check
    }

    const supabase = createClient();

    try {
      const { data, error: err } = await supabase.auth.signUp({
        email:    parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.fullName, role: parsed.data.role },
          emailRedirectTo: `${window.location.origin}/auth/confirmed`,
        },
      });

      if (err) {
        setError(`DATABASE ERROR: ${err.message}`);
      } else if (data.user && !data.session) {
        // Supabase requires email confirmation!
        setSuccess(true);
        setNeedsEmailVerification(true);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2500);
      }
    } catch {
      setError(lang === "ar" ? "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div dir={dir} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
        <div className="card text-center" style={{ maxWidth: "400px" }}>
          <span style={{ fontSize: "4rem" }}>{needsEmailVerification ? "📧" : "✅"}</span>
          <h2 className="mt-4">{needsEmailVerification ? trans.checkEmail : trans.accountCreated}</h2>
          <p className="text-secondary mt-2">
            {needsEmailVerification 
              ? trans.verificationEmailSent
              : trans.redirecting}
          </p>
          {needsEmailVerification && (
            <Link href="/auth/login" className="btn btn-primary w-full mt-6">
              {trans.goToLogin}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-base)", padding: "1.5rem",
      fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit",
    }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div className="text-center mb-6">
          <Link href="/" className="logo" style={{ fontSize: "1.5rem" }}>AutoRent AI</Link>
          <h2 className="mt-4">{trans.createAccountTitle}</h2>
          <p className="text-secondary text-sm mt-1">{trans.createAccountSubtitle}</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Role Toggle */}
            <div>
              <label className="label">{trans.iAmA}</label>
              <div className="flex gap-3">
                {(["renter", "owner"] as const).map((r) => (
                  <button key={r} type="button" id={`role-${r}`}
                    className={`btn w-full ${role === r ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setRole(r)}>
                    {r === "renter" ? trans.renterRole : trans.ownerRole}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="signup-name">{trans.fullName}</label>
              <input id="signup-name" type="text" className="input"
                placeholder={lang === "ar" ? "أحمد حسن" : "Ahmed Hassan"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name" maxLength={100} required />
              {validationErrors.fullName && <span className="text-xs text-danger">{validationErrors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="signup-email">{trans.email}</label>
              <input id="signup-email" type="email" className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" maxLength={255} required />
              {validationErrors.email && <span className="text-xs text-danger">{validationErrors.email}</span>}
            </div>

            {/* Step 7: Password with strength meter */}
            <div className="form-group">
              <label className="label" htmlFor="signup-password">{trans.password}</label>
              <input id="signup-password" type="password" className="input"
                placeholder={trans.passwordRequirements}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" maxLength={128} required />

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: "4px", borderRadius: "2px",
                        background: i <= strength.score ? strength.color : "var(--border)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: strength.color }}>{strength.label}</span>
                </div>
              )}

              {/* Requirements checklist */}
              <ul style={{ marginTop: "0.5rem", listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                {[
                  { test: password.length >= 10,       label: trans.charMin },
                  { test: /[A-Z]/.test(password),      label: trans.oneUpper },
                  { test: /[a-z]/.test(password),      label: trans.oneLower },
                  { test: /[0-9]/.test(password),      label: trans.oneNumber },
                  { test: /[^A-Za-z0-9]/.test(password), label: trans.oneSpecial },
                ].map((r) => (
                  <li key={r.label} style={{ fontSize: "0.75rem", color: r.test ? "var(--success)" : "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {r.test ? "✓" : "○"} {r.label}
                  </li>
                ))}
              </ul>
              {validationErrors.password && <span className="text-xs text-danger">{validationErrors.password}</span>}
            </div>

            {/* Step 9: reCAPTCHA */}
            <ReCaptcha
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => setError(lang === "ar" ? "فشل التحدي الأمني. يرجى تحديث الصفحة." : "Security challenge failed. Please refresh.")}
              onExpire={() => setCaptchaToken(null)}
            />

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}>
                <p className="text-danger text-sm">⚠️ {error}</p>
              </div>
            )}

            <button id="signup-submit" type="submit" className="btn btn-primary btn-lg w-full"
              disabled={loading || !captchaToken || strength.score < 4}>
              {loading ? trans.creatingAccount : trans.createAccount}
            </button>

            {strength.score < 4 && password.length > 0 && (
              <p className="text-xs text-muted text-center">{trans.strengthenPassword}</p>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-secondary mt-4">
          {trans.alreadyHaveAccount}{" "}
          <Link href="/auth/login" className="text-accent">{trans.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
