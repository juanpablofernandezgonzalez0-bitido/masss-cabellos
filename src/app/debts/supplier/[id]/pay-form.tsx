"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paySupplierDebt } from "@/lib/actions";
import { DollarSign } from "lucide-react";

interface Props {
  debtId: number;
  maxAmount: number;
}

export function PaySupplierDebtForm({ debtId, maxAmount }: Props) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.set("amount", amount);
    try {
      await paySupplierDebt(debtId, formData);
      router.refresh();
      setAmount("");
    } catch {
      alert("Error al registrar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span className="text-sm text-[var(--muted-foreground)]">$</span>
        </div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          max={maxAmount}
          step="0.01"
          className="form-input pl-8 text-lg font-bold"
          placeholder={`Máximo ${formatSimpleCurrency(maxAmount)}`}
          required
        />
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting || !amount || parseFloat(amount) <= 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--success)] to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Registrando...
            </span>
          ) : (
            <>
              <DollarSign className="h-4 w-4" />
              Registrar Pago
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function formatSimpleCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
