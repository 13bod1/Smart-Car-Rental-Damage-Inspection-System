import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";

interface CarEstimate {
  car: string;
  pros: string[];
  cons: string[];
  best_for: string;
  estimated_daily_rate_egp: number;
  estimated_value_egp: number;
  fuel_economy: string;
  comfort_rating: number;
  value_rating: number;
  reliability_rating: number;
}

function generateFallbackEstimate(carName: string): CarEstimate {
  const lower = carName.toLowerCase();

  // Supercars & Exotics
  if (lower.includes("ferrari") || lower.includes("lamborghini") || lower.includes("mclaren") || lower.includes("revuelto") || lower.includes("sf90") || lower.includes("911 gt3")) {
    return {
      car: carName,
      pros: ["Breathtaking supercar acceleration and presence", "Unrivaled prestige and prestige events VIP status", "Top-tier track precision and carbon ceramics"],
      cons: ["Low clearance requires extreme care on Egyptian speed bumps", "Requires premium 95/98 octane fuel", "Extremely high security deposit required"],
      best_for: "Special celebrations, VIP events & track days in Egypt",
      estimated_daily_rate_egp: 28000,
      estimated_value_egp: 18500000,
      fuel_economy: "15.5L/100km (Super 95/98)",
      comfort_rating: 7,
      value_rating: 6,
      reliability_rating: 8,
    };
  }

  // Classic Egyptian Legends
  if (lower.includes("504") || lower.includes("w123") || lower.includes("128") || lower.includes("131") || lower.includes("shahin") || lower.includes("sahin") || lower.includes("lada") || lower.includes("beetle") || lower.includes("lanos") || lower.includes("boma") || lower.includes("maleka")) {
    const isW123 = lower.includes("w123") || lower.includes("khanzeera");
    const is504 = lower.includes("504");
    return {
      car: carName,
      pros: [
        "Legendary durability over Egyptian potholes and rugged terrain",
        "Spare parts are available everywhere across Cairo, Giza, and Delta",
        isW123 ? "Smooth diesel cruiser with tank-like construction" : "Very low rental and maintenance costs",
      ],
      cons: [
        "Lacks modern ADAS safety systems and CarPlay",
        is504 ? "Heavy steering at low parking speeds" : "Vintage air conditioning may struggle during peak July heat",
      ],
      best_for: "Nostalgic road trips, photography shoots, and budget Cairo commuting",
      estimated_daily_rate_egp: isW123 ? 950 : 650,
      estimated_value_egp: isW123 ? 320000 : 180000,
      fuel_economy: isW123 ? "8.0L/100km (Solar / Diesel)" : "7.2L/100km (80 / 92 Octane)",
      comfort_rating: isW123 ? 8 : 6,
      value_rating: 9,
      reliability_rating: 8,
    };
  }

  // Electric Vehicles
  if (lower.includes("tesla") || lower.includes("byd") || lower.includes("taycan") || lower.includes("zeekr") || lower.includes("ev") || lower.includes("electric") || lower.includes("ioniq")) {
    return {
      car: carName,
      pros: [
        "Zero fuel costs — instant instant torque and silent cabin",
        "Cutting-edge autopilot tech and massive infotainment screen",
        "Immune to Egyptian fuel price fluctuations",
      ],
      cons: [
        "Requires planning for Fast EV Charging on Cairo-Alex & Ain Sokhna highways",
        "Specialized tire replacements in local workshops",
      ],
      best_for: "Tech enthusiasts, modern city commutes & environmentally conscious travel",
      estimated_daily_rate_egp: lower.includes("taycan") ? 14500 : lower.includes("plaid") ? 12000 : 3800,
      estimated_value_egp: lower.includes("taycan") ? 9200000 : 3100000,
      fuel_economy: "16.8 kWh/100km (approx. 450km range)",
      comfort_rating: 9,
      value_rating: 8,
      reliability_rating: 9,
    };
  }

  // Heavy Duty SUVs & 4x4 Off-Roaders
  if (lower.includes("land cruiser") || lower.includes("patrol") || lower.includes("wrangler") || lower.includes("defender") || lower.includes("tahoe") || lower.includes("yukon") || lower.includes("fortuner") || lower.includes("prado")) {
    const isLandCruiser = lower.includes("land cruiser") || lower.includes("patrol");
    return {
      car: carName,
      pros: [
        "Supreme highway commanding presence and superior road vision",
        "Conquers Sinai desert trails, North Coast sand, and Fayoum dunes effortlessly",
        "Spacious 7-seater interior with cavernous luggage capacity",
      ],
      cons: [
        "Higher fuel consumption in Cairo stop-and-go traffic",
        "Challenging to parallel park in tight downtown Cairo streets",
      ],
      best_for: "Family coastal holidays, Red Sea expeditions, and executive transport",
      estimated_daily_rate_egp: isLandCruiser ? 6500 : 3800,
      estimated_value_egp: isLandCruiser ? 5800000 : 2900000,
      fuel_economy: "12.8L/100km",
      comfort_rating: 9,
      value_rating: 8,
      reliability_rating: 9,
    };
  }

  // German Flagship Luxury (S-Class, 7-Series, A8, Panamera, Maybach)
  if (lower.includes("s-class") || lower.includes("7 series") || lower.includes("a8") || lower.includes("maybach") || lower.includes("panamera") || lower.includes("ghost") || lower.includes("bentley")) {
    return {
      car: carName,
      pros: [
        "Unrivaled acoustic insulation and first-class reclining massage rear seats",
        "Adaptive air suspension glides smoothly over Cairo expansion joints",
        "Maximum prestige for corporate delegations and diplomatic meetings",
      ],
      cons: [
        "Very steep rental deposit",
        "Best enjoyed with a dedicated private chauffeur",
      ],
      best_for: "Weddings, executive business transport, and luxury hotel transfers",
      estimated_daily_rate_egp: lower.includes("maybach") || lower.includes("ghost") ? 22000 : 9500,
      estimated_value_egp: lower.includes("maybach") || lower.includes("ghost") ? 19000000 : 7500000,
      fuel_economy: "10.5L/100km (Super 95)",
      comfort_rating: 10,
      value_rating: 7,
      reliability_rating: 8,
    };
  }

  // Pickups & Workhorses
  if (lower.includes("hilux") || lower.includes("raptor") || lower.includes("f-150") || lower.includes("d-max") || lower.includes("dabbaba") || lower.includes("trx")) {
    return {
      car: carName,
      pros: [
        "Rugged heavy-duty suspension engineered for extreme Egyptian road loads",
        "Massive open cargo bed for equipment, luggage, and commercial transport",
        "High ground clearance tackles unpaved construction and desert roads",
      ],
      cons: [
        "Stiffer rear leaf-spring ride when unladen",
        "Higher turning radius in narrow residential alleys",
      ],
      best_for: "Commercial projects, heavy cargo haulage, and desert work sites",
      estimated_daily_rate_egp: lower.includes("trx") || lower.includes("raptor") ? 7500 : 2100,
      estimated_value_egp: lower.includes("raptor") ? 5200000 : 1850000,
      fuel_economy: "9.6L/100km (Diesel / 92)",
      comfort_rating: 7,
      value_rating: 9,
      reliability_rating: 9,
    };
  }

  // Popular Daily Sedans & Crossovers
  return {
    car: carName,
    pros: [
      "Exceptional fuel economy for Cairo commuting and Ring Road traffic",
      "Very affordable daily rental rates and reasonable deposit",
      "Easy maneuvering and parking in bustling shopping districts",
    ],
    cons: [
      "Average highway sound deadening at speeds above 120 km/h",
      "Moderate cargo capacity compared to large SUVs",
    ],
    best_for: "Daily work commutes, weekend family errands, and city shopping",
    estimated_daily_rate_egp: 1650,
    estimated_value_egp: 1250000,
    fuel_economy: "6.5L/100km (92 Octane)",
    comfort_rating: 8,
    value_rating: 9,
    reliability_rating: 9,
  };
}

export async function POST(req: Request) {
  let requestedCars: string[] = [];
  try {
    const { cars } = await req.json();

    if (!cars || !Array.isArray(cars) || cars.length < 2) {
      return NextResponse.json({ error: "Provide at least 2 cars" }, { status: 400 });
    }

    requestedCars = cars.map((c) => String(c).trim()).filter(Boolean);

    const prompt = `
Compare these cars for the Egyptian rental market: ${requestedCars.join(", ")}.

Return ONLY a valid JSON object:
{
  "comparison": [
    {
      "car": "Full car name",
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "best_for": "string",
      "estimated_daily_rate_egp": number,
      "estimated_value_egp": number,
      "fuel_economy": "string like 7.5L/100km",
      "comfort_rating": number (1-10),
      "value_rating": number (1-10),
      "reliability_rating": number (1-10)
    }
  ],
  "recommendation": "string with final verdict",
  "summary": "string"
}

Include one entry per car. Be specific to Egypt (prices in EGP, fuel costs 80/92/95 octane or diesel, Cairo traffic, spare parts availability, road conditions).
Return ONLY the JSON. No markdown, no explanation.`;

    const textResult = await callGroq(
      [{ role: "user", content: prompt }],
      true
    );

    let cleanJson = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
    cleanJson = cleanJson.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Extract JSON between outermost curly braces if surrounded by commentary
    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleanJson);
    return NextResponse.json(parsed);

  } catch (error: unknown) {
    console.warn("AI Compare Groq Call Failed, using fallback estimator:", error);

    // Fallback response guarantees zero disruption to users
    if (requestedCars.length >= 2) {
      const comparison = requestedCars.map((car) => generateFallbackEstimate(car));
      const bestValue = [...comparison].sort((a, b) => b.value_rating - a.value_rating)[0];
      const highestComfort = [...comparison].sort((a, b) => b.comfort_rating - a.comfort_rating)[0];

      return NextResponse.json({
        comparison,
        recommendation: `For daily practicality and Egyptian value-for-money, the ${bestValue.car} stands out with unbeatable running costs and parts availability. If absolute comfort and prestige are your priority, the ${highestComfort.car} provides a world-class ride.`,
        summary: `Side-by-side market evaluation for ${requestedCars.join(" vs ")} tailored to Egyptian road conditions, daily rental rates, and running economics.`,
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to compare cars" },
      { status: 500 }
    );
  }
}
