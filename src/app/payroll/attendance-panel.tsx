"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { markAttendance } from "@/lib/actions";
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";

interface Worker {
  id: number;
  name: string;
  image: string | null;
}

interface AttendanceRecord {
  id: number;
  workerId: number;
  date: string;
  type: string;
}

interface Props {
  workers: Worker[];
  initialAttendances: AttendanceRecord[];
}

function getMonthDays(year: number, month: number) {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  for (let d = new Date(first); d <= last; d = new Date(d.getTime() + 86400000)) {
    days.push(new Date(d));
  }
  return days;
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function AttendancePanel({ workers, initialAttendances }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [attendances, setAttendances] = useState<Record<string, string>>({});
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const a of initialAttendances) {
      const d = new Date(a.date);
      const key = `${a.workerId}_${formatDate(d)}`;
      map[key] = a.type;
    }
    setAttendances(map);
  }, [initialAttendances]);

  const days = getMonthDays(year, month);

  const handleToggle = useCallback(async (workerId: number, dateStr: string) => {
    const key = `${workerId}_${dateStr}`;
    const current = attendances[key];
    const next = current === "full" ? "half" : current === "half" ? "none" : "full";
    const toggleKey = `${key}_${Date.now()}`;
    setToggling((prev) => ({ ...prev, [key]: true }));

    setAttendances((prev) => {
      const newMap = { ...prev };
      if (next === "none") delete newMap[key];
      else newMap[key] = next;
      return newMap;
    });

    try {
      await markAttendance(workerId, dateStr, next);
      router.refresh();
    } catch {
      setAttendances((prev) => {
        const newMap = { ...prev };
        if (current) newMap[key] = current;
        else delete newMap[key];
        return newMap;
      });
    } finally {
      setToggling((prev) => {
        const newMap = { ...prev };
        delete newMap[key];
        return newMap;
      });
    }
  }, [attendances, router]);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const monthLabel = new Date(year, month).toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const getCellStyle = (type: string | undefined) => {
    switch (type) {
      case "full": return "bg-emerald-500 text-white";
      case "half": return "bg-amber-400 text-white";
      default: return "bg-gray-100 text-gray-400 hover:bg-gray-200";
    }
  };

  const getCellLabel = (type: string | undefined) => {
    switch (type) {
      case "full": return "D";
      case "half": return "M";
      default: return "—";
    }
  };

  const getCellTitle = (type: string | undefined) => {
    switch (type) {
      case "full": return "Día completo";
      case "half": return "Medio día";
      default: return "Sin asistencia (click para marcar)";
    }
  };

  // Calculate totals per worker
  const workerTotals = workers.map((w) => {
    let full = 0;
    let half = 0;
    for (const d of days) {
      const key = `${w.id}_${formatDate(d)}`;
      const type = attendances[key];
      if (type === "full") full++;
      else if (type === "half") half++;
    }
    return { workerId: w.id, full, half };
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-500" />
          <h2 className="font-semibold text-[var(--foreground)]">Asistencia</h2>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--muted)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--muted)]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="ml-auto flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" /> Día completo</span>
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-amber-400" /> Medio día</span>
            <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> Click para alternar</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)] min-w-[120px]">
                Trabajadora
              </th>
              {days.map((d) => (
                <th key={formatDate(d)} className={`px-1 py-2 text-center text-[10px] font-semibold ${d.getDay() === 0 || d.getDay() === 6 ? "text-red-400" : "text-[var(--muted-foreground)]"}`}>
                  <div>{d.getDate()}</div>
                  <div className="text-[8px]">{dayNames[d.getDay()]}</div>
                </th>
              ))}
              <th className="px-2 py-2 text-center text-[10px] font-semibold text-emerald-600">D</th>
              <th className="px-2 py-2 text-center text-[10px] font-semibold text-amber-600">M</th>
              <th className="px-2 py-2 text-center text-[10px] font-semibold text-[var(--muted-foreground)]">Total</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => {
              const totals = workerTotals.find((t) => t.workerId === w.id)!;
              const totalDays = totals.full + totals.half * 0.5;
              return (
                <tr key={w.id} className="border-t border-[var(--border)]/50 transition-colors hover:bg-[var(--card-hover)]">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)]">
                    <div className="flex items-center gap-2">
                      {w.image ? (
                        <img src={w.image} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[10px] font-bold text-white">
                          {w.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate">{w.name}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const dateStr = formatDate(d);
                    const key = `${w.id}_${dateStr}`;
                    const type = attendances[key];
                    const isLoading = toggling[key];
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <td key={dateStr} className="px-1 py-1 text-center">
                        <button
                          onClick={() => handleToggle(w.id, dateStr)}
                          disabled={isLoading}
                          className={`h-7 w-7 rounded-md text-[11px] font-bold transition-all ${getCellStyle(type)} ${isLoading ? "opacity-50" : "cursor-pointer"} ${isWeekend && !type ? "opacity-30" : ""}`}
                          title={getCellTitle(type)}
                        >
                          {isLoading ? "..." : getCellLabel(type)}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-xs font-bold text-emerald-600">{totals.full}</td>
                  <td className="px-2 py-2 text-center text-xs font-bold text-amber-600">{totals.half}</td>
                  <td className="px-2 py-2 text-center text-xs font-bold text-[var(--foreground)]">{totalDays}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
