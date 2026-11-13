// ─── Database Row Types ───────────────────────────────────────────────────────

export type UserRole = "renter" | "owner" | "admin";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  national_id: string | null;
  license_url: string | null;
  avatar_url: string | null;
  kyc_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type VehicleStatus = "available" | "rented" | "maintenance" | "inactive";
export type VehicleCategory = "economy" | "standard" | "luxury" | "suv" | "van";

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vin: string | null;
  category: VehicleCategory;
  daily_rate: number;
  market_value: number | null;
  security_deposit: number;
  mileage: number;
  status: VehicleStatus;
  description: string | null;
  features: string[] | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export type RentalStatus = "pending" | "active" | "completed" | "cancelled" | "disputed";
export type DepositStatus = "held" | "partial_refund" | "full_refund" | "confiscated";

export interface Rental {
  id: string;
  vehicle_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  actual_return_at: string | null;
  pickup_mileage: number | null;
  return_mileage: number | null;
  daily_rate: number;
  total_days: number;
  subtotal: number | null;
  security_deposit: number;
  deposit_status: DepositStatus;
  deposit_deduction: number;
  status: RentalStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  vehicle?: Vehicle;
  renter?: Profile;
}

export type DamageReportStatus = "pending" | "processing" | "completed" | "failed";
export type DamageSeverity = "none" | "minor" | "moderate" | "severe";
export type DepositStrategy = "full_refund" | "partial_deduction" | "full_confiscation";

export interface AIDamageReport {
  id: string;
  rental_id: string;
  vehicle_id: string;
  status: DamageReportStatus;
  damage_detected: boolean | null;
  severity: DamageSeverity | null;
  damage_zones: Record<string, string> | null;
  confidence_score: number | null;
  estimated_cost_egp: number | null;
  strategy_applied: DepositStrategy | null;
  raw_model_output: Record<string, unknown> | null;
  processed_at: string | null;
  created_at: string;
}

export interface Valuation {
  id: string;
  requested_by: string | null;
  image_url: string;
  identified_make: string | null;
  identified_model: string | null;
  identified_year: number | null;
  market_value_egp: number | null;
  daily_rate_egp: number | null;
  confidence_score: number | null;
  raw_output: Record<string, unknown> | null;
  session_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  rental_id: string | null;
  payer_id: string | null;
  payee_id: string | null;
  type: string;
  amount_egp: number;
  currency: string;
  status: string;
  gateway_ref: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
