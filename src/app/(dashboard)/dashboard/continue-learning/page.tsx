import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

export default async function ContinueLearningPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(id, title, slug, thumbnail_url, duration_minutes)")
    .eq("user_id", user.id)
    .lt("progress_percent", 100)
    .order("enrolled_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        Continue Learning
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Pick up right where you left off.</p>

      {!enrollments || enrollments.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-slate-400">
          No courses in progress. Enroll in a course to get started!
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {enrollments.map((e: any) => (
            <Link
              key={e.id}
              href={`/learn/${e.course.slug}`}
              className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {e.course.thumbnail_url && (
                  <Image src={e.course.thumbnail_url} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">{e.course.title}</div>
                <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${e.progress_percent}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {e.progress_percent}% complete
                </div>
              </div>
              <PlayCircle className="text-brand-500" size={28} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
