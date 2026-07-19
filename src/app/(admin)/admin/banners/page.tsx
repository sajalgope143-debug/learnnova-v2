import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { Trash2 } from "lucide-react";

async function createBanner(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin.from("banners").insert({
    title: formData.get("title") as string,
    image_url: formData.get("imageUrl") as string,
    link_url: formData.get("linkUrl") as string,
  });
  revalidatePath("/admin/banners");
}

async function toggleBanner(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";
  await admin.from("banners").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/admin/banners");
}

async function deleteBanner(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin.from("banners").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/banners");
}

export default async function AdminBannersPage() {
  const admin = createAdminClient();
  const { data: banners } = await admin.from("banners").select("*").order("display_order");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Banner Management</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(banners ?? []).map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="relative aspect-[3/1] bg-slate-100 dark:bg-slate-800">
                <Image src={b.image_url} alt={b.title ?? ""} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{b.title}</span>
                <div className="flex items-center gap-2">
                  <form action={toggleBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="isActive" value={String(b.is_active)} />
                    <button
                      type="submit"
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      {b.is_active ? "Live" : "Off"}
                    </button>
                  </form>
                  <form action={deleteBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="text-red-500" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Add Banner</h2>
          <form action={createBanner} className="mt-4 space-y-3">
            <input name="title" placeholder="Banner title" className="input-field" />
            <input name="imageUrl" placeholder="Image URL" className="input-field" required />
            <input name="linkUrl" placeholder="Link URL (optional)" className="input-field" />
            <button type="submit" className="btn-primary w-full">Add Banner</button>
          </form>
        </div>
      </div>
    </div>
  );
}
