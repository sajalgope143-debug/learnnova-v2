import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/lib/payments/order-service";

/**
 * POST /api/payments/razorpay/webhook
 *
 * Configure this URL in the Razorpay Dashboard → Settings → Webhooks,
 * subscribed to the `payment.captured` and `payment.failed` events.
 *
 * CRITICAL: we verify the `x-razorpay-signature` header using HMAC-SHA256
 * with RAZORPAY_WEBHOOK_SECRET before trusting the payload — never unlock
 * a course based on unverified client-side "payment success" callbacks.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  if (event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const internalOrderId = payment.notes?.internalOrderId;

    if (internalOrderId) {
      try {
        await fulfillOrder(internalOrderId, payment.id);
      } catch (err) {
        console.error("Failed to fulfill order after Razorpay webhook:", err);
        // Return 200 anyway to avoid Razorpay retry storms once we've
        // logged the issue; reconciliation can be handled via the
        // admin payments dashboard.
      }
    }
  }

  if (event === "payment.failed") {
    const payment = payload.payload.payment.entity;
    const internalOrderId = payment.notes?.internalOrderId;
    if (internalOrderId) {
      const admin = createAdminClient();
      await admin.from("orders").update({ status: "failed" }).eq("id", internalOrderId);
    }
  }

  return NextResponse.json({ success: true });
}
