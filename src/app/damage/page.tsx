"use client";

import { useCallback, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

interface DamageZone {
  zone: string;
  type: string;
  severity: string;
  estimated_repair_cost_egp: number;
  description: string;
}

interface DamageResult {
  damage_detected: boolean;
  severity: string;
  overall_condition: string;
  confidence: number;
  damage_zones: DamageZone[];
  total_repair_cost_egp: number;
  deposit_recommendation: string;
  summary: string;
  tips: string[];
}

export default function DamageScannerPage() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DamageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const scanDamage = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const resp = await fetch("/api/ai/damage", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "AI damage scan failed");
      }
      setResult(await resp.json());
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Something went wrong");
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

  const severityColor = (s: string) => {
    switch (s) {
      case "none": return "var(--success)";
      case "minor": return "var(--warning)";
      case "moderate": return "#f97316";
      case "severe": return "var(--danger)";
      default: return "var(--text-muted)";
    }
  };

  const depositLabel = (d: string) => {
    switch (d) {
      case "full_refund": return { text: "Full Refund", color: "var(--success)", icon: "✅" };
      case "partial_deduction": return { text: "Partial Deduction", color: "var(--warning)", icon: "⚠️" };
      case "full_confiscation": return { text: "Full Confiscation", color: "var(--danger)", icon: "🚫" };
      default: return { text: d, color: "var(--text-muted)", icon: "❓" };
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "750px" }}>
        <div className="mb-6 text-center">
          <div className="hero-eyebrow" style={{ display: "inline-flex" }}>
            <span>🛡️</span> AI Damage Assessment
          </div>
          <h1>🔍 Damage Scanner</h1>
          <p className="text-secondary mt-2">
            Upload a photo of any vehicle and our AI will detect damage, estimate repair costs, and recommend deposit actions.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          id="damage-upload-zone"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" style={{ maxHeight: "300px", borderRadius: "12px", objectFit: "contain" }} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span style={{ fontSize: "4rem" }}>🔍</span>
              <p className="font-semibold">Drop a car photo to scan for damage</p>
              <p className="text-sm text-muted">Front, rear, left, or right angles work best</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          id="damage-file-input"
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={onFileInput}
        />

        {file && !loading && !result && (
          <button id="scan-damage-btn" className="btn btn-primary w-full mt-4 btn-lg" onClick={scanDamage}>
            🛡️ Scan for Damage
          </button>
        )}

        {loading && (
          <div className="card flex flex-col items-center gap-4 mt-4" style={{ padding: "3rem" }}>
            <div className="spinner animate-pulse-glow" />
            <p className="text-secondary">AI is analyzing the vehicle for damage…</p>
            <p className="text-xs text-muted">Checking for scratches, dents, cracks, and more</p>
          </div>
        )}

        {error && (
          <div className="card mt-4" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            <p className="text-danger">⚠️ {error}</p>
            <button className="btn btn-secondary btn-sm mt-2" onClick={reset}>Try Again</button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-in mt-4 flex flex-col gap-4">
            {/* Overall Status */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span style={{
                  fontSize: "3rem",
                  filter: result.damage_detected ? "none" : "grayscale(0)",
                }}>
                  {result.damage_detected ? "⚠️" : "✅"}
                </span>
                <div>
                  <h2 style={{ color: severityColor(result.severity) }}>
                    {result.damage_detected ? `${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} Damage Detected` : "No Damage Detected!"}
                  </h2>
                  <p className="text-sm text-secondary">{result.overall_condition}</p>
                  <span className="badge badge-info mt-1">
                    {((result.confidence || 0) * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>

              <p className="text-secondary text-sm">{result.summary}</p>
            </div>

            {/* Damage Zones */}
            {result.damage_zones && result.damage_zones.length > 0 && (
              <div className="card">
                <h3 className="mb-4">Damage Zones</h3>
                <div className="flex flex-col gap-3">
                  {result.damage_zones.map((zone, i) => (
                    <div key={i} style={{
                      background: "rgba(239,68,68,0.05)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                    }}>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <span className="font-bold">{zone.zone}</span>
                          <span className="text-sm text-muted"> — {zone.type}</span>
                        </div>
                        <span className="badge" style={{
                          background: `${severityColor(zone.severity)}20`,
                          color: severityColor(zone.severity),
                          border: `1px solid ${severityColor(zone.severity)}40`,
                        }}>
                          {zone.severity}
                        </span>
                      </div>
                      <p className="text-sm text-secondary mt-1">{zone.description}</p>
                      <p className="text-sm mt-1" style={{ color: "var(--danger)" }}>
                        Estimated repair: <strong>{formatCurrency(zone.estimated_repair_cost_egp)}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost & Deposit */}
            <div className="grid-2">
              <div className="stat-card">
                <div className="stat-label">Total Repair Cost</div>
                <div className="stat-value" style={{ color: result.total_repair_cost_egp > 0 ? "var(--danger)" : "var(--success)" }}>
                  {formatCurrency(result.total_repair_cost_egp || 0)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Deposit Action</div>
                <div className="stat-value" style={{ fontSize: "1.2rem", color: depositLabel(result.deposit_recommendation).color }}>
                  {depositLabel(result.deposit_recommendation).icon} {depositLabel(result.deposit_recommendation).text}
                </div>
              </div>
            </div>

            {/* Tips */}
            {result.tips && result.tips.length > 0 && (
              <div className="card" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
                <h3 className="mb-3">💡 Pro Tips</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-secondary flex gap-2">
                      <span style={{ color: "var(--accent-light)" }}>→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn btn-secondary w-full" onClick={reset}>
              🔍 Scan Another Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
