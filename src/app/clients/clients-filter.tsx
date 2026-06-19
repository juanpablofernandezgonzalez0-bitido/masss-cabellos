"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import Link from "next/link";

export function ClientsFilter({ q }: { q?: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (e.target.value) params.set("q", e.target.value);
      router.push(`/clients?${params.toString()}`);
    }, 300);
  }, [router]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <input
          defaultValue={q || ""}
          onChange={handleChange}
          placeholder="Buscar por nombre, teléfono o email..."
          className="form-input"
          style={{ paddingLeft: "2.25rem" }}
        />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      </div>
      {q && (
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Link>
      )}
    </div>
  );
}
