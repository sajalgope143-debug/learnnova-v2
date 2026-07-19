import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reviewSchema = z.object({
  courseId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

/**
 * POST /api/reviews
 * Only enrolled students may review a course (enforced here; RLS
 * additionally guards that user_id must match the submitter).
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
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", parsed.data.courseId)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json(
      { success: false, error: "You must be enrolled in this course to leave a review" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      course_id: parsed.data.courseId,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    { onConflict: "course_id,user_id" }
  );

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { message: "Review submitted" } });
}
