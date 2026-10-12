import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span>🤖</span> Powered by Gemini AI
        </div>
        <h1 style={{ maxWidth: "800px", margin: "0 auto 1.5rem" }}>
          Rent Smarter.<br />
          <span style={{ background: "var(--gradient-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Return Safer.
          </span>
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto 2.5rem", color: "var(--text-secondary)" }}>
          The only car rental platform with built-in AI damage assessment,
          instant vehicle identification, and smart car comparison. No disputes. No surprises.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/fleet" className="btn btn-primary btn-lg">Browse Fleet</Link>
          <Link href="/snap"  className="btn btn-secondary btn-lg">📸 Snap & Identify</Link>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>🧠 AI-Powered Features</h2>
            <p className="mt-2" style={{ maxWidth: "500px", margin: "0.5rem auto 0" }}>
              Four intelligent tools that make car rental effortless.
            </p>
          </div>

          <div className="grid-2" style={{ gap: "1.5rem" }}>
            {AI_FEATURES.map((f) => (
              <Link key={f.title} href={f.href} style={{ textDecoration: "none" }}>
                <div className="card" style={{ height: "100%", cursor: "pointer" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{f.icon}</div>
                  <h3 style={{ marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p className="text-sm" style={{ marginBottom: "1rem" }}>{f.description}</p>
                  <span className="badge badge-info">{f.badge}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Classic Features */}
      <section style={{ padding: "5rem 1.5rem", background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>Why AutoRent AI?</h2>
            <p className="mt-2" style={{ maxWidth: "500px", margin: "0.5rem auto 0" }}>
              Cutting-edge technology meets a seamless rental experience.
            </p>
          </div>

          <div className="grid-3" style={{ gap: "1.5rem" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card animate-fade-in">
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ marginBottom: "0.5rem" }}>{f.title}</h3>
                <p className="text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "3rem 1.5rem" }}>
        <div className="container">
          <div className="grid-4">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card text-center">
                <div className="stat-value text-center" style={{ textAlign: "center" }}>{s.value}</div>
                <div className="stat-label text-center" style={{ textAlign: "center" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "5rem 1.5rem", background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>How It Works</h2>
          </div>
          <div className="grid-3" style={{ gap: "2rem" }}>
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div style={{
                  width: "60px", height: "60px",
                  background: "var(--gradient-accent)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", fontWeight: 800, color: "white",
                  boxShadow: "0 4px 20px var(--accent-glow)"
                }}>{i + 1}</div>
                <h3>{step.title}</h3>
                <p className="text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div className="container">
          <div className="card-glass" style={{ padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ marginBottom: "1rem" }}>Ready to get started?</h2>
            <p className="text-secondary mb-6">
              Join thousands of renters and fleet owners using the smartest car rental platform in Egypt.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/auth/signup" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link href="/snap" className="btn btn-secondary btn-lg">📸 Try Snap & Identify</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem" }}>
        <div className="container">
          <div className="grid-3" style={{ gap: "2rem", alignItems: "start" }}>
            <div>
              <p className="logo mb-2">AutoRent AI</p>
              <p className="text-sm text-muted">Egypt&apos;s smartest car rental platform powered by Gemini AI.</p>
            </div>
            <div>
              <p className="text-xs text-muted font-bold mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Tools</p>
              <div className="flex flex-col gap-1">
                <Link href="/snap" className="text-sm text-secondary">📸 Snap & Identify</Link>
                <Link href="/damage" className="text-sm text-secondary">🛡️ Damage Scanner</Link>
                <Link href="/compare" className="text-sm text-secondary">🏁 Car Comparator</Link>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted font-bold mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Platform</p>
              <div className="flex flex-col gap-1">
                <Link href="/fleet" className="text-sm text-secondary">Browse Fleet</Link>
                <Link href="/dashboard" className="text-sm text-secondary">Dashboard</Link>
                <Link href="/auth/signup" className="text-sm text-secondary">Create Account</Link>
              </div>
            </div>
          </div>
          <div className="divider" />
          <p className="text-muted text-sm text-center">© 2026 AutoRent AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const AI_FEATURES = [
  {
    icon: "📸",
    title: "Snap & Identify",
    description: "Point your camera at any car on the street. Gemini AI instantly identifies the make, model, year, and tells you its market value and rental rate in Egypt.",
    badge: "Gemini Vision",
    href: "/snap",
  },
  {
    icon: "🛡️",
    title: "AI Damage Scanner",
    description: "Upload a photo of any vehicle and AI detects scratches, dents, and cracks — estimating repair costs and recommending deposit actions automatically.",
    badge: "Computer Vision",
    href: "/damage",
  },
  {
    icon: "🏁",
    title: "AI Car Comparator",
    description: "Compare up to 3 cars side-by-side. AI analyzes comfort, value, reliability, and fuel economy tailored to Egyptian roads and fuel prices.",
    badge: "Smart Analysis",
    href: "/compare",
  },
  {
    icon: "🤖",
    title: "AI Car Advisor",
    description: "Chat with our AI assistant in the bottom-right corner of any page. Ask about prices, get recommendations, or learn about any car model.",
    badge: "Conversational AI",
    href: "#",
  },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-Time Updates",
    description: "Supabase Realtime subscriptions push damage reports and deposit decisions to your screen the moment they're ready.",
  },
  {
    icon: "🔐",
    title: "Row-Level Security",
    description: "Your data is yours. RLS policies ensure renters only see their contracts and owners only see their fleet.",
  },
  {
    icon: "💳",
    title: "Automated Payments",
    description: "Deposit holds, refunds, and deductions are processed automatically at the end of every rental.",
  },
];

const STATS = [
  { value: "500+", label: "Vehicles Listed" },
  { value: "98%",  label: "Damage Detection Accuracy" },
  { value: "< 5s", label: "AI Analysis Time" },
  { value: "12K+", label: "Rentals Completed" },
];

const STEPS = [
  { title: "Browse & Book",   description: "Choose from hundreds of verified vehicles. Pay securely with deposit hold." },
  { title: "Pick Up & Go",    description: "Take pre-rental photos via the app. They're stored securely in Supabase Storage." },
  { title: "Return & Settle", description: "Upload 4 return photos. AI assesses damage in seconds and your deposit is settled automatically." },
];
