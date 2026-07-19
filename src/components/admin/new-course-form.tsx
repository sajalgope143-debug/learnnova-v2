"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Category } from "@/types";

export function NewCourseForm({ categories, onCreated }: { categories: Category[]; onCreated?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    price: "",
    discountPrice: "",
    categoryId: "",
    level: "beginner",
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // auto-generate slug from title as a convenience
      if (field === "title") {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        price: Number(form.price) || 0,
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        categoryId: form.categoryId || undefined,
        level: form.level,
        language: "en",
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success("Course created as draft");
    setForm({ title: "", slug: "", price: "", discountPrice: "", categoryId: "", level: "beginner" });
    router.refresh();
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
        <input className="input-field" value={form.title} onChange={(e) => update("title", e.target.value)} required />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Slug</label>
        <input className="input-field" value={form.slug} onChange={(e) => update("slug", e.target.value)} required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Price (₹)</label>
        <input type="number" className="input-field" value={form.price} onChange={(e) => update("price", e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Discount Price (₹)</label>
        <input type="number" className="input-field" value={form.discountPrice} onChange={(e) => update("discountPrice", e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
        <select className="input-field" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Level</label>
        <select className="input-field" value={form.level} onChange={(e) => update("level", e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Course (Draft)"}
        </button>
      </div>
    </form>
  );
}
