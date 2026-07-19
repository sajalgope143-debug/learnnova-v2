import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseSlug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: course } = await supabase.from("courses").select("id").eq("slug", params.courseSlug).single();
  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/courses/${params.courseSlug}`);
  }

  return <div className="min-h-screen bg-slate-50 dark:bg-surface-dark">{children}</div>;
}
