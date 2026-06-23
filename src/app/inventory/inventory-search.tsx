"use client";

import { useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import Link from "next/link";

export function InventorySearch({ q }: { q?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (e.target.value) params.set("q", e.target.value);
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }, [router, pathname]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          defaultValue={q || ""}
          onChange={handleChange}
          placeholder="Buscar en historial por nombre de producto..."
          className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
        />
      </div>
      {q && (
        <Link
          href={pathname}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Link>
      )}
    </div>
  );
}
