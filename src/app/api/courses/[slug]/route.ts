import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/courses/[slug]
 * Returns full course detail including chapters + lessons.
 * RLS on `lessons` automatically hides video_url/pdf_url for
 * non-preview lessons unless the requester is enrolled or an admin —
 * so this endpoint is safe to call for anonymous visitors too.
 */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `*, category:categories(*),
       instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url, bio),
       chapters(*, lessons(*))`
    )
    .eq("slug", params.slug)
    .single();

  if (error || !course) {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  // Sort chapters/lessons by display_order (Postgres doesn't guarantee
  // nested order via a single select).
  const sortedChapters = (course.chapters ?? [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((chapter: any) => ({
      ...chapter,
      lessons: (chapter.lessons ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    }));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:profiles(full_name, avatar_url)")
    .eq("course_id", course.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    success: true,
    data: { course: { ...course, chapters: sortedChapters }, isEnrolled, reviews },
  });
}
