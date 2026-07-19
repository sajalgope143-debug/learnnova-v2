import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/course/course-card";
import Link from "next/link";
import type { Course } from "@/types";

export async function FeaturedCourses() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*, category:categories(*), instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url)")
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const list = (courses ?? []) as unknown as Course[];

  return (
    <section className="container-app py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Featured Courses
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Hand-picked courses our students love the most.
          </p>
        </div>
        <Link href="/courses" className="hidden text-sm font-semibold text-brand-600 hover:underline sm:block dark:text-brand-400">
          View all →
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-slate-700">
          No featured courses yet — check back soon.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
