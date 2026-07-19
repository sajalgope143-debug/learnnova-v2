import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { otpVerifySchema } from "@/lib/validators/auth";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

/**
 * POST /api/auth/otp/verify
 * Verifies the OTP and establishes a Supabase session (sets auth cookies).
 * On first login for this phone number, the `handle_new_user` DB trigger
 * automatically creates the profile + wallet rows.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`otp-verify:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid OTP" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.otp,
    type: "sms",
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { user: data.user } });
}
