import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = "EGP"): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getDaysBetween(start: string, end: string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

export function getSeverityColor(severity: string | null): string {
  switch (severity) {
    case "none":     return "text-emerald-400";
    case "minor":    return "text-amber-400";
    case "moderate": return "text-orange-400";
    case "severe":   return "text-red-400";
    default:         return "text-slate-400";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "available":   return "success";
    case "active":      return "info";
    case "completed":   return "success";
    case "pending":     return "warning";
    case "cancelled":   return "error";
    case "disputed":    return "error";
    case "rented":      return "info";
    case "maintenance": return "warning";
    default:            return "neutral";
  }
}

export function getVehicleImage(make: string, model: string, year: number | string, originalUrl?: string | null): string {
  if (!originalUrl || originalUrl.includes("via.placeholder.com") || originalUrl.includes("unsplash.com")) {
    const cleanMake = make.toLowerCase().trim();
    // Imagin API expects modelFamily to usually be the first word of the model (e.g., "Corolla" from "Corolla LE")
    const cleanModel = model.toLowerCase().trim().split(' ')[0];
    
    // Using hrjavascript-mastery public demo key (often used for these kinds of projects).
    // angle=23 provides a beautiful 3/4 front view.
    return `https://cdn.imagin.studio/getImage?customer=hrjavascript-mastery&make=${cleanMake}&modelFamily=${cleanModel}&modelYear=${year}&zoomType=fullscreen&angle=23`;
  }
  return originalUrl;
}
