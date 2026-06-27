"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoiceFromDebt } from "@/lib/actions";
import { Receipt, DollarSign } from "lucide-react";

interface Props {
  debtId: number;
  total: number;
  clientName: string;
}

export function InvoiceForm({ debtId, total, clientName }: Props) {
  const [paid, setPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.set("paid", paid || String(total));
    formData.set("paymentMethod", paymentMethod);
    try {
      const saleId = await createInvoiceFromDebt(debtId, formData);
      router.push(`/sales/${saleId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al generar factura");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4">
        <p className="text-xs text-[var(--muted-foreground)]">Cliente</p>
        <p className="text-sm font-medium text-[var(--foreground)]">{clientName}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">Método de pago</label>
        <div className="flex gap-3">
          <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--border)] p-3 text-sm font-medium transition-all has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5">
            <input type="radio" name="paymentMethod" value="efectivo" checked={paymentMethod === "efectivo"} onChange={() => setPaymentMethod("efectivo")} className="sr-only" />
            💵 Efectivo
          </label>
          <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--border)] p-3 text-sm font-medium transition-all has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5">
            <input type="radio" name="paymentMethod" value="transferencia" checked={paymentMethod === "transferencia"} onChange={() => setPaymentMethod("transferencia")} className="sr-only" />
            🏦 Transferencia
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
          Paga con
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <span className="text-sm text-[var(--muted-foreground)]">$</span>
          </div>
          <input
            value={paid}
            onChange={(e) => setPaid(e.target.value.replace(/[^0-9]/g, ""))}
            type="text"
            inputMode="numeric"
            placeholder={String(total)}
            className="form-input pl-8 text-lg font-semibold"
          />
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Si dejas vacío, se registra como pagado completo ({total.toLocaleString()})
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generando...
            </span>
          ) : (
            <>
              <Receipt className="h-4 w-4" />
              Generar Factura
            </>
          )}
        </button>
      </div>
    </form>
  );
}
