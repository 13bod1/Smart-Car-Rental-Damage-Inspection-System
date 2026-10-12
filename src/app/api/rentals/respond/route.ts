import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateRealBookingStatus } from "@/lib/bookingsStore";

export async function POST(req: NextRequest) {
  try {
    const { reservationId, rentalId, action } = await req.json();

    if (!["accept", "reject", "complete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const targetId = reservationId || rentalId;

    if (!targetId) {
      return NextResponse.json({ error: "Request or Rental ID is required" }, { status: 400 });
    }

    // 1. Update status in real bookings persistent store
    const mappedStatus = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "completed";
    const updatedRecord = updateRealBookingStatus(targetId, mappedStatus);

    // 2. Also update Supabase if applicable
    try {
      const supabase = await createClient();

      if (action === "accept") {
        await supabase.from("reservations").update({ status: "accepted" }).eq("id", targetId);
        await supabase.from("rentals").update({ status: "active" }).eq("id", targetId);
      } else if (action === "reject") {
        await supabase.from("reservations").update({ status: "rejected" }).eq("id", targetId);
        await supabase.from("rentals").update({ status: "cancelled" }).eq("id", targetId);
      } else if (action === "complete") {
        await supabase.from("rentals").update({ status: "completed" }).eq("id", targetId);
      }
    } catch (e: any) {
      console.warn("Supabase status update notice:", e.message);
    }

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      booking: updatedRecord,
      message:
        action === "accept"
          ? "Rental approved by Fleet Owner! Contract is now active."
          : action === "reject"
          ? "Rental request rejected."
          : "Rental completed and returned.",
    });
  } catch (err: any) {
    console.error("Rental respond error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
