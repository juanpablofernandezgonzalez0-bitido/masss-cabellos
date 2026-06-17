"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, X } from "lucide-react";
import Link from "next/link";

export function AppointmentsFilter({ q, dateFilter }: { q?: string; dateFilter?: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (e.target.value) params.set("q", e.target.value);
      if (dateFilter) params.set("date", dateFilter);
      router.push(`/appointments?${params.toString()}`);
    }, 300);
  }, [router, dateFilter]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <input
          name="q"
          defaultValue={q || ""}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre del cliente..."
          className="form-input"
          style={{ paddingLeft: "2.25rem" }}
        />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      </div>
      <div>
        <input
          name="date"
          type="date"
          defaultValue={dateFilter || ""}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (e.target.value) params.set("date", e.target.value);
            router.push(`/appointments?${params.toString()}`);
          }}
          className="form-input"
        />
      </div>
      <div className="flex items-center gap-2">
        {(q || dateFilter) && (
          <Link
            href="/appointments"
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Link>
        )}
      </div>
    </div>
  );
}
