import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { destination, days, passengers } = await req.json();

    if (!destination || !days || !passengers) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const prompt = `
You are an expert travel planner for Egypt.
Plan a ${days}-day roadtrip from Aswan to ${destination} for ${passengers} passengers.

Return ONLY a valid JSON object:
{
  "recommended_car": "string (car name)",
  "why_this_car": "string",
  "total_distance_km": number,
  "estimated_fuel_cost_egp": "string (e.g. '1500 - 1800')",
  "itinerary": [
    {
      "day": number,
      "title": "string",
      "description": "string with activities, stops, and tips"
    }
  ],
  "playlist_vibe": "string describing the perfect music mood for this trip",
  "tips": ["tip1", "tip2", "tip3", "tip4"]
}

Use realistic Egyptian distances. For fuel cost, calculate a range (from minimum to maximum cost) based on these exact current prices:
- Benzine 80: 20.75 EGP/liter
- Benzine 92: 22.25 EGP/liter
- Benzine 95: 24.00 EGP/liter
Format the output as a string like "1200 - 1500".
Return ONLY the JSON. No markdown, no explanation.`;

    const textResult = await callGroq([
      { role: "user", content: prompt },
    ], true);

    let cleanJson = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
    cleanJson = cleanJson.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: unknown) {
    console.error("AI Roadtrip Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate roadtrip" },
      { status: 500 }
    );
  }
}
