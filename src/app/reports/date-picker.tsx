"use client";

import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  selectedDate: string;
}

export function DatePicker({ selectedDate }: Props) {
  const router = useRouter();

  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          const val = e.target.value;
          if (val) router.push(`/reports?date=${val}`);
        }}
        className="h-10 rounded-lg border border-[var(--border)] bg-white pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] [color-scheme:light]"
      />
    </div>
  );
}
