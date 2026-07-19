import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPendingOrder, fulfillOrder } from "@/lib/payments/order-service";
import { createCashfreeOrder } from "@/lib/payments/cashfree";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

/**
 * POST /api/payments/cashfree/create-order
 * Body: { courseId: string, couponCode?: string }
 * Mirrors the Razorpay flow: create internal order → create gateway
 * order → return the session token the client SDK needs to open checkout.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`create-order-cf:${ip}`, 20, 60 * 1000);
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
    const order = await createPendingOrder({ userId: user.id, courseId, gateway: "cashfree", couponCode });

    if (order.final_amount === 0) {
      await fulfillOrder(order.id, "FREE_VIA_COUPON");
      return NextResponse.json({ success: true, data: { orderId: order.id, free: true } });
    }

    const cashfreeOrder = await createCashfreeOrder({
      orderId: order.id,
      amount: order.final_amount,
      currency: order.currency,
      customerId: user.id,
      customerEmail: user.email ?? "student@learnsphere.app",
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${order.id}?gateway=cashfree`,
    });

    await supabase.from("orders").update({ gateway_order_id: cashfreeOrder.order_id }).eq("id", order.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        paymentSessionId: cashfreeOrder.payment_session_id,
        amount: order.final_amount,
        currency: order.currency,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
