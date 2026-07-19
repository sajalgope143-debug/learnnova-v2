import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function LearnIndexPage({ params }: { params: { courseSlug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, chapters(id, display_order, lessons(id, display_order))")
    .eq("slug", params.courseSlug)
    .single();
  if (!course) notFound();

  const sortedChapters = (course.chapters ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
  const allLessonIds = sortedChapters.flatMap((c: any) =>
    (c.lessons ?? []).sort((a: any, b: any) => a.display_order - b.display_order).map((l: any) => l.id)
  );

  if (allLessonIds.length === 0) notFound();

  // Find the first lesson that isn't yet completed; default to lesson 1.
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id)
    .in("lesson_id", allLessonIds);

  const completedSet = new Set((progress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id));
  const nextLessonId = allLessonIds.find((id: string) => !completedSet.has(id)) ?? allLessonIds[0];

  redirect(`/learn/${params.courseSlug}/${nextLessonId}`);
}
