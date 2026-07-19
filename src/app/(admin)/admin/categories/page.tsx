import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Trash2 } from "lucide-react";

async function createCategory(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await admin.from("categories").insert({ name, slug });
  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("*").order("display_order");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Categories</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {(categories ?? []).map((cat) => (
              <li key={cat.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{cat.name}</div>
                  <div className="text-xs text-slate-400">/{cat.slug}</div>
                </div>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={cat.id} />
                  <button type="submit" className="text-red-500" aria-label="Delete category">
                    <Trash2 size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Add Category</h2>
          <form action={createCategory} className="mt-4 space-y-3">
            <input name="name" placeholder="Category name" className="input-field" required />
            <button type="submit" className="btn-primary w-full">
              Add Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
