import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { otpRequestSchema } from "@/lib/validators/auth";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

/**
 * POST /api/auth/otp/send
 * Sends a one-time password via SMS to the given phone number using
 * Supabase's built-in phone auth (which proxies to your configured SMS
 * provider — Twilio, MSG91, etc. — set up in the Supabase dashboard).
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`otp-send:${ip}`, 5, 15 * 60 * 1000); // 5 requests / 15 min
  if (!limited.success) {
    return NextResponse.json(
      { success: false, error: "Too many OTP requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid phone number" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { message: "OTP sent" } });
}
