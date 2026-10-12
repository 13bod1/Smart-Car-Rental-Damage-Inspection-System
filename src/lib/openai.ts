// ─── OpenAI Client ─────────────────────────────────────────────────────────────
// Server-side only helper to call ChatGPT (GPT-4o) with vision capabilities.

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | OpenAIPart[];
}

export type OpenAIPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/**
 * Call OpenAI with text and/or image parts.
 */
export async function callOpenAI(
  messages: OpenAIMessage[],
  jsonMode: boolean = false
): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const OPENAI_URL = "https://api.chatanywhere.tech/v1/chat/completions";

  const body: any = {
    model: "gpt-4o", // using GPT-4o for vision and advanced text
    messages,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const resp = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API error (${resp.status}): ${errText}`);
  }

  const json = await resp.json();
  const text = json?.choices?.[0]?.message?.content || "";
  return text;
}

/**
 * Convert a base64 image string to an OpenAI image_url part.
 */
export function imageToOpenAIPart(
  base64Data: string,
  mimeType: string
): OpenAIPart {
  return {
    type: "image_url",
    image_url: { url: `data:${mimeType};base64,${base64Data}` },
  };
}
