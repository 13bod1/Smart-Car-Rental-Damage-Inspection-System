"use client";

import { AIDamageReport } from "@/lib/types";
import { formatCurrency, getSeverityColor } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface DamageReportCardProps {
  report: AIDamageReport;
}

const SEVERITY_ICONS: Record<string, string> = {
  none:     "✅",
  minor:    "⚠️",
  moderate: "🔶",
  severe:   "🚨",
};

export function DamageReportCard({ report }: DamageReportCardProps) {
  const { lang, dir, trans } = useLanguage();
  const isProcessing = report.status === "processing" || report.status === "pending";

  const getStrategyLabel = (strat: string) => {
    switch (strat) {
      case "full_refund":
        return trans.fullRefund;
      case "partial_deduction":
        return trans.partialDeduction;
      case "full_confiscation":
        return trans.fullConfiscation;
      default:
        return strat;
    }
  };

  const getSeverityName = (s: string) => {
    if (lang !== "ar") return `${s} damage`;
    switch (s) {
      case "none": return "بدون أضرار (سليم)";
      case "minor": return "أضرار بسيطة";
      case "moderate": return "أضرار متوسطة";
      case "severe": return "أضرار بليغة / شديدة";
      default: return s;
    }
  };

  return (
    <div className="card animate-fade-in" dir={dir} style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">🤖 {lang === "ar" ? "تقرير فحص الأضرار بالذكاء الاصطناعي" : "AI Damage Report"}</h3>
        <span className={`badge ${
          report.status === "completed" ? "badge-success" :
          report.status === "failed"    ? "badge-error"   :
          "badge-warning"
        }`}>
          {lang === "ar" && report.status === "completed" ? "مكتمل" : report.status}
        </span>
      </div>

      {isProcessing && (
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="spinner animate-pulse-glow" />
          <p className="text-secondary text-sm">
            {lang === "ar" ? "الذكاء الاصطناعي يحلل صور المركبة بعناية…" : "AI is analyzing vehicle photos…"}
          </p>
        </div>
      )}

      {report.status === "failed" && (
        <div className="card" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <p className="text-danger">
            {lang === "ar" ? "فشل التحليل. يرجى إعادة المحاولة أو التواصل مع الدعم." : "Analysis failed. Please retry or contact support."}
          </p>
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
                {getSeverityName(report.severity || "none")}
              </div>
              {report.confidence_score !== null && (
                <div className="text-xs text-muted">
                  {trans.confidence}: {((report.confidence_score || 0) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* Damage Zones */}
          {report.damage_zones && Object.keys(report.damage_zones).length > 0 && (
            <div className="mb-4">
              <div className="label mb-2">{lang === "ar" ? "مناطق الأضرار" : "Damage Zones"}</div>
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
              <div className="stat-label">{trans.estimatedRepair}</div>
              <div className="stat-value text-danger">
                {formatCurrency(report.estimated_cost_egp || 0)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{trans.depositAction}</div>
              <div className="font-bold" style={{ color: "var(--accent-light)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                {getStrategyLabel(report.strategy_applied || "full_refund")}
              </div>
            </div>
          </div>

          {report.processed_at && (
            <p className="text-xs text-muted mt-4">
              {lang === "ar" ? "تاريخ المعالجة: " : "Processed at "}
              {new Date(report.processed_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
