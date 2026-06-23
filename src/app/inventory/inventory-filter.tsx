"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Period = "week" | "month" | "year";

interface Props {
  period: Period;
}

export function InventoryFilter({ period }: Props) {
  const pathname = usePathname();

  const periods: { key: Period; label: string }[] = [
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map(({ key, label }) => (
        <Link
          key={key}
          href={`${pathname}?period=${key}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            period === key
              ? "bg-gradient-to-r from-[#a18cd1] to-[#d57eeb] text-white shadow-lg shadow-[#a18cd1]/20"
              : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:border-[#a18cd1] hover:text-[#a18cd1]"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
