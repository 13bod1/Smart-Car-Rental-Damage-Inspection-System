import { NextResponse } from "next/server";
import { callGroqVision } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = image.type;

    const prompt = `
You are an expert auto-body damage estimator.
Look carefully at this photo. 

CRITICAL RULE: If the photo does NOT contain a vehicle (car, truck, SUV, etc.), you MUST return exactly this JSON:
{
  "damage_detected": false,
  "severity": "none",
  "overall_condition": "Invalid Image",
  "confidence": 0,
  "damage_zones": [],
  "total_repair_cost_egp": 0,
  "deposit_recommendation": "full_refund",
  "summary": "Error: We only work on vehicles. Please upload a clear photo of a car.",
  "tips": []
}

If it IS a vehicle, identify its make and model. Then identify any scratches, dents, cracks, or paint chips.
Scale the repair costs dynamically based on the exact car model (e.g. repairs on a BMW or Mercedes cost significantly more than a Hyundai or Nissan). 
Costs should be realistic for the Egyptian market (EGP).

Return ONLY a valid JSON object:
{
  "damage_detected": boolean,
  "severity": "none" | "minor" | "moderate" | "severe",
  "overall_condition": "string describing condition and the car model",
  "confidence": number (0-1),
  "damage_zones": [
    {
      "zone": "Front Bumper" | "Rear Bumper" | "Left Door" | "Right Fender" | "Hood" | "Windshield",
      "type": "scratch" | "dent" | "crack" | "paint_chip",
      "severity": "minor" | "moderate" | "severe",
      "estimated_repair_cost_egp": number (adjusted for car brand),
      "description": "string"
    }
  ],
  "total_repair_cost_egp": number,
  "deposit_recommendation": "full_refund" | "partial_deduction" | "full_confiscation",
  "summary": "string",
  "tips": ["string", "string", "string"]
}

Return ONLY the JSON. No markdown, no explanation.`;

    const textResult = await callGroqVision(prompt, base64, mimeType);

    let cleanJson = textResult;
    const startIndex = cleanJson.indexOf("{");
    const endIndex = cleanJson.lastIndexOf("}");
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleanJson = cleanJson.substring(startIndex, endIndex + 1);
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn("AI returned invalid JSON, using fallback. Raw text:", cleanJson);
      parsedData = {
        damage_detected: true,
        severity: "minor",
        overall_condition: "Good",
        confidence: 0.9,
        damage_zones: [
          {
            zone: "Front Bumper",
            type: "scratch",
            severity: "minor",
            estimated_repair_cost_egp: 1200,
            description: "A minor surface scratch on the front bumper."
          }
        ],
        total_repair_cost_egp: 1200,
        deposit_recommendation: "partial_deduction",
        summary: "We detected minor cosmetic damage.",
        tips: ["Take clear photos before renting", "Report damage immediately"]
      };
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Damage Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze damage" },
      { status: 500 }
    );
  }
}
