import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentGateway } from "@/types";

interface CreatePendingOrderParams {
  userId: string;
  courseId: string;
  gateway: PaymentGateway;
  couponCode?: string;
}

/**
 * Validates the course + optional coupon, then inserts a `created`
 * order row. Returns the amount to charge (in the smallest currency
 * unit is handled by the caller, e.g. paise for Razorpay).
 */
export async function createPendingOrder({ userId, courseId, gateway, couponCode }: CreatePendingOrderParams) {
  const admin = createAdminClient();

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id, price, discount_price, currency, status")
    .eq("id", courseId)
    .single();

  if (courseError || !course || course.status !== "published") {
    throw new Error("Course not found or unavailable");
  }

  // Prevent duplicate purchase
  const { data: existingEnrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course");
  }

  const baseAmount = course.discount_price ?? course.price;
  let discountAmount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (coupon) {
      const now = new Date();
      const isValid =
        new Date(coupon.valid_from) <= now &&
        (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
        (coupon.usage_limit == null || coupon.used_count < coupon.usage_limit) &&
        (!coupon.applicable_course_ids || coupon.applicable_course_ids.includes(courseId)) &&
        baseAmount >= coupon.min_order_amount;

      if (isValid) {
        discountAmount =
          coupon.discount_type === "percent" ? (baseAmount * coupon.discount_value) / 100 : coupon.discount_value;
        if (coupon.max_discount != null) discountAmount = Math.min(discountAmount, coupon.max_discount);
        discountAmount = Math.min(discountAmount, baseAmount);
        couponId = coupon.id;
      }
    }
  }

  const finalAmount = Math.max(0, Math.round((baseAmount - discountAmount) * 100) / 100);
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      course_id: courseId,
      coupon_id: couponId,
      base_amount: baseAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      currency: course.currency,
      gateway,
      status: "created",
      invoice_number: invoiceNumber,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Failed to create order");
  }

  return order;
}

/**
 * Called after a gateway webhook confirms payment succeeded.
 * Idempotent: safe to call more than once for the same order
 * (e.g. if a webhook is retried) because enrollment insert uses
 * a unique constraint and referral credit checks for an existing row.
 */
export async function fulfillOrder(orderId: string, gatewayPaymentId: string) {
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) throw new Error("Order not found");
  if (order.status === "paid") return order; // already fulfilled — idempotent no-op

  const { data: updatedOrder, error: updateError } = await admin
    .from("orders")
    .update({ status: "paid", gateway_payment_id: gatewayPaymentId, paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();
  if (updateError) throw new Error(updateError.message);

  // 1. Unlock the course
  await admin.from("enrollments").upsert(
    { user_id: order.user_id, course_id: order.course_id, order_id: order.id },
    { onConflict: "user_id,course_id" }
  );

  // 2. Bump course + coupon counters
  const { data: courseRow } = await admin
    .from("courses")
    .select("total_students")
    .eq("id", order.course_id)
    .single();
  if (courseRow) {
    await admin
      .from("courses")
      .update({ total_students: courseRow.total_students + 1 })
      .eq("id", order.course_id);
  }

  if (order.coupon_id) {
    const { data: couponRow } = await admin
      .from("coupons")
      .select("used_count")
      .eq("id", order.coupon_id)
      .single();
    if (couponRow) {
      await admin
        .from("coupons")
        .update({ used_count: couponRow.used_count + 1 })
        .eq("id", order.coupon_id);
    }
  }

  // 3. Credit referral commission, if this buyer was referred
  const { data: buyerProfile } = await admin.from("profiles").select("referred_by").eq("id", order.user_id).single();

  if (buyerProfile?.referred_by) {
    const { data: alreadyCredited } = await admin
      .from("referral_earnings")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();

    if (!alreadyCredited) {
      const { data: rule } = await admin
        .from("referral_rules")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (rule) {
        const commission =
          rule.commission_type === "percent"
            ? Math.round(((order.final_amount * rule.commission_value) / 100) * 100) / 100
            : rule.commission_value;

        await admin.from("referral_earnings").insert({
          referrer_id: buyerProfile.referred_by,
          referred_user_id: order.user_id,
          order_id: order.id,
          commission_amount: commission,
        });

        const { data: wallet } = await admin
          .from("wallets")
          .select("*")
          .eq("user_id", buyerProfile.referred_by)
          .single();

        if (wallet) {
          await admin
            .from("wallets")
            .update({
              balance: wallet.balance + commission,
              total_earned: wallet.total_earned + commission,
              updated_at: new Date().toISOString(),
            })
            .eq("id", wallet.id);

          await admin.from("wallet_transactions").insert({
            wallet_id: wallet.id,
            amount: commission,
            type: "referral_commission",
            description: `Referral commission for order ${order.invoice_number}`,
          });

          await admin.from("notifications").insert({
            user_id: buyerProfile.referred_by,
            title: "You earned a referral commission!",
            message: `You earned ₹${commission} from a referred purchase.`,
            type: "referral",
            link: "/dashboard/referrals",
          });
        }
      }
    }
  }

  // 4. Notify the buyer
  await admin.from("notifications").insert({
    user_id: order.user_id,
    title: "Payment successful",
    message: "Your course has been unlocked. Happy learning!",
    type: "payment",
    link: "/dashboard/my-courses",
  });

  return updatedOrder;
}
