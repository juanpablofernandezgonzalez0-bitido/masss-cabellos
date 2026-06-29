import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, CreditCard, DollarSign, TrendingUp, CalendarDays, Receipt, Package, Users, Building2, Truck } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime, formatCurrency, getLocalDateKey, getLocalDateBounds, getLocalMonthBounds } from "@/lib/utils";

async function getDebts() {
  return prisma.debt.findMany({
    orderBy: { createdAt: "desc" },
    include: { payments: true, items: { include: { product: true } } },
  });
}

async function getSupplierDebts() {
  return prisma.supplierDebt.findMany({
    orderBy: { createdAt: "desc" },
    include: { payments: true },
  });
}

export default async function DebtsPage() {
  const [debts, supplierDebts] = await Promise.all([getDebts(), getSupplierDebts()]);

  const { start: todayStart, end: todayEnd } = getLocalDateBounds();
  const { start: monthStart, end: monthEnd } = getLocalMonthBounds();

  // --- DPC: Deudas por Cobrar (clientes) ---
  const pendingDebts = debts.filter((d) => d.status !== "pagada");
  const todayDebts = debts.filter((d) => d.createdAt >= todayStart && d.createdAt <= todayEnd);
  const monthDebts = debts.filter((d) => d.createdAt >= monthStart && d.createdAt <= monthEnd);

  const pendingTotal = pendingDebts.reduce((s, d) => s + (d.total - d.paidAmount), 0);
  const monthTotal = monthDebts.reduce((s, d) => s + d.total, 0);
  const grandTotal = debts.reduce((s, d) => s + d.total, 0);

  // --- DXP: Deudas por Pagar (proveedores) ---
  const pendingSupplier = supplierDebts.filter((d) => d.status !== "pagada");
  const todaySupplier = supplierDebts.filter((d) => d.createdAt >= todayStart && d.createdAt <= todayEnd);
  const monthSupplier = supplierDebts.filter((d) => d.createdAt >= monthStart && d.createdAt <= monthEnd);

  const pendingSupplierTotal = pendingSupplier.reduce((s, d) => s + (d.total - d.paidAmount), 0);
  const monthSupplierTotal = monthSupplier.reduce((s, d) => s + d.total, 0);
  const grandSupplierTotal = supplierDebts.reduce((s, d) => s + d.total, 0);

  // --- Agrupación DPC ---
  const groupedByDate: Record<string, typeof debts> = {};
  for (const d of debts) {
    const dateKey = getLocalDateKey(d.createdAt);
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(d);
  }

  const dpcSummaryCards = [
    {
      label: "Pendiente DPC",
      value: pendingTotal,
      subtitle: `${pendingDebts.length} deuda${pendingDebts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#7ab893] to-[#5fa07a]",
      light: "bg-[#7ab893]/10",
      icon: DollarSign,
    },
    {
      label: "Este Mes DPC",
      value: monthTotal,
      subtitle: `${monthDebts.length} deuda${monthDebts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#8ab4c8] to-[#7098b0]",
      light: "bg-[#8ab4c8]/10",
      icon: TrendingUp,
    },
    {
      label: "Total DPC",
      value: grandTotal,
      subtitle: `${debts.length} deuda${debts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#f2b5a3] to-[#e09a88]",
      light: "bg-[#f2b5a3]/10",
      icon: CreditCard,
    },
  ];

  const dxpSummaryCards = [
    {
      label: "Pendiente DXP",
      value: pendingSupplierTotal,
      subtitle: `${pendingSupplier.length} deuda${pendingSupplier.length !== 1 ? "s" : ""}`,
      gradient: "from-[#e88aa5] to-[#d4708e]",
      light: "bg-[#e88aa5]/10",
      icon: DollarSign,
    },
    {
      label: "Este Mes DXP",
      value: monthSupplierTotal,
      subtitle: `${monthSupplier.length} deuda${monthSupplier.length !== 1 ? "s" : ""}`,
      gradient: "from-[#f2b5a3] to-[#e09a88]",
      light: "bg-[#f2b5a3]/10",
      icon: TrendingUp,
    },
    {
      label: "Total DXP",
      value: grandSupplierTotal,
      subtitle: `${supplierDebts.length} deuda${supplierDebts.length !== 1 ? "s" : ""}`,
      gradient: "from-[#8ab4c8] to-[#7098b0]",
      light: "bg-[#8ab4c8]/10",
      icon: Truck,
    },
  ];

  const renderSummaryCards = (cards: typeof dpcSummaryCards) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map(({ label, value, subtitle, gradient, light, icon: Icon }) => (
        <div key={label} className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)]">
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
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200">
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Cobrar/Pagar</h1>
            <p className="text-sm text-[var(--muted-foreground)]">DPC · Deudas por Cobrar & DXP · Deudas por Pagar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/debts/supplier/new"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]"
          >
            <Plus className="h-4 w-4" />
            Nueva DXP
          </Link>
          <Link
            href="/debts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
          >
            <Plus className="h-4 w-4" />
            Nueva DPC
          </Link>
        </div>
      </div>

      {/* ===== DPC: Deudas por Cobrar ===== */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">Deudas por Cobrar (DPC)</h2>
          <span className="ml-auto text-sm text-[var(--muted-foreground)]">{debts.length} registro{debts.length !== 1 ? "s" : ""}</span>
        </div>
        {renderSummaryCards(dpcSummaryCards)}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-[var(--foreground)]">Registro DPC</h2>
          </div>
        </div>
        {debts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <CreditCard className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">No hay deudas por cobrar</p>
              <p className="text-xs text-[var(--muted-foreground)]">Registra la primera deuda de un cliente</p>
            </div>
            <Link
              href="/debts/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Registrar primera DPC
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

      {/* ===== DXP: Deudas por Pagar ===== */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Truck className="h-5 w-5 text-rose-500" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">Deudas por Pagar (DXP)</h2>
          <span className="ml-auto text-sm text-[var(--muted-foreground)]">{supplierDebts.length} registro{supplierDebts.length !== 1 ? "s" : ""}</span>
        </div>
        {renderSummaryCards(dxpSummaryCards)}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-rose-500" />
            <h2 className="font-semibold text-[var(--foreground)]">Registro DXP</h2>
          </div>
        </div>
        {supplierDebts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <Truck className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">No hay deudas por pagar</p>
              <p className="text-xs text-[var(--muted-foreground)]">Registra la primera deuda a un proveedor</p>
            </div>
            <Link
              href="/debts/supplier/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Registrar primera DXP
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {supplierDebts.map((debt) => {
              const remaining = debt.total - debt.paidAmount;
              const isPaid = debt.status === "pagada";
              return (
                <div key={debt.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-100 to-pink-100">
                    <Building2 className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-[var(--foreground)]">{debt.supplierName}</span>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{debt.concept || `Deuda #${debt.id}`}</p>
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
                  <Link
                    href={`/debts/supplier/${debt.id}`}
                    className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Pagar
                  </Link>
                  <DeleteButton id={debt.id} type="supplierDebt" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
