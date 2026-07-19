import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/lib/payments/order-service";

/**
 * POST /api/payments/cashfree/webhook
 *
 * Configure this URL in the Cashfree Dashboard → Developers → Webhooks.
 * Cashfree signs webhooks with `x-webhook-signature` = base64(HMAC-SHA256
 * of `timestamp + rawBody`, using the webhook secret as key). We verify
 * this before trusting the payload, same principle as the Razorpay route.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ success: false, error: "Missing signature headers" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET!)
    .update(timestamp + rawBody)
    .digest("base64");

  if (expectedSignature !== signature) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventType = payload.type;

  if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
    const orderId = payload.data.order.order_id;
    const paymentId = payload.data.payment.cf_payment_id;
    try {
      await fulfillOrder(orderId, String(paymentId));
    } catch (err) {
      console.error("Failed to fulfill order after Cashfree webhook:", err);
    }
  }

  if (eventType === "PAYMENT_FAILED_WEBHOOK") {
    const orderId = payload.data.order.order_id;
    const admin = createAdminClient();
    await admin.from("orders").update({ status: "failed" }).eq("id", orderId);
  }

  return NextResponse.json({ success: true });
}
