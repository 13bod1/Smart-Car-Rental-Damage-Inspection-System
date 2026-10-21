"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/LanguageContext";
import {
  CAR_DATABASE,
  CAR_GROUPS,
  POPULAR_BATTLES,
  PresetBattle,
  CarDatabaseItem,
} from "@/data/carsDatabase";

interface ComparisonCar {
  car: string;
  pros: string[];
  cons: string[];
  best_for: string;
  estimated_daily_rate_egp: number;
  estimated_value_egp: number;
  fuel_economy: string;
  comfort_rating: number;
  value_rating: number;
  reliability_rating: number;
}

interface CompareResult {
  comparison: ComparisonCar[];
  recommendation: string;
  summary: string;
}

const BATTLE_TITLES_AR: Record<string, { title: string; desc: string }> = {
  "egypt-legends": {
    title: "أساطير شوارع مصر",
    desc: "ملوك الأسفلت المصري الخالدين: بيجو 504 ضد مرسيدس الخنزيرة ضد فيات 128",
  },
  "daily-commuter": {
    title: "الأكثر مبيعاً في مصر",
    desc: "مقارنة جنباً إلى جنب لأفضل السيارات الاقتصادية اليومية في شوارع مصر",
  },
  "suv-titans": {
    title: "عمالقة الدفع الرباعي والصحراء",
    desc: "ملوك الطرق الوعرة المصممون لكثبان الصحراء وطرق سيناء السريعة",
  },
  "ev-future": {
    title: "مواجهة السيارات الكهربائية",
    desc: "أحدث ابتكارات الطاقة الكهربائية: تسلا ضد بي واي دي ضد بورشه",
  },
  "german-luxury": {
    title: "قمة الفخامة الألمانية",
    desc: "أعلى درجات الرفاهية والراحة والهيبة التنفيذية على الإطلاق",
  },
  "jdm-legends": {
    title: "العصر الذهبي للسيارات اليابانية",
    desc: "أيقونات يابانية أسطورية غيرت ثقافة وهندسة السيارات الرياضية",
  },
};

const CAR_GROUP_NAMES_AR: Record<string, string> = {
  "🇪🇬 Egyptian Street Icons & Classics": "🇪🇬 أيقونات وكلاسيكيات مصرية",
  "🚗 Everyday Commuters & Sedans": "🚗 سيارات سيدان واقتصادية",
  "🚙 SUVs & Crossovers": "🚙 دفع رباعي وكروس أوفر",
  "👑 Luxury & Executive Saloons": "👑 سيارات فارهة وتنفيذية",
  "⚡ Electric & Hybrid (EV)": "⚡ سيارات كهربائية وهجينة",
  "🏎️ Sports, Supercars & Icons": "🏎️ سيارات رياضية وخارقة",
  "🛻 Pickups, Vans & People Movers": "🛻 بيك أب وحافلات عائلية",
};

export default function ComparePage() {
  const { lang, dir, trans } = useLanguage();
  const [selectedCars, setSelectedCars] = useState<string[]>([
    "Toyota Camry 2.5 Grande (2024)",
    "Peugeot 504 Break Station Wagon (1979)",
    'Mercedes-Benz 200D W123 "El-Khanzeera" (1984)',
  ]);
  const [customInputMode, setCustomInputMode] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter cars database based on active category filter and search query
  const filteredCars = useMemo(() => {
    return CAR_DATABASE.filter((car) => {
      const matchesCategory =
        activeCategoryFilter === "All" || car.group === activeCategoryFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.origin.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategoryFilter, searchQuery]);

  // Group filtered cars for optgroup rendering
  const groupedFilteredCars = useMemo(() => {
    const groups: Record<string, CarDatabaseItem[]> = {};
    for (const car of filteredCars) {
      if (!groups[car.group]) groups[car.group] = [];
      groups[car.group].push(car);
    }
    return groups;
  }, [filteredCars]);

  const updateCar = (index: number, value: string) => {
    const next = [...selectedCars];
    next[index] = value;
    setSelectedCars(next);
  };

  const addCarSlot = () => {
    if (selectedCars.length < 4) {
      setSelectedCars([...selectedCars, ""]);
    }
  };

  const removeCarSlot = (index: number) => {
    if (selectedCars.length > 2) {
      setSelectedCars(selectedCars.filter((_, i) => i !== index));
    }
  };

  const loadPreset = (battle: PresetBattle) => {
    setSelectedCars([...battle.cars]);
    setResult(null);
    setError(null);
  };

  const surpriseMe = () => {
    const shuffled = [...CAR_DATABASE].sort(() => 0.5 - Math.random());
    const count = Math.random() > 0.5 ? 3 : 2;
    setSelectedCars(shuffled.slice(0, count).map((c) => c.name));
    setResult(null);
    setError(null);
  };

  const compare = async () => {
    const cars = selectedCars.map((c) => c.trim()).filter(Boolean);
    if (cars.length < 2) {
      setError(lang === "ar" ? "يرجى اختيار أو كتابة سيارتين على الأقل للمقارنة." : "Please select or type at least 2 cars to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cars }),
      });
      if (!resp.ok) throw new Error("Comparison failed");
      const data = await resp.json();
      setResult(data);
    } catch {
      setError(lang === "ar" ? "فشلت المقارنة بالذكاء الاصطناعي. يرجى المحاولة لاحقاً." : "AI comparison failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RatingBar = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-2" style={{ marginBottom: "0.35rem" }}>
      <span className="text-xs text-muted" style={{ width: "85px", fontWeight: 500 }}>
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: "6px",
          background: "var(--border)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, value * 10))}%`,
            height: "100%",
            background:
              value >= 8
                ? "var(--success)"
                : value >= 6
                ? "var(--warning)"
                : "var(--danger)",
            borderRadius: "3px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span
        className="text-xs font-bold"
        style={{
          width: "24px",
          textAlign: "right",
          color:
            value >= 8
              ? "var(--success)"
              : value >= 6
              ? "var(--warning)"
              : "var(--danger)",
        }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="page-wrapper" dir={dir} style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
      <Navbar />

      <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "1150px" }}>
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="hero-eyebrow" style={{ display: "inline-flex" }}>
            <span>⚡</span> {lang === "ar" ? `أكثر من ${CAR_DATABASE.length}+ سيارة متاحة` : `Over ${CAR_DATABASE.length}+ Cars Available`}
          </div>
          <h1>🏁 {trans.compareHeader}</h1>
          <p className="text-secondary mt-2" style={{ maxWidth: "680px", margin: "0.5rem auto 0" }}>
            {trans.compareSubtitle}
          </p>
        </div>

        {/* Popular Battle Presets */}
        <div className="card mb-6" style={{ background: "var(--bg-elevated)" }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 style={{ fontSize: "1.1rem" }}>
                {lang === "ar" ? "🔥 مواجهات جاهزة ومميزة" : "🔥 Popular Matchup Presets"}
              </h3>
              <p className="text-xs text-muted">
                {lang === "ar"
                  ? "مواجهات بنقرة واحدة تم انتقاؤها بواسطة خبراء وعشاق سيارات وسائقي القاهرة"
                  : "1-click instant battles curated by car enthusiasts and Cairo drivers"}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={surpriseMe}
              title={lang === "ar" ? "اختر سيارتين أو 3 سيارات عشوائية من مختلف العصور" : "Pick 2 or 3 random cars from across all eras"}
            >
              {lang === "ar" ? "🎲 مواجهة عشوائية" : "🎲 Surprise Matchup"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {POPULAR_BATTLES.map((b) => {
              const arInfo = BATTLE_TITLES_AR[b.id];
              const title = lang === "ar" && arInfo ? arInfo.title : b.title;
              const desc = lang === "ar" && arInfo ? arInfo.desc : b.description;
              return (
                <button
                  key={b.id}
                  type="button"
                  className="card card-glass"
                  onClick={() => loadPreset(b)}
                  style={{
                    padding: "0.85rem",
                    cursor: "pointer",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    transition: "var(--transition)",
                    textAlign: dir === "rtl" ? "right" : "left",
                    background: "var(--bg-surface)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-light)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: "1.2rem" }}>{b.emoji}</span>
                    <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {title}
                    </span>
                  </div>
                  <p className="text-xs text-muted" style={{ lineHeight: "1.3" }}>
                    {desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Car Selection Form */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3>{lang === "ar" ? "اختر حتى 4 سيارات للمقارنة" : "Choose Up to 4 Cars to Compare"}</h3>
              <p className="text-xs text-muted">
                {lang === "ar"
                  ? `اختر من قاعدة بياناتنا التي تضم ${CAR_DATABASE.length} طرازاً أو اكتب أسماء مخصصة`
                  : `Select from our database of ${CAR_DATABASE.length} models or type custom car names`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCars.length < 4 && (
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={addCarSlot}
                >
                  {lang === "ar" ? "➕ إضافة سيارة أخرى" : "➕ Add Another Car"}
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary text-xs"
                onClick={() => setCustomInputMode(!customInputMode)}
              >
                {customInputMode
                  ? (lang === "ar" ? "📋 التبديل إلى الكتالوج الجاهز" : "📋 Switch to Preset Catalog")
                  : (lang === "ar" ? "✏️ كتابة أسماء سيارات مخصصة" : "✏️ Type Custom Car Names")}
              </button>
            </div>
          </div>

          {/* Quick Filter Bar for Preset Catalog */}
          {!customInputMode && (
            <div
              style={{
                marginBottom: "1.25rem",
                padding: "0.85rem",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <input
                  type="text"
                  className="input text-sm"
                  placeholder={
                    lang === "ar"
                      ? "🔍 اكتب الماركة أو الطراز للتصفية (مثل Corolla, 504, 911, Tesla, Patrol, BMW)..."
                      : "🔍 Type make or model to filter (e.g. Corolla, 504, 911, Tesla, Patrol, BMW)..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, minWidth: "220px", padding: "0.5rem 0.75rem" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-secondary text-xs"
                    onClick={() => setSearchQuery("")}
                  >
                    {lang === "ar" ? "مسح التصفية" : "Clear Filter"}
                  </button>
                )}
                <span className="text-xs text-muted" style={{ whiteSpace: "nowrap" }}>
                  {lang === "ar"
                    ? `عرض ${filteredCars.length} من أصل ${CAR_DATABASE.length} سيارة`
                    : `Showing ${filteredCars.length} of ${CAR_DATABASE.length} cars`}
                </span>
              </div>

              {/* Category Pills */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  overflowX: "auto",
                  paddingBottom: "0.25rem",
                  scrollbarWidth: "thin",
                }}
              >
                <button
                  type="button"
                  className={`btn text-xs ${activeCategoryFilter === "All" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                  onClick={() => setActiveCategoryFilter("All")}
                >
                  {lang === "ar" ? `الكل (${CAR_DATABASE.length})` : `All (${CAR_DATABASE.length})`}
                </button>
                {CAR_GROUPS.map((grp) => {
                  const count = CAR_DATABASE.filter((c) => c.group === grp).length;
                  const isActive = activeCategoryFilter === grp;
                  const label = lang === "ar" && CAR_GROUP_NAMES_AR[grp] ? CAR_GROUP_NAMES_AR[grp] : `${grp.split(" ")[0]} ${grp.replace(/^[^\s]+\s*/, "")}`;
                  return (
                    <button
                      key={grp}
                      type="button"
                      className={`btn text-xs ${isActive ? "btn-primary" : "btn-secondary"}`}
                      style={{
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => setActiveCategoryFilter(grp)}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Car Slots Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                selectedCars.length === 4
                  ? "repeat(auto-fit, minmax(220px, 1fr))"
                  : selectedCars.length === 2
                  ? "repeat(auto-fit, minmax(280px, 1fr))"
                  : "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
            }}
          >
            {selectedCars.map((car, idx) => (
              <div
                className="form-group"
                key={idx}
                style={{
                  background: "var(--bg-elevated)",
                  padding: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="label" style={{ margin: 0 }}>
                    {lang === "ar" ? `السيارة ${idx + 1}` : `Car ${idx + 1}`}
                  </label>
                  {selectedCars.length > 2 && (
                    <button
                      type="button"
                      className="text-xs text-danger"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => removeCarSlot(idx)}
                      title={lang === "ar" ? "حذف هذا الخيار" : "Remove this slot"}
                    >
                      {lang === "ar" ? "✕ حذف" : "✕ Remove"}
                    </button>
                  )}
                </div>

                {customInputMode ? (
                  <input
                    type="text"
                    className="input"
                    value={car}
                    placeholder={`e.g. ${idx === 0 ? "Toyota Camry (2024)" : idx === 1 ? "Peugeot 504 (1979)" : "Mercedes 200D (1984)"}`}
                    onChange={(e) => updateCar(idx, e.target.value)}
                  />
                ) : (
                  <select
                    className="select input"
                    value={car}
                    onChange={(e) => updateCar(idx, e.target.value)}
                  >
                    <option value="">{lang === "ar" ? "اختر سيارة…" : "Select a car…"}</option>
                    {car && !filteredCars.some((c) => c.name === car) && (
                      <option value={car}>{car} {lang === "ar" ? "(المحددة حالياً)" : "(Currently Selected)"}</option>
                    )}
                    {Object.entries(groupedFilteredCars).map(([groupName, items]) => (
                      <optgroup key={groupName} label={lang === "ar" && CAR_GROUP_NAMES_AR[groupName] ? CAR_GROUP_NAMES_AR[groupName] : groupName}>
                        {items.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} — {c.category}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg w-full mt-6"
            onClick={compare}
            disabled={loading || selectedCars.filter(Boolean).length < 2}
            style={{ fontSize: "1.05rem", padding: "0.85rem" }}
          >
            {loading
              ? (lang === "ar" ? "جارٍ تحليل مواصفات السوق المصري بالذكاء الاصطناعي…" : "Analyzing Egyptian Market Specs…")
              : (lang === "ar" ? `🏁 مقارنة ${selectedCars.filter(Boolean).length} سيارات الآن` : `🏁 Compare ${selectedCars.filter(Boolean).length} Cars`)}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="card mb-4"
            style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}
          >
            <p className="text-danger">⚠️ {error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="card flex flex-col items-center gap-4" style={{ padding: "3rem" }}>
            <div className="spinner animate-pulse-glow" />
            <p className="text-secondary">
              {lang === "ar"
                ? "تقييم اقتصاديات الإيجار، ملاءمة الطرق، استهلاك وقود القاهرة، والقيم السوقية في مصر…"
                : "Evaluating rental economics, road compliance, Cairo fuel costs, and Egyptian resale values…"}
            </p>
          </div>
        )}

        {/* Comparison Results */}
        {result && (
          <div className="animate-fade-in flex flex-col gap-4">
            {/* Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  result.comparison.length === 4
                    ? "repeat(auto-fit, minmax(240px, 1fr))"
                    : result.comparison.length === 2
                    ? "repeat(auto-fit, minmax(320px, 1fr))"
                    : "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {result.comparison.map((car, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderTop: "3px solid var(--accent)",
                  }}
                >
                  <div>
                    <span className="badge badge-info text-xs mb-1" style={{ display: "inline-block" }}>
                      {lang === "ar" ? `سيارة ${i + 1}` : `Car ${i + 1}`}
                    </span>
                    <h3 style={{ fontSize: "1.15rem", lineHeight: "1.3" }}>{car.car}</h3>
                  </div>

                  {/* Financial Stats */}
                  <div className="grid-2" style={{ gap: "0.5rem" }}>
                    <div className="stat-card" style={{ padding: "1rem" }}>
                      <div className="stat-label">{trans.dailyRentalRate}</div>
                      <div className="stat-value text-accent" style={{ fontSize: "1.15rem" }}>
                        {car.estimated_daily_rate_egp?.toLocaleString()} EGP
                      </div>
                    </div>
                    <div className="stat-card" style={{ padding: "1rem" }}>
                      <div className="stat-label">{trans.marketValuation}</div>
                      <div
                        className="stat-value"
                        style={{ fontSize: "1.15rem", color: "var(--success)" }}
                      >
                        {car.estimated_value_egp?.toLocaleString()} EGP
                      </div>
                    </div>
                  </div>

                  {/* Rating Bars */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <RatingBar value={car.comfort_rating} label={trans.comfortRating} />
                    <RatingBar value={car.value_rating} label={trans.valueRating} />
                    <RatingBar value={car.reliability_rating} label={trans.reliabilityRating} />
                  </div>

                  {/* Key Highlights */}
                  <div>
                    <p className="text-xs text-muted mb-1 font-semibold">
                      ⛽ {car.fuel_economy}
                    </p>
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(59, 130, 246, 0.08)",
                        borderInlineStart: "3px solid var(--accent)",
                      }}
                    >
                      <p className="text-xs text-muted" style={{ margin: 0 }}>
                        {trans.bestFor}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "var(--accent-light)", margin: 0 }}>
                        {car.best_for}
                      </p>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div>
                    <p className="text-xs text-muted mb-1 font-bold">{trans.pros}</p>
                    {car.pros.map((p, j) => (
                      <p
                        key={j}
                        className="text-sm"
                        style={{ color: "var(--success)", marginBottom: "0.25rem", lineHeight: "1.3" }}
                      >
                        ✓ {p}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1 font-bold">{trans.cons}</p>
                    {car.cons.map((c, j) => (
                      <p
                        key={j}
                        className="text-sm"
                        style={{ color: "var(--danger)", marginBottom: "0.25rem", lineHeight: "1.3" }}
                      >
                        ✗ {c}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Verdict */}
            <div
              className="card"
              style={{
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.04))",
                borderColor: "rgba(37,99,235,0.25)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "1.4rem" }}>🎯</span>
                <h3 style={{ color: "var(--primary)", margin: 0 }}>{trans.aiRecommendation}</h3>
              </div>
              <p className="text-secondary" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                {result.recommendation}
              </p>
              {result.summary && (
                <p className="text-xs text-muted mt-3" style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                  💡 {result.summary}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
