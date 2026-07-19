import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Star, Trash2 } from "lucide-react";

async function toggleApproval(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const isApproved = formData.get("isApproved") === "true";
  await admin.from("reviews").update({ is_approved: !isApproved }).eq("id", id);
  revalidatePath("/admin/reviews");
}

async function deleteReview(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin.from("reviews").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/reviews");
}

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("*, course:courses(title), user:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Reviews</h1>

      <div className="mt-6 card divide-y divide-slate-200 dark:divide-slate-800">
        {(reviews ?? []).map((r: any) => (
          <div key={r.id} className="flex items-start justify-between gap-4 p-4">
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < r.rating ? "fill-accent-400 text-accent-400" : "text-slate-300"} />
                ))}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {r.course?.title} — {r.user?.full_name}
              </p>
              {r.comment && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <form action={toggleApproval}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="isApproved" value={String(r.is_approved)} />
                <button
                  type="submit"
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    r.is_approved
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  }`}
                >
                  {r.is_approved ? "Approved" : "Hidden"}
                </button>
              </form>
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="text-red-500" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
