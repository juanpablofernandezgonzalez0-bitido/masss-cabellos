import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Truck, DollarSign, TrendingUp, CalendarDays, Receipt, FileText } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime, formatCurrency, getLocalDateKey, getLocalDateBounds, getLocalMonthBounds } from "@/lib/utils";

async function getPurchases() {
  return prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  const { start: todayStart, end: todayEnd } = getLocalDateBounds();
  const { start: monthStart, end: monthEnd } = getLocalMonthBounds();

  const todayPurchases = purchases.filter(
    (p) => p.createdAt >= todayStart && p.createdAt <= todayEnd
  );
  const monthPurchases = purchases.filter(
    (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd
  );

  const todayTotal = todayPurchases.reduce((sum, p) => sum + p.total, 0);
  const monthTotal = monthPurchases.reduce((sum, p) => sum + p.total, 0);
  const grandTotal = purchases.reduce((sum, p) => sum + p.total, 0);

  const summaryCards = [
    {
      label: "Hoy",
      value: todayTotal,
      subtitle: `${todayPurchases.length} compra${todayPurchases.length !== 1 ? "s" : ""}`,
      gradient: "from-[#e88aa5] to-[#d4708e]",
      light: "bg-[#e88aa5]/10",
      icon: CalendarDays,
    },
    {
      label: "Este Mes",
      value: monthTotal,
      subtitle: `${monthPurchases.length} compra${monthPurchases.length !== 1 ? "s" : ""}`,
      gradient: "from-[#8ab4c8] to-[#7098b0]",
      light: "bg-[#8ab4c8]/10",
      icon: TrendingUp,
    },
    {
      label: "Total",
      value: grandTotal,
      subtitle: `${purchases.length} compra${purchases.length !== 1 ? "s" : ""}`,
      gradient: "from-[#f2b5a3] to-[#e09a88]",
      light: "bg-[#f2b5a3]/10",
      icon: DollarSign,
    },
  ];

  const groupedByDate: Record<string, typeof purchases> = {};
  for (const p of purchases) {
    const dateKey = getLocalDateKey(p.createdAt);
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(p);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--info)]/10 to-[var(--info)]/20">
            <Truck className="h-5 w-5 text-[var(--info)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Compras</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Registro de compras del negocio</p>
          </div>
        </div>
        <Link
          href="/purchases/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
        >
          <Plus className="h-4 w-4" />
          Nueva Compra
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

      {/* Daily Register */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Registro de Compras</h2>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <Truck className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">No hay compras registradas</p>
              <p className="text-xs text-[var(--muted-foreground)]">Registra tu primera compra</p>
            </div>
            <Link
              href="/purchases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Registrar primera compra
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {Object.entries(groupedByDate).map(([dateKey, datePurchases]) => {
              const dateTotal = datePurchases.reduce((s, p) => s + p.total, 0);
              const isToday = dateKey === getLocalDateKey(todayStart);
              return (
                <div key={dateKey} className="divide-y divide-[var(--border)]/50">
                  <div className={`flex items-center justify-between px-6 py-3 ${isToday ? "bg-[var(--primary)]/5" : "bg-[var(--muted)]/50"}`}>
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`h-4 w-4 ${isToday ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
                      <span className={`text-sm font-medium ${isToday ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
                        {isToday ? "Hoy" : new Date(dateKey + "T00:00:00").toLocaleDateString("es-CO", { timeZone: "America/Bogota", weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(dateTotal)}</span>
                  </div>
                  {datePurchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[var(--card-hover)]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--info)]/10 to-[var(--primary)]/10">
                        <FileText className="h-4 w-4 text-[var(--info)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-[var(--foreground)]">{purchase.concept}</span>
                      </div>
                      <div className="hidden text-xs text-[var(--muted-foreground)] sm:block">
                        {formatDateTime(purchase.createdAt)}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-lg bg-[var(--info)]/10 px-2.5 py-1 text-sm font-semibold text-[var(--info)]">
                          {formatCurrency(purchase.total)}
                        </span>
                      </div>
                      <DeleteButton id={purchase.id} type="purchase" />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}