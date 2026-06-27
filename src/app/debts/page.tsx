import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, CreditCard, DollarSign, TrendingUp, CalendarDays, Receipt, Package, Users } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime, formatCurrency, getLocalDateKey, getLocalDateBounds, getLocalMonthBounds } from "@/lib/utils";

async function getDebts() {
  return prisma.debt.findMany({
    orderBy: { createdAt: "desc" },
    include: { payments: true, items: { include: { product: true } } },
  });
}

export default async function DebtsPage() {
  const debts = await getDebts();

  const { start: todayStart, end: todayEnd } = getLocalDateBounds();
  const { start: monthStart, end: monthEnd } = getLocalMonthBounds();

  const pendingDebts = debts.filter((d) => d.status !== "pagada");
  const todayDebts = debts.filter((d) => d.createdAt >= todayStart && d.createdAt <= todayEnd);
  const monthDebts = debts.filter((d) => d.createdAt >= monthStart && d.createdAt <= monthEnd);

  const pendingTotal = pendingDebts.reduce((s, d) => s + (d.total - d.paidAmount), 0);
  const monthTotal = monthDebts.reduce((s, d) => s + d.total, 0);
  const grandTotal = debts.reduce((s, d) => s + d.total, 0);

  const summaryCards = [
    {
      label: "Pendiente por Cobrar",
      value: pendingTotal,
      subtitle: `${pendingDebts.length} deuda${pendingDebts.length !== 1 ? "s" : ""} activa${pendingDebts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#e88aa5] to-[#d4708e]",
      light: "bg-[#e88aa5]/10",
      icon: DollarSign,
    },
    {
      label: "Este Mes",
      value: monthTotal,
      subtitle: `${monthDebts.length} deuda${monthDebts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#8ab4c8] to-[#7098b0]",
      light: "bg-[#8ab4c8]/10",
      icon: TrendingUp,
    },
    {
      label: "Total Deudado",
      value: grandTotal,
      subtitle: `${debts.length} deuda${debts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#f2b5a3] to-[#e09a88]",
      light: "bg-[#f2b5a3]/10",
      icon: CreditCard,
    },
  ];

  const groupedByDate: Record<string, typeof debts> = {};
  for (const d of debts) {
    const dateKey = getLocalDateKey(d.createdAt);
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(d);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200">
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Deudas</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Control de deudas de clientes</p>
          </div>
        </div>
        <Link
          href="/debts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
        >
          <Plus className="h-4 w-4" />
          Nueva Deuda
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map(({ label, value, subtitle, gradient, light, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${light}`}>
                <Icon className={`h-4 w-4 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                <p className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(value)}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Debt List */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-[var(--foreground)]">Registro de Deudas</h2>
          </div>
        </div>

        {debts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <CreditCard className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">No hay deudas registradas</p>
              <p className="text-xs text-[var(--muted-foreground)]">Registra la primera deuda de un cliente</p>
            </div>
            <Link
              href="/debts/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Registrar primera deuda
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {Object.entries(groupedByDate).map(([dateKey, dateDebts]) => {
              const dateTotal = dateDebts.reduce((s, d) => s + d.total, 0);
              const isToday = dateKey === getLocalDateKey(todayStart);
              return (
                <div key={dateKey} className="divide-y divide-[var(--border)]/50">
                  <div className={`flex items-center justify-between px-6 py-3 ${isToday ? "bg-amber-50" : "bg-[var(--muted)]/50"}`}>
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`h-4 w-4 ${isToday ? "text-amber-500" : "text-[var(--muted-foreground)]"}`} />
                      <span className={`text-sm font-medium ${isToday ? "text-amber-600" : "text-[var(--foreground)]"}`}>
                        {isToday ? "Hoy" : new Date(dateKey + "T00:00:00").toLocaleDateString("es-CO", { timeZone: "America/Bogota", weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(dateTotal)}</span>
                  </div>
                  {dateDebts.map((debt) => {
                    const remaining = debt.total - debt.paidAmount;
                    const isPaid = debt.status === "pagada";
                    const itemsSummary = debt.items.map((i) => i.product?.name ?? i.customName ?? i.customDescription).filter(Boolean).join(", ");
                    return (
                      <Link
                        key={debt.id}
                        href={`/debts/${debt.id}`}
                        className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[var(--card-hover)]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                          <Users className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-[var(--foreground)]">{debt.clientName}</span>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">{itemsSummary || `${debt.items.length} item${debt.items.length !== 1 ? "s" : ""}`}</p>
                        </div>
                        <div className="hidden text-xs text-[var(--muted-foreground)] sm:block">
                          {formatDateTime(debt.createdAt)}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(debt.total)}</div>
                          {!isPaid && remaining > 0 ? (
                            <div className="text-[10px] font-medium text-red-500">
                              Falta: {formatCurrency(remaining)}
                            </div>
                          ) : (
                            <div className="text-[10px] font-medium text-[var(--success)]">Pagada</div>
                          )}
                        </div>
                        <div className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isPaid
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : debt.status === "parcial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {isPaid ? "Pagada" : debt.status === "parcial" ? "Parcial" : "Pendiente"}
                        </div>
                        <DeleteButton id={debt.id} type="debt" />
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
