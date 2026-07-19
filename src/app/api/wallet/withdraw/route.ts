import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const withdrawSchema = z.object({
  amount: z.number().positive(),
  payoutMethodId: z.string().uuid(),
});

/**
 * POST /api/wallet/withdraw
 * Creates a withdrawal request. Does NOT deduct the wallet balance
 * immediately — balance is only debited once an admin approves the
 * request (see /api/admin/withdrawals), preventing a race where a
 * user could double-spend a pending withdrawal.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Please log in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = withdrawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", user.id).single();
  if (!wallet) {
    return NextResponse.json({ success: false, error: "Wallet not found" }, { status: 404 });
  }

  const { data: rule } = await admin
    .from("referral_rules")
    .select("min_payout_amount")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  const minPayout = rule?.min_payout_amount ?? 500;

  if (parsed.data.amount < minPayout) {
    return NextResponse.json(
      { success: false, error: `Minimum withdrawal amount is ₹${minPayout}` },
      { status: 400 }
    );
  }

  // Sum of already-pending withdrawal requests must also be reserved
  // against the balance so a user can't request more than they have.
  const { data: pendingRequests } = await admin
    .from("withdrawal_requests")
    .select("amount")
    .eq("user_id", user.id)
    .eq("status", "pending");
  const pendingTotal = (pendingRequests ?? []).reduce((sum, r) => sum + Number(r.amount), 0);

  if (parsed.data.amount > wallet.balance - pendingTotal) {
    return NextResponse.json({ success: false, error: "Insufficient wallet balance" }, { status: 400 });
  }

  // Confirm the payout method belongs to this user
  const { data: method } = await admin
    .from("payout_methods")
    .select("id")
    .eq("id", parsed.data.payoutMethodId)
    .eq("user_id", user.id)
    .single();
  if (!method) {
    return NextResponse.json({ success: false, error: "Invalid payout method" }, { status: 400 });
  }

  const { error } = await admin.from("withdrawal_requests").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    payout_method_id: parsed.data.payoutMethodId,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { message: "Withdrawal request submitted" } });
}
