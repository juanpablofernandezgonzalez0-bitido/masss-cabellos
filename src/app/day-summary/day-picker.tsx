"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  selectedDate: string;
  todayStr: string;
}

export function DayPicker({ selectedDate, todayStr }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="date"
          defaultValue={selectedDate}
          onChange={(e) => {
            const val = e.target.value;
            if (val) router.push(`/day-summary?date=${val}`);
          }}
          className="h-10 rounded-lg border border-[var(--border)] bg-white pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] [color-scheme:light]"
        />
      </div>
      {selectedDate !== todayStr && (
        <a
          href="/day-summary"
          className="text-xs text-[var(--muted-foreground)] underline hover:text-[var(--primary)]"
        >
          Hoy
        </a>
      )}
    </div>
  );
}
