/**
 * Security Utilities
 * ──────────────────
 * Step 3:  Input sanitization (strip HTML/script injection)
 * Step 4:  Zod schemas enforce parameterized-style validation before any DB call
 * Step 5:  Output validation schemas (validate data before rendering)
 */

import { z } from "zod";

// ─── Step 3: Sanitize plain-text input ────────────────────────────────────────
// Strips leading/trailing whitespace, collapses inner whitespace,
// and removes any HTML tags to prevent XSS / injection.
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ")                          // collapse whitespace
    .replace(/<[^>]*>/g, "")                        // strip HTML tags
    .replace(/[<>"'`]/g, (c) =>                     // encode dangerous chars
      ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" }[c] ?? c)
    );
}

// Sanitize a whole object's string fields recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = sanitizeText(result[key] as string);
    }
  }
  return result;
}

// ─── Step 7: Password strength rules ──────────────────────────────────────────
export const PASSWORD_RULES = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

function strongPassword() {
  return z
    .string()
    .min(PASSWORD_RULES.minLength, `Password must be at least ${PASSWORD_RULES.minLength} characters`)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%...)");
}

// ─── Step 4 & 5: Input / Output Zod Schemas ───────────────────────────────────

/** Login form */
export const LoginSchema = z.object({
  email:    z.string().email("Invalid email address").max(255).toLowerCase(),
  password: z.string().min(1, "Password is required").max(128),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/** Signup form */
export const SignupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u, "Name contains invalid characters"),
  email:    z.string().email("Invalid email address").max(255).toLowerCase(),
  password: strongPassword(),
  role:     z.enum(["renter", "owner"]),
});
export type SignupInput = z.infer<typeof SignupSchema>;

/** Rental booking form */
export const BookingSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes:     z.string().max(500).optional(),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});
export type BookingInput = z.infer<typeof BookingSchema>;

/** Vehicle search/filter */
export const VehicleFilterSchema = z.object({
  category: z.enum(["all","economy","standard","luxury","suv","van"]).optional(),
  search:   z.string().max(100).optional().transform((v) => v ? sanitizeText(v) : undefined),
  minRate:  z.coerce.number().min(0).max(100000).optional(),
  maxRate:  z.coerce.number().min(0).max(100000).optional(),
});

// ─── Step 5: Output validation schemas ────────────────────────────────────────
// Validate data coming FROM the database / AI engine before rendering

export const VehicleOutputSchema = z.object({
  id:               z.string().uuid(),
  make:             z.string().max(100),
  model:            z.string().max(100),
  year:             z.number().int().min(1990).max(2030),
  daily_rate:       z.number().positive(),
  security_deposit: z.number().nonnegative(),
  status:           z.enum(["available","rented","maintenance","inactive"]),
  category:         z.enum(["economy","standard","luxury","suv","van"]),
});

export const AIValuationOutputSchema = z.object({
  identified:    z.boolean(),
  make:          z.string().max(100).nullable(),
  model:         z.string().max(100).nullable(),
  year:          z.number().int().min(1900).max(2030).nullable(),
  confidence:    z.number().min(0).max(1),
  market_value:  z.number().nonnegative().nullable(),
  daily_rate:    z.number().nonnegative().nullable(),
  currency:      z.literal("EGP"),
});
export type AIValuationOutput = z.infer<typeof AIValuationOutputSchema>;

/** Safely parse AI engine response — returns null on invalid data */
export function parseAIValuationResponse(raw: unknown): AIValuationOutput | null {
  const result = AIValuationOutputSchema.safeParse(raw);
  return result.success ? result.data : null;
}
