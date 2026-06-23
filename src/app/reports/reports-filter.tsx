"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown } from "lucide-react";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Props {
  selectedYear: number;
  selectedMonth: number;
  selectedDate: string;
  currentYear: number;
}

export function ReportsFilter({ selectedYear, selectedMonth, selectedDate, currentYear }: Props) {
  const router = useRouter();

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    router.push(`/reports?${sp.toString()}`);
  }

  const yearOptions: number[] = [];
  for (let y = currentYear; y >= 2024; y--) yearOptions.push(y);

  const showClear = selectedMonth > 0 || selectedDate || selectedYear !== currentYear;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-end gap-3">
        {/* Año */}
        <div className="min-w-[100px]">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Año
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => {
                navigate({
                  year: e.target.value,
                  ...(selectedMonth > 0 ? { month: String(selectedMonth) } : {}),
                  ...(selectedDate ? { date: selectedDate } : {}),
                });
              }}
              className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white py-2 pl-3 pr-8 text-sm font-medium text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          </div>
        </div>

        {/* Mes */}
        <div className="min-w-[130px]">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Mes
          </label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                const val = e.target.value;
                navigate({
                  year: String(selectedYear),
                  ...(val ? { month: val } : {}),
                  ...(selectedDate ? { date: selectedDate } : {}),
                });
              }}
              className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white py-2 pl-3 pr-8 text-sm font-medium text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="0">Todos</option>
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          </div>
        </div>

        {/* Día */}
        <div className="min-w-[140px]">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Día
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                navigate({
                  year: String(selectedYear),
                  ...(selectedMonth > 0 ? { month: String(selectedMonth) } : {}),
                  ...(val ? { date: val } : {}),
                });
              }}
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-sm font-medium text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] [color-scheme:light]"
            />
          </div>
        </div>

        {showClear && (
          <button
            onClick={() => router.push("/reports")}
            className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
