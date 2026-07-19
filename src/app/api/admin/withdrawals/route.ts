import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

/**
 * PATCH /api/admin/withdrawals
 * Body: { requestId, action: "approve" | "reject" | "mark_paid", adminNote? }
 *
 * "approve" and "mark_paid" both debit the wallet — approve is used
 * when your team will manually send the money next, mark_paid confirms
 * the transfer already went out. Debiting happens exactly once thanks
 * to the status check.
 */
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const { requestId, action, adminNote } = await request.json();
  if (!requestId || !action) {
    return NextResponse.json({ success: false, error: "requestId and action are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: withdrawal } = await adminClient
    .from("withdrawal_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!withdrawal) {
    return NextResponse.json({ success: false, error: "Withdrawal request not found" }, { status: 404 });
  }
  if (withdrawal.status !== "pending" && action !== "mark_paid") {
    return NextResponse.json({ success: false, error: "This request has already been processed" }, { status: 400 });
  }

  if (action === "reject") {
    await adminClient
      .from("withdrawal_requests")
      .update({ status: "rejected", admin_note: adminNote, processed_by: admin.id, processed_at: new Date().toISOString() })
      .eq("id", requestId);

    await adminClient.from("notifications").insert({
      user_id: withdrawal.user_id,
      title: "Withdrawal request rejected",
      message: adminNote || "Your withdrawal request was rejected. Contact support for details.",
      type: "payment",
      link: "/dashboard/wallet",
    });

    return NextResponse.json({ success: true });
  }

  if (action === "approve" || action === "mark_paid") {
    const newStatus = action === "approve" ? "approved" : "paid";

    // Debit the wallet only once — the moment we move it out of "pending".
    if (withdrawal.status === "pending") {
      const { data: wallet } = await adminClient.from("wallets").select("*").eq("user_id", withdrawal.user_id).single();
      if (!wallet || wallet.balance < withdrawal.amount) {
        return NextResponse.json({ success: false, error: "User has insufficient wallet balance" }, { status: 400 });
      }

      await adminClient
        .from("wallets")
        .update({
          balance: wallet.balance - withdrawal.amount,
          total_withdrawn: wallet.total_withdrawn + withdrawal.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      await adminClient.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        amount: -withdrawal.amount,
        type: "withdrawal",
        reference_id: withdrawal.id,
        description: `Withdrawal request ${withdrawal.id}`,
      });
    }

    await adminClient
      .from("withdrawal_requests")
      .update({
        status: newStatus,
        admin_note: adminNote,
        processed_by: admin.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    await adminClient.from("notifications").insert({
      user_id: withdrawal.user_id,
      title: newStatus === "paid" ? "Withdrawal paid" : "Withdrawal approved",
      message: `Your withdrawal of ₹${withdrawal.amount} has been ${newStatus}.`,
      type: "payment",
      link: "/dashboard/wallet",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
