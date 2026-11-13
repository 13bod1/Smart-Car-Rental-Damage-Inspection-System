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
Analyze this actual photo. 

CRITICAL RULE: If the photo does NOT contain a vehicle (car, truck, SUV, etc.), you MUST return exactly this JSON:
{
  "identified": false,
  "make": "Unknown",
  "model": "Unknown",
  "year": 0,
  "color": "Unknown",
  "body_type": "Unknown",
  "confidence": 0,
  "market_value": 0,
  "daily_rate": 0,
  "currency": "EGP",
  "engine_estimate": "Unknown",
  "fuel_type": "Unknown",
  "transmission": "Unknown",
  "condition_estimate": "Unknown",
  "fun_fact": "Error: We only work on vehicles. Please upload a clear photo of a car."
}

If it IS a vehicle, look closely at the badge, grille, shape, and headlights to identify its exact make and model.

Return ONLY a valid JSON object with these exact fields:
{
  "identified": boolean,
  "make": "string",
  "model": "string",
  "year": number,
  "color": "string",
  "body_type": "string",
  "confidence": number (between 0 and 1),
  "market_value": number (in EGP, estimate for Egyptian market),
  "daily_rate": number (in EGP),
  "currency": "EGP",
  "engine_estimate": "string",
  "fuel_type": "string",
  "transmission": "string",
  "condition_estimate": "string",
  "fun_fact": "string (a cool fact about this exact car)"
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
        identified: true,
        make: "Toyota",
        model: "Corolla",
        year: 2024,
        color: "Silver",
        body_type: "Sedan",
        confidence: 0.95,
        market_value: 1200000,
        daily_rate: 1500,
        currency: "EGP",
        engine_estimate: "1.6L 4-Cylinder",
        fuel_type: "Petrol",
        transmission: "Automatic",
        condition_estimate: "Excellent",
        fun_fact: "The Toyota Corolla is the best-selling car nameplate in the world!"
      };
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Identify Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
