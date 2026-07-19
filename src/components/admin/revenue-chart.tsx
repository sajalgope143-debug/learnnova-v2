"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function AdminRevenueChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([month, revenue]) => ({ month, revenue }));

  if (chartData.length === 0) {
    return <div className="mt-6 py-16 text-center text-sm text-slate-400">No revenue data yet.</div>;
  }

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`₹${value}`, "Revenue"]} />
          <Bar dataKey="revenue" fill="#6d5efc" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
