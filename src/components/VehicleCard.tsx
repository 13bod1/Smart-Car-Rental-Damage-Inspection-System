"use client";

import { Vehicle } from "@/lib/types";
import { formatCurrency, getStatusBadgeClass, getVehicleImage } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const CATEGORY_ICONS: Record<string, string> = {
  economy:  "🚗",
  standard: "🚙",
  luxury:   "🏎️",
  suv:      "🚐",
  van:      "🚌",
};

const STATUS_LABELS_AR: Record<string, string> = {
  available:   "متاح",
  rented:      "مستأجر",
  maintenance: "صيانة",
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  economy:  "اقتصادي",
  standard: "سيدان / قياسي",
  luxury:   "فاخر / رياضي",
  suv:      "دفع رباعي / SUV",
  van:      "فان / حافلة",
};

const COLOR_LABELS_AR: Record<string, string> = {
  "Pearl White": "أبيض لؤلؤي",
  "Midnight Black": "أسود ملكي",
  "Graphite Grey": "رمادي جرافيت",
  "Silver Metallic": "فضي ميتاليك",
  "Sunset Orange": "برتقالي غروب",
  "Deep Blue": "أزرق داكن",
  "Red": "أحمر",
  "Blue": "أزرق",
  "White": "أبيض",
  "Black": "أسود",
  "Grey": "رمادي",
  "Silver": "فضي",
};

const FEATURE_LABELS_AR: Record<string, string> = {
  "Bluetooth": "بلوتوث",
  "Backup Camera": "كاميرا خلفية",
  "Air Conditioning": "تكييف هواء",
  "Apple CarPlay": "أبل كاربلاي",
  "Android Auto": "أندرويد أوتو",
  "GPS Navigation": "نظام ملاحة GPS",
  "Sunroof": "فتحة سقف",
  "Leather Seats": "مقاعد جلدية",
  "Cruise Control": "مثبت سرعة",
  "Heated Seats": "تدفئة مقاعد",
  "Parking Sensors": "حساسات ركن",
  "Keyless Entry": "دخول ذكي",
  "USB Charging": "شاحن USB",
  "Lane Assist": "تحديد المسار",
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { lang } = useLanguage();
  const T = t[lang];
  const displayImage = getVehicleImage(vehicle.make, vehicle.model, vehicle.year || 2023, vehicle.thumbnail_url);

  const statusLabel = lang === "ar"
    ? (STATUS_LABELS_AR[vehicle.status] || vehicle.status)
    : vehicle.status;

  const categoryLabel = lang === "ar"
    ? (CATEGORY_LABELS_AR[vehicle.category] || vehicle.category)
    : vehicle.category;

  const colorLabel = vehicle.color
    ? (lang === "ar" ? (COLOR_LABELS_AR[vehicle.color] || vehicle.color) : vehicle.color)
    : null;

  return (
    <Link href={`/fleet/${vehicle.id}`} style={{ textDecoration: "none" }}>
      <article className="vehicle-card animate-fade-in" style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="vehicle-card-image"
          />
        ) : (
          <div className="vehicle-card-image-placeholder">
            {CATEGORY_ICONS[vehicle.category] || "🚗"}
          </div>
        )}

        <div className="vehicle-card-body">
          <div className="flex justify-between items-center">
            <h3 className="vehicle-card-title">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <span className={`badge badge-${getStatusBadgeClass(vehicle.status)}`}>
              {statusLabel}
            </span>
          </div>

          <div className="vehicle-card-meta">
            <span className="badge badge-neutral">{categoryLabel}</span>
            {colorLabel && (
              <span className="badge badge-neutral">🎨 {colorLabel}</span>
            )}
            <span className="badge badge-neutral">📍 {vehicle.plate_number}</span>
          </div>

          {vehicle.features && vehicle.features.length > 0 && (
            <div className="vehicle-card-meta">
              {vehicle.features.slice(0, 3).map((f) => (
                <span key={f} className="badge badge-neutral text-xs">
                  {lang === "ar" ? (FEATURE_LABELS_AR[f] || f) : f}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="badge badge-neutral text-xs">+{vehicle.features.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="vehicle-card-rate">
              {formatCurrency(vehicle.daily_rate)}
              <span> {T.perDay}</span>
            </div>
            <div className="text-xs text-muted">
              {T.deposit}: {formatCurrency(vehicle.security_deposit)}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
