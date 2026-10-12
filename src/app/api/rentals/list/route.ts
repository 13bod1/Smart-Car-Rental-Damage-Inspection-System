import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookingsStore";

export async function GET() {
  try {
    const bookings = getAllBookings();
    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
