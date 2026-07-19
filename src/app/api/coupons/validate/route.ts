import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/coupons/validate
 * Body: { code: string, courseId: string }
 * Returns the discount that would be applied — used both by the
 * checkout UI (live preview) and by the order-creation routes
 * (server-side re-validation, never trust the client's math).
 */
export async function POST(request: Request) {
  const { code, courseId } = await request.json();
  if (!code || !courseId) {
    return NextResponse.json({ success: false, error: "code and courseId are required" }, { status: 400 });
  }

  const supabase = createClient();
  const admin = createAdminClient(); // coupons table has no public select RLS policy

  const { data: course } = await supabase.from("courses").select("id, price, discount_price").eq("id", courseId).single();
  if (!course) {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (!coupon) {
    return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 400 });
  }

  const now = new Date();
  if (new Date(coupon.valid_from) > now) {
    return NextResponse.json({ success: false, error: "This coupon is not active yet" }, { status: 400 });
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return NextResponse.json({ success: false, error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
    return NextResponse.json({ success: false, error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (coupon.applicable_course_ids && !coupon.applicable_course_ids.includes(courseId)) {
    return NextResponse.json({ success: false, error: "This coupon is not valid for this course" }, { status: 400 });
  }

  const baseAmount = course.discount_price ?? course.price;
  if (baseAmount < coupon.min_order_amount) {
    return NextResponse.json(
      { success: false, error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` },
      { status: 400 }
    );
  }

  let discountAmount =
    coupon.discount_type === "percent" ? (baseAmount * coupon.discount_value) / 100 : coupon.discount_value;

  if (coupon.max_discount != null) {
    discountAmount = Math.min(discountAmount, coupon.max_discount);
  }
  discountAmount = Math.min(discountAmount, baseAmount); // never discount below zero
  const finalAmount = Math.max(0, Math.round((baseAmount - discountAmount) * 100) / 100);

  return NextResponse.json({
    success: true,
    data: {
      couponId: coupon.id,
      baseAmount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount,
    },
  });
}
