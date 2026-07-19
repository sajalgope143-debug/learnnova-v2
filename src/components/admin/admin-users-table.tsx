"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "@/types";

export function AdminUsersTable({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateUser(userId: string, updates: { role?: string; isActive?: boolean }) {
    setUpdatingId(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    const json = await res.json();
    setUpdatingId(null);

    if (!json.success) {
      toast.error(json.error);
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: (updates.role as Profile["role"]) ?? u.role, is_active: updates.isActive ?? u.is_active }
          : u
      )
    );
    toast.success("User updated");
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Referral Code</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {u.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.referral_code}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={updatingId === u.id}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    className="input-field w-auto py-1 text-xs"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="support">Support</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateUser(u.id, { isActive: !u.is_active })}
                    disabled={updatingId === u.id}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.is_active
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {u.is_active ? "Active" : "Suspended"}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
