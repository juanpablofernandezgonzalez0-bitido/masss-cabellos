"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, X } from "lucide-react";

interface Props {
  payrollId: number;
  workerName: string;
  defaultDays: number;
  defaultAmount: number;
  defaultNotes: string;
  onClose: () => void;
}

export function EditPayModal({ payrollId, workerName, defaultDays, defaultAmount, defaultNotes, onClose }: Props) {
  const [days, setDays] = useState(String(defaultDays));
  const [amount, setAmount] = useState(String(defaultAmount));
  const [notes, setNotes] = useState(defaultNotes);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const daysNum = parseInt(days);
    const amountNum = parseFloat(amount);

    if (isNaN(daysNum) || daysNum < 1) return setError("Días trabajados inválidos");
    if (isNaN(amountNum) || amountNum < 1) return setError("Monto inválido");

    setLoading(true);

    try {
      const res = await fetch(`/api/payroll/${payrollId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysWorked: daysNum, amount: amountNum, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al editar");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al editar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Editar Pago</h3>
              <p className="text-xs text-[var(--muted-foreground)]">{workerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Días trabajados</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Monto ($)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Nota (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
