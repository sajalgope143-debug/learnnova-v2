import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

/**
 * POST /api/support/chat
 * Body: { messages: { role: "user" | "assistant", content: string }[] }
 *
 * Lightweight AI support assistant for common questions (refunds,
 * course access, payment issues). For anything account-specific or
 * requiring action, it should direct the user to the human support
 * ticket system (Contact page) rather than guessing.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`ai-chat:${ip}`, 20, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ success: false, error: "Too many requests, please slow down." }, { status: 429 });
  }

  const { messages } = await request.json();
  if (!Array.isArray(messages)) {
    return NextResponse.json({ success: false, error: "messages array is required" }, { status: 400 });
  }

  const systemPrompt = `You are the LearnSphere support assistant. You help students with
questions about courses, enrollment, payments, refunds, certificates, and
the referral program. Be concise and friendly. If a question requires
account-specific action (refund processing, payment disputes, technical
bugs), tell the user to submit a support ticket via the Contact page
rather than attempting to resolve it yourself. Never invent policy
details — refer to the Refund Policy, Terms, or FAQ pages for anything
you're not certain about.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message ?? "AI support request failed");
    }

    const textBlock = data.content?.find((block: any) => block.type === "text");
    return NextResponse.json({ success: true, data: { reply: textBlock?.text ?? "" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI support is temporarily unavailable";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
