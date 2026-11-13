import fs from "fs";
import path from "path";

export interface RealBooking {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_image?: string;
  vehicle_plate?: string;
  vehicle_category?: string;
  renter_id?: string;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
  billing_city?: string;
  start_date: string;
  end_date: string;
  total_price_egp: number;
  daily_rate: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  updated_at?: string;
  notes?: string;
}

// In-memory cache
let memoryBookings: RealBooking[] = [];

function getFilePath(): string {
  // Use /tmp for serverless/Vercel or local directory
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
  if (isVercel) {
    return path.join("/tmp", "autorent_real_bookings.json");
  }
  return path.join(process.cwd(), "src", "data", "real_bookings.json");
}

export function getAllBookings(): RealBooking[] {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryBookings = parsed;
        return memoryBookings;
      }
    }
  } catch (err) {
    console.warn("Could not read bookings file, using memory cache:", err);
  }
  return memoryBookings;
}

export function saveAllBookings(bookings: RealBooking[]) {
  memoryBookings = bookings;
  try {
    const filePath = getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write bookings file, kept in memory cache:", err);
  }
}

export function addRealBooking(booking: RealBooking): RealBooking {
  const current = getAllBookings();
  // Filter out any duplicate ID
  const filtered = current.filter((b) => b.id !== booking.id);
  const updated = [booking, ...filtered];
  saveAllBookings(updated);
  return booking;
}

export function updateRealBookingStatus(
  bookingId: string,
  newStatus: "accepted" | "rejected" | "completed"
): RealBooking | null {
  const current = getAllBookings();
  const index = current.findIndex((b) => b.id === bookingId);
  if (index === -1) return null;

  current[index].status = newStatus;
  current[index].updated_at = new Date().toISOString();
  saveAllBookings(current);
  return current[index];
}
