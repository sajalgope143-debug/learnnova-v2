import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPendingOrder } from "@/lib/payments/order-service";
import { getRazorpayClient } from "@/lib/payments/razorpay";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

/**
 * POST /api/payments/razorpay/create-order
 * Body: { courseId: string, couponCode?: string }
 *
 * Creates our internal `orders` row (status: created) AND a matching
 * Razorpay order, then returns everything the client needs to open
 * Razorpay Checkout. The actual course unlock happens only after the
 * webhook confirms payment (see /api/payments/razorpay/webhook).
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`create-order:${ip}`, 20, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Please log in to continue" }, { status: 401 });
  }

  const { courseId, couponCode } = await request.json();
  if (!courseId) {
    return NextResponse.json({ success: false, error: "courseId is required" }, { status: 400 });
  }

  try {
    const order = await createPendingOrder({ userId: user.id, courseId, gateway: "razorpay", couponCode });

    // Razorpay expects amount in the smallest currency unit (paise for INR)
    const amountInPaise = Math.round(order.final_amount * 100);

    if (amountInPaise === 0) {
      // Fully discounted by coupon — skip the gateway entirely.
      const { fulfillOrder } = await import("@/lib/payments/order-service");
      await fulfillOrder(order.id, "FREE_VIA_COUPON");
      return NextResponse.json({ success: true, data: { orderId: order.id, free: true } });
    }

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: order.currency,
      receipt: order.invoice_number ?? order.id,
      notes: { internalOrderId: order.id, courseId, userId: user.id },
    });

    await supabase.from("orders").update({ gateway_order_id: razorpayOrder.id }).eq("id", order.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
