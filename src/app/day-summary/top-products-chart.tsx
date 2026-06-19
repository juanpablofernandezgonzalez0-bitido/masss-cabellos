"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { name: string; quantity: number; revenue: number }[];
}

export function TopProductsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-[var(--muted-foreground)]">
        No se vendieron productos este día
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          formatter={(value, name) => [
            name === "quantity" ? `${Number(value)} und.` : `$${Number(value).toLocaleString()}`,
            name === "quantity" ? "Cantidad" : "Ingresos",
          ]}
        />
        <Bar dataKey="quantity" name="quantity" fill="#f2b5a3" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
