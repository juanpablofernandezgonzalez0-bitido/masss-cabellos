interface Props {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

export function TimePicker({ name, defaultValue, required }: Props) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  let selectedHour12 = 9;
  let selectedMinute = 0;
  let selectedPeriod = "AM";

  if (defaultValue) {
    const [h, m] = defaultValue.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      selectedPeriod = h >= 12 ? "PM" : "AM";
      selectedHour12 = h % 12 || 12;
      selectedMinute = m;
    }
  }

  return (
    <div className="flex items-center gap-1">
      <select name={`${name}_hour`} defaultValue={selectedHour12} className="form-input w-20 text-center" required={required}>
        {hours.map((h) => (
          <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
        ))}
      </select>
      <span className="text-sm text-[var(--muted-foreground)]">:</span>
      <select name={`${name}_minute`} defaultValue={selectedMinute} className="form-input w-20 text-center" required={required}>
        {minutes.map((m) => (
          <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
        ))}
      </select>
      <select name={`${name}_period`} defaultValue={selectedPeriod} className="form-input w-24 text-center">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
