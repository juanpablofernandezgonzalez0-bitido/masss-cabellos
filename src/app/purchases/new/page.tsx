"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/lib/actions";
import { ArrowLeft, Truck, DollarSign, FileText, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function NewPurchasePage() {
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.set("concept", concept);
    formData.set("amount", amount);
    try {
      await createPurchase(formData);
      router.push("/purchases");
      router.refresh();
    } catch {
      alert("Error al registrar la inversión");
      setSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString("es-CO", {
    timeZone: "America/Bogota", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/purchases" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a compras
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--info)]/10 to-[var(--info)]/20">
          <Truck className="h-5 w-5 text-[var(--info)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nueva Compra</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Registra una nueva compra</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
          <CalendarDays className="h-3.5 w-3.5" />
          Registrando para: <span className="font-medium text-[var(--foreground)]">{today}</span>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
            Concepto de la compra
          </label>
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="form-input"
            placeholder="Ej: Muebles para el local, Papelería, Herramientas..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
            Valor
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <span className="text-sm text-[var(--muted-foreground)]">$</span>
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="form-input pl-8 text-lg font-bold"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[var(--muted)] to-[var(--accent)] px-5 py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--info)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Total del día</span>
          </div>
          <span className="text-xl font-bold text-[var(--foreground)]">
            ${parseFloat(amount || "0").toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/purchases" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={submitting || !concept || !amount} className="btn-primary">
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando...
              </span>
            ) : (
              "Registrar Compra"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}