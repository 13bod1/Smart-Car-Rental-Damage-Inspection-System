"use client";

import { useCallback, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface ValuationResult {
  identified: boolean;
  make: string | null;
  model: string | null;
  year: number | null;
  confidence: number;
  market_value: number | null;
  daily_rate: number | null;
  currency: string;
  color: string | null;
  body_type: string | null;
  engine_estimate: string | null;
  fuel_type: string | null;
  transmission: string | null;
  condition_estimate: string | null;
  fun_fact: string | null;
}

export default function SnapPage() {
  const { lang, dir, trans } = useLanguage();
  const [dragging, setDragging]     = useState(false);
  const [preview, setPreview]       = useState<string | null>(null);
  const [file, setFile]             = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<ValuationResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const identify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const resp = await fetch("/api/ai/identify", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || (lang === "ar" ? "خطأ في معالجة الذكاء الاصطناعي" : "AI engine error"));
      }
      const json = await resp.json();
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (lang === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="page-wrapper" dir={dir} style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
      <Navbar />

      <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "700px" }}>
        <div className="mb-6 text-center">
          <div className="hero-eyebrow" style={{ display: "inline-flex" }}>
            <span>🤖</span> {trans.snapHeader}
          </div>
          <h1>{trans.snapPageTitle}</h1>
          <p className="text-secondary mt-2">
            {trans.snapPageDesc}
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          id="snap-upload-zone"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" style={{ maxHeight: "300px", borderRadius: "12px", objectFit: "contain" }} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span style={{ fontSize: "4rem" }}>📸</span>
              <p className="font-semibold">{trans.snapDropzone}</p>
              <p className="text-sm text-muted">{trans.snapDropzoneSub}</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          id="snap-file-input"
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={onFileInput}
        />

        {file && !loading && !result && (
          <button id="identify-btn" className="btn btn-primary w-full mt-4 btn-lg" onClick={identify}>
            {trans.identifyCarBtn}
          </button>
        )}

        {loading && (
          <div className="card flex flex-col items-center gap-4 mt-4" style={{ padding: "3rem" }}>
            <div className="spinner animate-pulse-glow" />
            <p className="text-secondary">{trans.snapAnalyzing}</p>
            <p className="text-xs text-muted">{trans.snapAnalyzingSub}</p>
          </div>
        )}

        {error && (
          <div className="card mt-4" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            <p className="text-danger">⚠️ {error}</p>
            <button className="btn btn-secondary btn-sm mt-2" onClick={reset}>{trans.tryAgain}</button>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="card animate-fade-in mt-4">
            {result.identified && result.make !== "Unknown" && result.make ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ fontSize: "3rem" }}>🚗</span>
                  <div>
                    <h2>{result.year} {result.make} {result.model}</h2>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="badge badge-info">
                        {((result.confidence || 0) * 100).toFixed(0)}% {trans.confidence}
                      </span>
                      {result.color && <span className="badge badge-neutral">{result.color}</span>}
                      {result.body_type && <span className="badge badge-neutral">{result.body_type}</span>}
                    </div>
                  </div>
                </div>

                <div className="divider" />

                {/* Pricing */}
                <div className="grid-2">
                  <div className="stat-card">
                    <div className="stat-label">{trans.marketValuation}</div>
                    <div className="stat-value text-accent">
                      {result.market_value ? formatCurrency(result.market_value) : "—"}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">{trans.dailyRentalRate}</div>
                    <div className="stat-value" style={{ color: "var(--success)" }}>
                      {result.daily_rate ? formatCurrency(result.daily_rate) : "—"}
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>{trans.perDay}</span>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="divider" />
                <h3 style={{ marginBottom: "0.75rem" }}>{trans.vehicleSpecs}</h3>
                <div className="grid-2" style={{ gap: "0.5rem" }}>
                  {result.engine_estimate && (
                    <div className="flex gap-2 items-center">
                      <span>⚙️</span>
                      <span className="text-sm">{result.engine_estimate}</span>
                    </div>
                  )}
                  {result.fuel_type && (
                    <div className="flex gap-2 items-center">
                      <span>⛽</span>
                      <span className="text-sm">{result.fuel_type}</span>
                    </div>
                  )}
                  {result.transmission && (
                    <div className="flex gap-2 items-center">
                      <span>🔧</span>
                      <span className="text-sm">{result.transmission}</span>
                    </div>
                  )}
                  {result.condition_estimate && (
                    <div className="flex gap-2 items-center">
                      <span>✅</span>
                      <span className="text-sm">{result.condition_estimate}</span>
                    </div>
                  )}
                </div>

                {/* Fun Fact */}
                {result.fun_fact && (
                  <>
                    <div className="divider" />
                    <div style={{
                      background: "rgba(59,130,246,0.08)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                    }}>
                      <p className="text-sm" style={{ color: "var(--accent-light)" }}>
                        💡 <strong>{trans.funFactTitle}:</strong> {result.fun_fact}
                      </p>
                    </div>
                  </>
                )}

                <button className="btn btn-secondary w-full mt-4" onClick={reset}>
                  {trans.tryAgain}
                </button>
              </>
            ) : (
              <div className="text-center" style={{ padding: "2rem" }}>
                <span style={{ fontSize: "3rem" }}>🤷</span>
                <h3 className="mt-4">{lang === "ar" ? "تعذر التعرف بدقة على هذه السيارة" : "Could not identify this vehicle"}</h3>
                <p className="text-secondary mt-2">{lang === "ar" ? "يرجى تجربة صورة أوضح تظهر مقدمة أو جانب السيارة." : "Try a clearer photo showing the front or side of the car."}</p>
                <button className="btn btn-secondary mt-4" onClick={reset}>
                  {trans.tryAgain}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
