import { NextResponse } from "next/server";
import { callGroq, GroqMessage } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const formattedHistory: GroqMessage[] = (history || []).map((msg: { role: string; text: string }) => ({
      role: msg.role === "model" ? "assistant" as const : "user" as const,
      content: msg.text,
    }));

    const messages: GroqMessage[] = [
      {
        role: "system",
        content: `You are AutoRent AI, a helpful and friendly car rental advisor based in Egypt. You help users with:
- Car recommendations based on their needs
- Rental pricing information (in EGP)
- Driving tips for Egypt
- Information about car models, specs, and features
- Deposit and insurance questions
- Fuel price awareness (Note: as of late 2026, 80 octane is 20.75 EGP/liter, 92 octane is 22.25 EGP/liter, and 95 octane is 24.00 EGP/liter).

Keep responses concise, friendly, and use emojis. Always give prices in EGP (Egyptian Pounds).
If asked about something unrelated to cars/rentals, politely redirect the conversation.`,
      },
      ...formattedHistory,
      { role: "user", content: message },
    ];

    const textResult = await callGroq(messages, false);

    // Remove thinking tags if present
    const cleanResult = textResult.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return NextResponse.json({ reply: cleanResult });

  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
