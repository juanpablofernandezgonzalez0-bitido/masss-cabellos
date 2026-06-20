"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, CheckCircle } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface Payment {
  id: number;
  amount: number;
  notes: string;
  paidAt: string;
}

export function PlanPayments({ planId, price, paidAmount, remainingSessions }: { planId: number; price: number; paidAmount: number; remainingSessions: number }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      const res = await fetch(`/api/treatment-plans/payments?planId=${planId}`);
      if (res.ok) setPayments(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadPayments(); }, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) { alert("Ingresa un monto válido"); return; }
    if (paidAmount + parsedAmount > price) { alert("El total pagado no puede exceder el precio del plan"); return; }
    try {
      const res = await fetch("/api/treatment-plans/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, amount: parsedAmount, notes }),
      });
      if (!res.ok) { const err = await res.json(); alert(err.error || "Error al registrar pago"); return; }
      setAmount("");
      setNotes("");
      setShowForm(false);
      await loadPayments();
      window.location.reload();
    } catch (e) { alert("Error al registrar pago"); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      const res = await fetch(`/api/treatment-plans/payments/${id}`, { method: "DELETE" });
      if (!res.ok) { alert("Error al eliminar pago"); return; }
      await loadPayments();
      window.location.reload();
    } catch (e) { alert("Error al eliminar pago"); }
  };

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const pct = price > 0 ? Math.min(100, Math.round((totalPaid / price) * 100)) : 0;
  const isPaid = price > 0 && totalPaid >= price;
  const remaining = price - totalPaid;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[var(--muted-foreground)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Pagos del Plan</h2>
        </div>
        {!isPaid && remainingSessions > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar Pago
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-[var(--border)] bg-[var(--accent)] p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Monto</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="$0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                required
                className="form-input text-lg font-semibold"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Nota (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Abono de marzo"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
            <button type="submit" className="btn-primary text-sm">Registrar</button>
          </div>
        </form>
      )}

      <div className="px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-[var(--muted-foreground)]">
            {isPaid ? "Plan pagado" : `Pagado: ${formatCurrency(totalPaid)} de ${formatCurrency(price)}`}
          </span>
          {isPaid && <CheckCircle className="h-5 w-5 text-[var(--success)]" />}
        </div>
        {price > 0 && (
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
            <div className={`h-full rounded-full transition-all ${isPaid ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`} style={{ width: `${pct}%` }} />
          </div>
        )}
        {!isPaid && price > 0 && (
          <p className="text-xs text-[var(--muted-foreground)]">
            Saldo pendiente: <span className="font-semibold text-[var(--foreground)]">{formatCurrency(remaining)}</span>
          </p>
        )}
      </div>

      {payments.length > 0 && (
        <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-[var(--card-hover)]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--success)]/10">
                  <DollarSign className="h-4 w-4 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{formatCurrency(payment.amount)}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{formatDateTime(payment.paidAt)}</span>
                    {payment.notes && <span>— {payment.notes}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(payment.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && payments.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-8">
          <DollarSign className="h-8 w-8 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            {price > 0 ? "No hay pagos registrados para este plan" : "Este plan no tiene costo"}
          </p>
        </div>
      )}
    </div>
  );
}
