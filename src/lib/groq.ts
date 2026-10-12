// ─── Groq AI Client ────────────────────────────────────────────────────────────
// Server-side only helper to call Groq's ultra-fast inference API.
// Uses Qwen 3.8-27B for text tasks and GPT-OSS-120B for complex reasoning.

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Qwen 27B for fast text; GPT-OSS 120B for complex reasoning
const MODEL_FAST = "qwen/qwen3.8-27b";
const MODEL_SMART = "openai/gpt-oss-120b";

/**
 * Call Groq with messages.
 * @param smart - Use the larger 120B model for complex tasks
 */
export async function callGroq(
  messages: GroqMessage[],
  smart: boolean = false
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const body: Record<string, unknown> = {
    model: smart ? MODEL_SMART : MODEL_FAST,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Groq API error (${resp.status}): ${errText}`);
  }

  const json = await resp.json();
  const text = json?.choices?.[0]?.message?.content || "";
  return text;
}

export async function callGroqVision(
  prompt: string,
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const body = {
    model: "qwen/qwen3.8-27b",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 800,
  };

  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Groq Vision API error (${resp.status}): ${errText}`);
  }

  const json = await resp.json();
  return json?.choices?.[0]?.message?.content || "";
}
