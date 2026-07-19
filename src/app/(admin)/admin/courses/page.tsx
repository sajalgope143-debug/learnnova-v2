import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCoursesTable } from "@/components/admin/admin-courses-table";
import { NewCourseForm } from "@/components/admin/new-course-form";

export default async function AdminCoursesPage() {
  const admin = createAdminClient();
  const [{ data: courses }, { data: categories }] = await Promise.all([
    admin.from("courses").select("*, category:categories(name)").order("created_at", { ascending: false }),
    admin.from("categories").select("*").order("display_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Courses</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminCoursesTable initialCourses={(courses ?? []) as any} />
        </div>
        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Create New Course
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Created as a draft — add chapters/lessons before publishing.
          </p>
          <div className="mt-4">
            <NewCourseForm categories={categories ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
