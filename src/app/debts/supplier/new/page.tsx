"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupplierDebt } from "@/lib/actions";
import { ArrowLeft, Truck, DollarSign } from "lucide-react";
import Link from "next/link";

export default function NewSupplierDebtPage() {
  const [supplierName, setSupplierName] = useState("");
  const [concept, setConcept] = useState("");
  const [total, setTotal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.set("supplierName", supplierName);
    formData.set("concept", concept);
    formData.set("total", total);

    try {
      await createSupplierDebt(formData);
      router.push("/debts");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al registrar la deuda");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/debts" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a Cobrar/Pagar
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-pink-200">
          <Truck className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nueva DXP</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Registra una deuda con un proveedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Proveedor</label>
          <input
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Nombre del proveedor"
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Concepto</label>
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Ej: Compra de insumos, materia prima, etc."
            className="form-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Total</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-[var(--muted-foreground)]">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={total}
              onChange={(e) => setTotal(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              className="form-input pl-8 text-lg font-semibold"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Total deudado</span>
          </div>
          <span className="text-2xl font-bold text-[var(--foreground)]">${(parseInt(total) || 0).toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/debts" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={submitting || !supplierName || !total} className="btn-primary">
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando...
              </span>
            ) : (
              "Registrar DXP"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
