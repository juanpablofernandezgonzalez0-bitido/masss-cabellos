"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Calendar } from "lucide-react";
import Link from "next/link";

interface Props {
  q?: string;
  date?: string;
}

export function SalesFilter({ q, date }: Props) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasFilters = q || date;
  const todayStr = new Date().toISOString().split("T")[0];

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (e.target.value) params.set("q", e.target.value);
      if (date) params.set("date", date);
      router.push(`/sales?${params.toString()}`);
    }, 300);
  }, [router, date]);

  const handleDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (e.target.value) params.set("date", e.target.value);
    router.push(`/sales?${params.toString()}`);
  }, [router, q]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          defaultValue={q || ""}
          onChange={handleSearch}
          placeholder="Buscar por cliente..."
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="date"
          defaultValue={date || ""}
          onChange={handleDate}
          max={todayStr}
          className="h-10 rounded-lg border border-[var(--border)] bg-white pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] [color-scheme:light]"
        />
      </div>
      {hasFilters && (
        <Link
          href="/sales"
          className="flex h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Link>
      )}
    </div>
  );
}
