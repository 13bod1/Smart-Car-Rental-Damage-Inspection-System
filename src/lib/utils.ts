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
    case "available":  return "badge-success";
    case "active":     return "badge-info";
    case "completed":  return "badge-success";
    case "pending":    return "badge-warning";
    case "cancelled":  return "badge-error";
    case "disputed":   return "badge-error";
    case "rented":     return "badge-info";
    case "maintenance":return "badge-warning";
    default:           return "badge-neutral";
  }
}
