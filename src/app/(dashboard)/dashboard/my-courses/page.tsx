import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/course/course-card";
import Link from "next/link";

export default async function MyCoursesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: enrollments }, { data: wishlist }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, course:courses(*, category:categories(*), instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url))")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("wishlists")
      .select("*, course:courses(*, category:categories(*), instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        {enrollments?.length ?? 0} course{enrollments?.length !== 1 ? "s" : ""} enrolled
      </p>

      {!enrollments || enrollments.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-slate-400">
          You haven&apos;t enrolled in any courses yet.{" "}
          <Link href="/courses" className="font-medium text-brand-600 dark:text-brand-400">
            Browse courses →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e: any) => (
            <CourseCard key={e.id} course={e.course} />
          ))}
        </div>
      )}

      {wishlist && wishlist.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl font-semibold text-slate-900 dark:text-white">
            Wishlist
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((w: any) => (
              <CourseCard key={w.id} course={w.course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
