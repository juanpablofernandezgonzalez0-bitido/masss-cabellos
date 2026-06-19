"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import Link from "next/link";

export function PlansFilter({ q }: { q?: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (e.target.value) params.set("q", e.target.value);
      router.push(`/treatment-plans?${params.toString()}`);
    }, 300);
  }, [router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:max-w-xs">
        <input
          type="text"
          defaultValue={q || ""}
          onChange={handleChange}
          placeholder="Buscar por cliente..."
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
        />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      </div>
      {q && (
        <Link
          href="/treatment-plans"
          className="flex h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Link>
      )}
    </div>
  );
}
