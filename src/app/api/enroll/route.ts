import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/enroll
 * Directly enrolls the logged-in user in a FREE course (price = 0).
 * Paid courses must go through /api/payments/* so payment is verified
 * before unlocking — this route explicitly rejects paid courses.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Please log in to enroll" }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ success: false, error: "courseId is required" }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, price, discount_price, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published") {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  const effectivePrice = course.discount_price ?? course.price;
  if (effectivePrice > 0) {
    return NextResponse.json(
      { success: false, error: "This course requires payment. Use the checkout flow instead." },
      { status: 400 }
    );
  }

  // Use the admin client to bypass RLS for the enrollment insert —
  // student-facing RLS on `enrollments` intentionally has no insert
  // policy, so all enrollments are created server-side only.
  const admin = createAdminClient();
  const { error } = await admin.from("enrollments").insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (error && error.code !== "23505") {
    // 23505 = unique_violation (already enrolled) — treat as success/no-op
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await admin.from("notifications").insert({
    user_id: user.id,
    title: "Enrollment successful",
    message: "You've been enrolled in your free course. Happy learning!",
    type: "course",
    link: `/dashboard/my-courses`,
  });

  return NextResponse.json({ success: true, data: { enrolled: true } });
}
