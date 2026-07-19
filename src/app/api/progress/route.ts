import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/progress
 * Body: { lessonId, courseId, isCompleted?, lastPositionSeconds? }
 * Upserts lesson progress, then recalculates the course-level
 * progress_percent on the enrollment row. Also issues a certificate
 * automatically the moment progress hits 100%.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Please log in" }, { status: 401 });
  }

  const { lessonId, courseId, isCompleted, lastPositionSeconds } = await request.json();
  if (!lessonId || !courseId) {
    return NextResponse.json({ success: false, error: "lessonId and courseId are required" }, { status: 400 });
  }

  // Verify enrollment (also enforced by RLS, but we want a clean error message)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) {
    return NextResponse.json({ success: false, error: "You are not enrolled in this course" }, { status: 403 });
  }

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      is_completed: isCompleted ?? false,
      last_position_seconds: lastPositionSeconds ?? 0,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  // Recalculate overall course progress
  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("id, chapters!inner(course_id)", { count: "exact", head: true })
    .eq("chapters.course_id", courseId);

  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("is_completed", true);

  const progressPercent = totalLessons ? Math.round(((completedLessons ?? 0) / totalLessons) * 100) : 0;

  await supabase
    .from("enrollments")
    .update({
      progress_percent: progressPercent,
      completed_at: progressPercent === 100 ? new Date().toISOString() : null,
    })
    .eq("id", enrollment.id);

  // Auto-issue certificate on 100% completion
  if (progressPercent === 100) {
    const admin = createAdminClient();
    const { data: existingCert } = await admin
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!existingCert) {
      await admin.from("certificates").insert({ user_id: user.id, course_id: courseId });
      await admin.from("notifications").insert({
        user_id: user.id,
        title: "Course completed! 🎉",
        message: "Your certificate is ready to download.",
        type: "course",
        link: "/dashboard/certificates",
      });
    }
  }

  // Update daily learning streak: increment if the last recorded
  // activity was yesterday, reset to 1 if there was a gap, or leave
  // unchanged if the user already logged activity today.
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_activity_date")
    .eq("id", user.id)
    .single();

  if (profile) {
    const today = new Date().toISOString().slice(0, 10);
    const lastActivity = profile.last_activity_date;

    if (lastActivity !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = lastActivity === yesterday ? profile.streak_count + 1 : 1;
      await supabase
        .from("profiles")
        .update({ streak_count: newStreak, last_activity_date: today })
        .eq("id", user.id);
    }
  }

  return NextResponse.json({ success: true, data: { progressPercent } });
}
