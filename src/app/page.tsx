"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";

/* ── Star Rating Component ────────────────────────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${star <= rating ? "" : "empty"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

/* ── Fleet Owner Reviews ─────────────────────────────────────────────────── */
const REVIEWS = [
  {
    nameEn: "Ahmed Al-Rashidi",
    nameAr: "أحمد الرشيدي",
    roleEn: "Fleet Owner · Cairo, 12 vehicles",
    roleAr: "مالك أسطول · القاهرة، 12 سيارة",
    quoteEn:
      "AutoRent AI changed everything. The AI damage scanner saves me hours of dispute emails every month. My deposit recovery rate went from 60% to 97%.",
    quoteAr:
      "AutoRent AI غيّر كل شيء. فاحص الأضرار بالذكاء الاصطناعي يوفر عليّ ساعات من رسائل النزاعات كل شهر. ارتفع معدل استرداد الوديعة من 60% إلى 97%.",
    rating: 5,
    color: "#2563eb",
  },
  {
    nameEn: "Sara Fouad",
    nameAr: "سارة فؤاد",
    roleEn: "Fleet Owner · Alexandria, 8 vehicles",
    roleAr: "مالكة أسطول · الإسكندرية، 8 سيارات",
    quoteEn:
      "Finally a platform that understands fleet owners. The dashboard shows me which cars earn the most, and the AI Snap tool helps customers find my vehicles easily.",
    quoteAr:
      "أخيراً منصة تفهم أصحاب الأساطيل. تريني لوحة التحكم أي سيارات تجلب أعلى عائد، وأداة Snap تساعد العملاء في العثور على سياراتي بسهولة.",
    rating: 5,
    color: "#7c3aed",
  },
  {
    nameEn: "Omar Khalil",
    nameAr: "عمر خليل",
    roleEn: "Fleet Owner · Hurghada, 20 vehicles",
    roleAr: "مالك أسطول · الغردقة، 20 سيارة",
    quoteEn:
      "Switched from a manual system to AutoRent AI 6 months ago. Bookings doubled, disputes dropped to zero. The AI comparison tool brings in serious renters only.",
    quoteAr:
      "انتقلت من النظام اليدوي إلى AutoRent AI منذ 6 أشهر. تضاعفت الحجوزات وانعدمت النزاعات. أداة المقارنة الذكية تجذب المستأجرين الجادين فقط.",
    rating: 5,
    color: "#059669",
  },
  {
    nameEn: "Nadia Hassan",
    nameAr: "نادية حسن",
    roleEn: "Fleet Owner · Aswan, 5 vehicles",
    roleAr: "مالكة أسطول · أسوان، 5 سيارات",
    quoteEn:
      "The real-time notifications are a game changer. I know instantly when a car is returned and what condition it's in. No more waiting or guessing.",
    quoteAr:
      "الإشعارات الفورية قلبت الموازين. أعرف على الفور عندما تُرجع سيارة وفي أي حالة هي. لا انتظار ولا تخمين.",
    rating: 5,
    color: "#d97706",
  },
  {
    nameEn: "Karim Mansour",
    nameAr: "كريم منصور",
    roleEn: "Fleet Owner · Giza, 15 vehicles",
    roleAr: "مالك أسطول · الجيزة، 15 سيارة",
    quoteEn:
      "Listing a new car takes under 5 minutes. The platform handles everything — bookings, deposits, damage checks, payments. I focus on growing my fleet.",
    quoteAr:
      "إدراج سيارة جديدة يستغرق أقل من 5 دقائق. المنصة تتولى كل شيء — الحجوزات والودائع وفحص الأضرار والمدفوعات. أنا أركز على توسيع أسطولي.",
    rating: 4,
    color: "#0284c7",
  },
  {
    nameEn: "Heba Samy",
    nameAr: "هبة سامي",
    roleEn: "Fleet Owner · Sharm El-Sheikh, 10 vehicles",
    roleAr: "مالكة أسطول · شرم الشيخ، 10 سيارات",
    quoteEn:
      "Tourism season used to be stressful. Now with AutoRent AI managing my bookings, damage checks, and deposits, I actually enjoy the busy months.",
    quoteAr:
      "كان موسم السياحة مرهقاً. الآن مع AutoRent AI الذي يدير حجوزاتي وفحوصات الأضرار والودائع، أستمتع فعلاً بالأشهر المزدحمة.",
    rating: 5,
    color: "#dc2626",
  },
];

export default function HomePage() {
  const { lang, dir } = useLanguage();
  const T = t[lang];

  const AI_FEATURES = [
    { icon: "📸", title: T.snapTitle, description: T.snapDesc, badge: T.snapBadge, href: "/snap" },
    { icon: "🛡️", title: T.damageTitle, description: T.damageDesc, badge: T.damageBadge, href: "/damage" },
    { icon: "🏁", title: T.compareTitle, description: T.compareDesc, badge: T.compareBadge, href: "/compare" },
    { icon: "🤖", title: T.advisorTitle, description: T.advisorDesc, badge: T.advisorBadge, href: "#" },
  ];

  const FEATURES = [
    { icon: "⚡", title: T.feature1Title, description: T.feature1Desc },
    { icon: "🔐", title: T.feature2Title, description: T.feature2Desc },
    { icon: "💳", title: T.feature3Title, description: T.feature3Desc },
  ];

  const STATS = [
    { value: "500+", label: T.vehiclesListed },
    { value: "98%",  label: T.damageAccuracy },
    { value: "< 5s", label: T.aiTime },
    { value: "12K+", label: T.rentalsCompleted },
  ];

  const STEPS = [
    { title: T.step1Title, description: T.step1Desc },
    { title: T.step2Title, description: T.step2Desc },
    { title: T.step3Title, description: T.step3Desc },
  ];

  return (
    <div className="page-wrapper" dir={dir}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span>🤖</span> {T.poweredBy}
        </div>
        <h1 style={{ maxWidth: "800px", margin: "0 auto 1.5rem" }}>
          {T.heroTitle1}<br />
          <span style={{
            background: "var(--gradient-accent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {T.heroTitle2}
          </span>
        </h1>
        <p style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto 2.5rem", color: "var(--text-secondary)" }}>
          {T.heroDesc}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/fleet" className="btn btn-primary btn-lg">{T.browseFleetBtn}</Link>
          <Link href="/snap"  className="btn btn-secondary btn-lg">{T.snapIdentify}</Link>
        </div>
      </section>

      {/* ── AI Features ──────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>{T.aiFeaturesTitle}</h2>
            <p className="mt-2" style={{ maxWidth: "500px", margin: "0.5rem auto 0" }}>
              {T.aiFeaturesDesc}
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

      {/* ── Classic Features ─────────────────────────────────────────────── */}
      <section className="section-alt" style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>{T.whyTitle}</h2>
            <p className="mt-2" style={{ maxWidth: "500px", margin: "0.5rem auto 0" }}>
              {T.whyDesc}
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

      {/* ── Stats ────────────────────────────────────────────────────────── */}
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

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="section-alt" style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>{T.howItWorks}</h2>
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
                  boxShadow: "0 4px 20px var(--accent-glow)",
                }}>
                  {i + 1}
                </div>
                <h3>{step.title}</h3>
                <p className="text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet Owner Reviews ───────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>{T.reviewsTitle}</h2>
            <p className="mt-2" style={{ maxWidth: "540px", margin: "0.5rem auto 0" }}>
              {T.reviewsDesc}
            </p>
          </div>

          <div className="grid-3" style={{ gap: "1.5rem" }}>
            {REVIEWS.map((r) => (
              <div key={r.nameEn} className="review-card animate-fade-in">
                {/* Stars */}
                <StarRating rating={r.rating} />

                {/* Quote */}
                <p className="review-quote">
                  &ldquo;{lang === "ar" ? r.quoteAr : r.quoteEn}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="review-avatar"
                    style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}aa)` }}
                  >
                    {(lang === "ar" ? r.nameAr : r.nameEn)[0]}
                  </div>
                  <div>
                    <div className="review-name">{lang === "ar" ? r.nameAr : r.nameEn}</div>
                    <div className="review-role">{lang === "ar" ? r.roleAr : r.roleEn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section-alt" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div className="container">
          <div className="card" style={{
            padding: "4rem 2rem",
            maxWidth: "640px",
            margin: "0 auto",
            background: "linear-gradient(135deg, #eff6ff, #f8fafc)",
            borderColor: "rgba(37,99,235,0.15)",
          }}>
            <h2 style={{ marginBottom: "1rem" }}>{T.ctaTitle}</h2>
            <p className="text-secondary mb-6">{T.ctaDesc}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/auth/signup" className="btn btn-primary btn-lg">{T.createAccount}</Link>
              <Link href="/snap"        className="btn btn-secondary btn-lg">{T.trySnap}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", background: "var(--bg-surface)" }}>
        <div className="container">
          <div className="grid-3" style={{ gap: "2rem", alignItems: "start" }}>
            <div>
              <p className="logo mb-2">AutoRent AI</p>
              <p className="text-sm text-muted">{T.footerTagline}</p>
            </div>
            <div>
              <p className="text-xs text-muted font-bold mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {T.aiTools}
              </p>
              <div className="flex flex-col gap-1">
                <Link href="/snap"   className="text-sm text-secondary">📸 {T.snapTitle}</Link>
                <Link href="/damage" className="text-sm text-secondary">🛡️ {T.damageTitle}</Link>
                <Link href="/compare"className="text-sm text-secondary">🏁 {T.compareTitle}</Link>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted font-bold mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {T.platform}
              </p>
              <div className="flex flex-col gap-1">
                <Link href="/fleet"       className="text-sm text-secondary">{T.browseFleet}</Link>
                <Link href="/dashboard"   className="text-sm text-secondary">{T.dashboard}</Link>
                <Link href="/auth/signup" className="text-sm text-secondary">{T.createAccount}</Link>
              </div>
            </div>
          </div>
          <div className="divider" />
          <p className="text-muted text-sm text-center">{T.footerRights}</p>
        </div>
      </footer>
    </div>
  );
}
