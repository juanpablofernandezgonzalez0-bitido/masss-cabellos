import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CreditCard, DollarSign, Users, Package, CheckCircle, Clock } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { PayDebtForm } from "./pay-form";

export default async function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debtId = parseInt(id);
  if (isNaN(debtId)) notFound();

  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: { payments: { orderBy: { paidAt: "desc" } }, items: { include: { product: true } } },
  });

  if (!debt) notFound();

  const remaining = debt.total - debt.paidAmount;
  const isPaid = debt.status === "pagada";
  const progress = debt.total > 0 ? Math.round((debt.paidAmount / debt.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/debts" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a deudas
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{debt.clientName}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isPaid
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : debt.status === "parcial"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {isPaid ? "Pagada" : debt.status === "parcial" ? "Parcial" : "Pendiente"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {debt.items.map((item) => (
                <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  <Package className="h-3 w-3" />
                  {item.product?.name ?? (item.customName || item.customDescription)}
                  {item.quantity > 1 && <span className="ml-0.5 font-medium">x{item.quantity}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Progreso de pago</span>
            <span className="font-medium text-[var(--foreground)]">{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-[var(--muted)]">
            <div
              className={`h-2.5 rounded-full transition-all ${
                isPaid ? "bg-[var(--success)]" : "bg-amber-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-[var(--muted)]/50 p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Total</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{formatCurrency(debt.total)}</p>
          </div>
          <div className="rounded-xl bg-[var(--success)]/5 p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--success)]">Pagado</p>
            <p className="text-lg font-bold text-[var(--success)]">{formatCurrency(debt.paidAmount)}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-red-500">Pendiente</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(remaining)}</p>
          </div>
        </div>
      </div>

      {/* Pay Form */}
      {!isPaid && (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-[var(--success)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Registrar Pago</h2>
          </div>
          <PayDebtForm debtId={debt.id} maxAmount={remaining} />
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Historial de Pagos</h2>
          </div>
        </div>
        {debt.payments.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[var(--muted-foreground)]">
            No hay pagos registrados
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {debt.payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--success)]/10">
                  <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Pago de {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatDateTime(payment.paidAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
