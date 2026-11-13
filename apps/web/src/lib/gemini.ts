// ─── Gemini AI Client ──────────────────────────────────────────────────────────
// Server-side only helper to call Google's Gemini REST API directly.

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiPart[];
}

export async function callGemini(
  messages: GeminiMessage[],
  options?: { responseMimeType?: string }
): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.8-flash"];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const body: any = {
        contents: messages,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      };

      if (options?.responseMimeType) {
        body.generationConfig.responseMimeType = options.responseMimeType;
      }

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        const errText = await resp.text();
        if (resp.status === 503 || resp.status === 429) {
          console.warn(`Model ${model} overloaded. Trying next fallback...`);
          lastError = new Error(`Gemini API Error (${resp.status}): ${errText}`);
          continue; // Try the next model
        }
        throw new Error(`Gemini API Error (${resp.status}): ${errText}`);
      }

      const json = await resp.json();
      return json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e: any) {
      lastError = e;
      // If it's a network error, loop to next model. If it's a hard error, we should throw, but let's just retry for safety.
    }
  }

  throw lastError || new Error("All Gemini models failed due to high demand.");
}

export function imageToGeminiPart(base64Data: string, mimeType: string): GeminiPart {
  return {
    inlineData: {
      mimeType,
      data: base64Data
    }
  };
}
