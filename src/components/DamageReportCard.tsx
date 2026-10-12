"use client";

import { AIDamageReport } from "@/lib/types";
import { formatCurrency, getSeverityColor } from "@/lib/utils";

interface DamageReportCardProps {
  report: AIDamageReport;
}

const SEVERITY_ICONS: Record<string, string> = {
  none:     "✅",
  minor:    "⚠️",
  moderate: "🔶",
  severe:   "🚨",
};

const STRATEGY_LABELS: Record<string, string> = {
  full_refund:       "Full Deposit Refund",
  partial_deduction: "Partial Deduction",
  full_confiscation: "Deposit Confiscated",
};

export function DamageReportCard({ report }: DamageReportCardProps) {
  const isProcessing = report.status === "processing" || report.status === "pending";

  return (
    <div className="card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">🤖 AI Damage Report</h3>
        <span className={`badge ${
          report.status === "completed" ? "badge-success" :
          report.status === "failed"    ? "badge-error"   :
          "badge-warning"
        }`}>
          {report.status}
        </span>
      </div>

      {isProcessing && (
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="spinner animate-pulse-glow" />
          <p className="text-secondary text-sm">AI is analyzing vehicle photos…</p>
        </div>
      )}

      {report.status === "failed" && (
        <div className="card" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <p className="text-danger">Analysis failed. Please retry or contact support.</p>
        </div>
      )}

      {report.status === "completed" && (
        <>
          {/* Severity */}
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: "2.5rem" }}>
              {SEVERITY_ICONS[report.severity || "none"]}
            </span>
            <div>
              <div className={`font-bold text-sm ${getSeverityColor(report.severity)}`} style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {report.severity || "none"} damage
              </div>
              {report.confidence_score !== null && (
                <div className="text-xs text-muted">
                  Confidence: {((report.confidence_score || 0) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* Damage Zones */}
          {report.damage_zones && Object.keys(report.damage_zones).length > 0 && (
            <div className="mb-4">
              <div className="label mb-2">Damage Zones</div>
              <div className="damage-zone-grid">
                {Object.entries(report.damage_zones).map(([zone, type]) => (
                  <div key={zone} className="damage-zone-chip">
                    <div className="damage-zone-name">{zone.replace(/_/g, " ")}</div>
                    <div className="damage-zone-type">{type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost & Strategy */}
          <div className="divider" />
          <div className="grid-2">
            <div className="stat-card">
              <div className="stat-label">Repair Cost</div>
              <div className="stat-value text-danger">
                {formatCurrency(report.estimated_cost_egp || 0)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Deposit Decision</div>
              <div className="font-bold" style={{ color: "var(--accent-light)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                {STRATEGY_LABELS[report.strategy_applied || "full_refund"]}
              </div>
            </div>
          </div>

          {report.processed_at && (
            <p className="text-xs text-muted mt-4">
              Processed at {new Date(report.processed_at).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
