"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--accent)]"
    >
      <Printer className="h-4 w-4" />
      Imprimir
    </button>
  );
}
