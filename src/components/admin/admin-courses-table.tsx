"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Course } from "@/types";

export function AdminCoursesTable({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(courseId: string, status: string) {
    setUpdatingId(courseId);
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, status }),
    });
    const json = await res.json();
    setUpdatingId(null);

    if (!json.success) {
      toast.error(json.error);
      return;
    }
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: status as Course["status"] } : c)));
    toast.success("Course status updated");
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.title}</td>
                <td className="px-4 py-3">₹{c.discount_price ?? c.price}</td>
                <td className="px-4 py-3">{c.total_students}</td>
                <td className="px-4 py-3">{c.average_rating.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    disabled={updatingId === c.id}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    className="input-field w-auto py-1 text-xs"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${c.id}`} className="text-brand-600 dark:text-brand-400">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
