import { Vehicle } from "@/lib/types";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";
import Link from "next/link";

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

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/fleet/${vehicle.id}`} style={{ textDecoration: "none" }}>
      <article className="vehicle-card animate-fade-in">
        {vehicle.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.thumbnail_url}
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
              {vehicle.status}
            </span>
          </div>

          <div className="vehicle-card-meta">
            <span className="badge badge-neutral">{vehicle.category}</span>
            {vehicle.color && (
              <span className="badge badge-neutral">🎨 {vehicle.color}</span>
            )}
            <span className="badge badge-neutral">📍 {vehicle.plate_number}</span>
          </div>

          {vehicle.features && vehicle.features.length > 0 && (
            <div className="vehicle-card-meta">
              {vehicle.features.slice(0, 3).map((f) => (
                <span key={f} className="badge badge-neutral text-xs">{f}</span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="badge badge-neutral text-xs">+{vehicle.features.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="vehicle-card-rate">
              {formatCurrency(vehicle.daily_rate)}
              <span> / day</span>
            </div>
            <div className="text-xs text-muted">
              Deposit: {formatCurrency(vehicle.security_deposit)}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
