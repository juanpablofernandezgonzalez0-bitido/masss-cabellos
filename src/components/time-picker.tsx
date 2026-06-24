"use client";

import { useState } from "react";

interface Props {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

function to24h(hour12: number, minute: number, period: string): string {
  const h = period === "PM" && hour12 !== 12 ? hour12 + 12
    : period === "AM" && hour12 === 12 ? 0
    : hour12;
  return `${h.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function from24h(time: string): { hour12: number; minute: number; period: string } {
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return { hour12: 12, minute: 0, period: "AM" };
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return { hour12, minute: m, period };
}

export function TimePicker({ name, defaultValue, required }: Props) {
  const init = defaultValue ? from24h(defaultValue) : { hour12: 9, minute: 0, period: "AM" };
  const [hour, setHour] = useState(init.hour12);
  const [minute, setMinute] = useState(init.minute);
  const [period, setPeriod] = useState(init.period);

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={to24h(hour, minute, period)} />
      <select
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
        className="form-input w-20 text-center"
        required={required}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
        ))}
      </select>
      <span className="text-sm text-[var(--muted-foreground)]">:</span>
      <select
        value={minute}
        onChange={(e) => setMinute(Number(e.target.value))}
        className="form-input w-20 text-center"
        required={required}
      >
        {Array.from({ length: 60 }, (_, i) => i).map((m) => (
          <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
        ))}
      </select>
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="form-input w-24 text-center"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
