import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function updateSettings(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin
    .from("site_settings")
    .update({
      site_name: formData.get("siteName") as string,
      support_email: formData.get("supportEmail") as string,
      support_phone: formData.get("supportPhone") as string,
      primary_color: formData.get("primaryColor") as string,
      maintenance_mode: formData.get("maintenanceMode") === "on",
      default_language: formData.get("defaultLanguage") as string,
    })
    .eq("id", 1);
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const admin = createAdminClient();
  const { data: settings } = await admin.from("site_settings").select("*").eq("id", 1).single();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Website Settings</h1>

      <div className="card mt-6 max-w-lg p-6">
        <form action={updateSettings} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Site name</label>
            <input name="siteName" defaultValue={settings?.site_name} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Support email</label>
            <input name="supportEmail" type="email" defaultValue={settings?.support_email ?? ""} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Support phone</label>
            <input name="supportPhone" defaultValue={settings?.support_phone ?? ""} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Primary brand color</label>
            <input name="primaryColor" type="color" defaultValue={settings?.primary_color ?? "#6d5efc"} className="h-10 w-20 rounded-lg border border-slate-200 dark:border-slate-700" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Default language</label>
            <select name="defaultLanguage" defaultValue={settings?.default_language ?? "en"} className="input-field">
              <option value="en">English</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="maintenanceMode" defaultChecked={settings?.maintenance_mode} />
            Maintenance mode
          </label>
          <button type="submit" className="btn-primary w-full">Save Settings</button>
        </form>
      </div>
    </div>
  );
}
