import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addRealBooking, RealBooking } from "@/lib/bookingsStore";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleId, vehicleInfo, startDate, endDate, totalPrice, driverDetails } = body;

    if (!vehicleId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required reservation dates or vehicle" }, { status: 400 });
    }

    const renterName = driverDetails
      ? `${driverDetails.firstName || ""} ${driverDetails.lastName || ""}`.trim() || "Renter"
      : "Renter";
    const renterEmail = driverDetails?.email || "customer@example.com";
    const renterPhone = driverDetails?.phone || "+20 100 000 0000";
    const billingCity = driverDetails?.city || "Cairo";

    const carName = vehicleInfo
      ? `${vehicleInfo.year || ""} ${vehicleInfo.make || ""} ${vehicleInfo.model || ""}`.trim()
      : "Fleet Vehicle";

    const bookingId = `book_${crypto.randomUUID()}`;

    // 1. Persist directly to real bookings store
    const realBooking: RealBooking = {
      id: bookingId,
      vehicle_id: vehicleId,
      vehicle_name: carName,
      vehicle_image: vehicleInfo?.thumbnail_url,
      vehicle_plate: vehicleInfo?.plate_number,
      vehicle_category: vehicleInfo?.category,
      renter_name: renterName,
      renter_email: renterEmail,
      renter_phone: renterPhone,
      billing_city: billingCity,
      start_date: startDate,
      end_date: endDate,
      total_price_egp: Number(totalPrice) || 0,
      daily_rate: Number(vehicleInfo?.daily_rate) || 500,
      status: "pending",
      created_at: new Date().toISOString(),
      notes: `Driver: ${renterName} | Phone: ${renterPhone} | Email: ${renterEmail} | City: ${billingCity}`,
    };

    addRealBooking(realBooking);

    // 2. Also try Supabase if session exists
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const renterId = user?.id || "00000000-0000-0000-0000-000000000002";

      await supabase.from("reservations").insert({
        vehicle_id: vehicleId,
        renter_id: renterId,
        start_date: startDate,
        end_date: endDate,
        total_price_egp: Number(totalPrice) || 0,
        status: "pending",
      });
    } catch (e: any) {
      console.warn("Supabase reservation insert notice:", e.message);
    }

    return NextResponse.json({
      success: true,
      booking: realBooking,
      reservationId: bookingId,
      status: "pending",
      message: "Real rental request submitted directly to fleet owner dashboard.",
    });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
