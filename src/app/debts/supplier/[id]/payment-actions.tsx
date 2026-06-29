"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSupplierDebtPayment, editSupplierDebtPayment } from "@/lib/actions";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentWithId {
  id: number;
  amount: number;
  paidAt: Date | string;
}

export function SupplierPaymentActions({ payment, debtId }: { payment: PaymentWithId; debtId: number }) {
  const [editing, setEditing] = useState(false);
  const [newAmount, setNewAmount] = useState(String(payment.amount));
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("¿Eliminar este pago? Se recalculará el saldo de la deuda.")) {
      try {
        await deleteSupplierDebtPayment(payment.id);
        router.refresh();
      } catch {
        alert("Error al eliminar el pago");
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("amount", newAmount);
    try {
      await editSupplierDebtPayment(payment.id, formData);
      setEditing(false);
      router.refresh();
    } catch {
      alert("Error al editar el pago");
    }
  };

  if (editing) {
    return (
      <form onSubmit={handleEdit} className="flex items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-[var(--muted-foreground)]">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="h-8 w-28 rounded-lg border border-[var(--border)] pl-5 pr-2 text-sm font-medium outline-none focus:border-[var(--primary)]"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--success)]/10 text-[var(--success)] transition-colors hover:bg-[var(--success)]/20"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setNewAmount(String(payment.amount)); }}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-[var(--foreground)]">{formatCurrency(payment.amount)}</span>
      <button
        onClick={() => setEditing(true)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
        title="Editar monto"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={handleDelete}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
        title="Eliminar pago"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
