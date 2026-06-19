import { prisma } from "@/lib/prisma";
import {
  BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar,
  Package, Users, Receipt, Truck, Clock, Ticket, Star,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { MonthlySalesChart } from "./monthly-sales-chart";
import { TopProductsChart } from "./top-products-chart";
import { WeekdayAppointmentsChart } from "./weekday-chart";
import { DatePicker } from "./date-picker";
import { formatCurrency } from "@/lib/utils";
import type { Period, PeriodSummary, MonthlyData, TopProduct, WeekdayData, RecentSale, RecentPurchase, UpcomingAppointment } from "./types";

function getDateRange(period: Period) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);

  switch (period) {
    case "today":
      return { start: todayStart, end: todayEnd, label: "Hoy" };
    case "week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - diff);
      return { start: weekStart, end: todayEnd, label: "Esta Semana" };
    }
    case "month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        label: "Este Mes",
      };
    case "year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
        label: "Este Año",
      };
  }
}

async function getPeriodSummary(period: Period): Promise<PeriodSummary> {
  const { start, end } = getDateRange(period);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true, client: { select: { id: true, name: true } } },
  });
  const purchases = await prisma.purchase.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true },
  });
  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lte: end } },
  });
  const activePlans = await prisma.treatmentPlan.findMany({
    where: { status: "activo" },
  });

  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const expenses = purchases.reduce((s, x) => s + x.total, 0);
  const productsSold = sales.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const productsPurchased = purchases.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const uniqueClients = new Set([
    ...sales.filter((s) => s.clientId).map((s) => s.clientId),
    ...appointments.map((a) => a.clientId),
  ]).size;
  const salesCount = sales.length;
  const purchasesCount = purchases.length;

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    productsSold,
    appointments: appointments.length,
    activePlans: activePlans.length,
    productsPurchased,
    uniqueClients,
    salesCount,
    purchasesCount,
    avgTicket: salesCount > 0 ? Math.round(revenue / salesCount) : 0,
  };
}

async function getDaySummary(dateStr: string): Promise<PeriodSummary> {
  const start = new Date(dateStr + "T00:00:00");
  const end = new Date(dateStr + "T23:59:59.999");

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true, client: { select: { id: true, name: true } } },
  });
  const purchases = await prisma.purchase.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true },
  });
  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lte: end } },
  });
  const activePlans = await prisma.treatmentPlan.findMany({
    where: { status: "activo" },
  });

  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const expenses = purchases.reduce((s, x) => s + x.total, 0);
  const productsSold = sales.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const productsPurchased = purchases.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const uniqueClients = new Set([
    ...sales.filter((s) => s.clientId).map((s) => s.clientId),
    ...appointments.map((a) => a.clientId),
  ]).size;
  const salesCount = sales.length;
  const purchasesCount = purchases.length;

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    productsSold,
    appointments: appointments.length,
    activePlans: activePlans.length,
    productsPurchased,
    uniqueClients,
    salesCount,
    purchasesCount,
    avgTicket: salesCount > 0 ? Math.round(revenue / salesCount) : 0,
  };
}

async function getMonthlyData(year: number): Promise<MonthlyData[]> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } },
  });
  const purchases = await prisma.purchase.findMany({
    where: { createdAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } },
  });

  return Array.from({ length: 12 }, (_, i) => {
    const ms = sales.filter((s) => s.createdAt.getMonth() === i);
    const mp = purchases.filter((p) => p.createdAt.getMonth() === i);
    return {
      month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
      ingresos: ms.reduce((s, x) => s + x.total, 0),
      gastos: mp.reduce((s, x) => s + x.total, 0),
    };
  });
}

async function getTopProducts(year: number): Promise<TopProduct[]> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: new Date(year, 0, 1) } },
    include: { items: { include: { product: true } } },
  });

  const acc: Record<number, TopProduct> = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      if (item.productId == null) continue;
      if (!acc[item.productId]) {
        acc[item.productId] = { name: item.product?.name ?? "", quantity: 0, revenue: 0 };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.subtotal;
    }
  }
  return Object.values(acc).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
}

async function getWeekdayData(year: number): Promise<WeekdayData[]> {
  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: new Date(year, 0, 1) } },
  });
  const count = Array(7).fill(0);
  for (const a of appointments) {
    count[new Date(a.date).getDay()]++;
  }
  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, i) => ({ day, citas: count[i] }));
}

async function getRecentItems(): Promise<{
  recentSales: RecentSale[];
  recentPurchases: RecentPurchase[];
  upcomingAppointments: UpcomingAppointment[];
}> {
  const [sales, purchases, appointments] = await Promise.all([
    prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } }, _count: { select: { items: true } } },
    }),
    prisma.purchase.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.appointment.findMany({
      where: { date: { gte: new Date() }, status: "pendiente" },
      orderBy: { date: "asc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  return {
    recentSales: sales.map((s) => ({
      id: s.id,
      clientName: s.client?.name ?? "Sin cliente",
      total: s.total,
      itemsCount: s._count.items,
      createdAt: s.createdAt,
    })),
    recentPurchases: purchases.map((p) => ({
      id: p.id,
      concept: p.concept,
      total: p.total,
      createdAt: p.createdAt,
    })),
    upcomingAppointments: appointments.map((a) => ({
      id: a.id,
      clientName: a.client?.name ?? "Sin cliente",
      date: a.date,
      time: a.time,
      status: a.status,
      type: a.type,
    })),
  };
}

function getDayStats(summary: PeriodSummary) {
  return [
    { label: "Ingresos", value: summary.revenue, icon: DollarSign, gradient: "from-[#7ab893] to-[#5fa07a]", light: "bg-[#7ab893]/10", format: "currency" as const },
    { label: "Gastos", value: summary.expenses, icon: ShoppingCart, gradient: "from-[#e88aa5] to-[#d4708e]", light: "bg-[#e88aa5]/10", format: "currency" as const },
    { label: "Ganancia", value: summary.profit, icon: TrendingUp, gradient: "from-[#8ab4c8] to-[#7098b0]", light: "bg-[#8ab4c8]/10", format: "currency" as const },
    { label: "Prod. Vendidos", value: summary.productsSold, icon: Package, gradient: "from-[#f2b5a3] to-[#e09a88]", light: "bg-[#f2b5a3]/10", format: "number" as const },
    { label: "Citas", value: summary.appointments, icon: Calendar, gradient: "from-[#a78bfa] to-[#8b5cf6]", light: "bg-[#a78bfa]/10", format: "number" as const },
    { label: "Planes Activos", value: summary.activePlans, icon: Star, gradient: "from-[#fbbf24] to-[#f59e0b]", light: "bg-[#fbbf24]/10", format: "number" as const },
    { label: "Prod. Comprados", value: summary.productsPurchased, icon: Truck, gradient: "from-[#34d399] to-[#10b981]", light: "bg-[#34d399]/10", format: "number" as const },
    { label: "Clientes Atend.", value: summary.uniqueClients, icon: Users, gradient: "from-[#f472b6] to-[#ec4899]", light: "bg-[#f472b6]/10", format: "number" as const },
  ];
}

function getMetricCards(summary: PeriodSummary) {
  return [
    { label: "Ticket Promedio", value: formatCurrency(summary.avgTicket), icon: Ticket, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
    { label: "Ventas Realizadas", value: summary.salesCount, icon: Receipt, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
    { label: "Compras Realizadas", value: summary.purchasesCount, icon: Truck, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
    {
      label: "Margen de Ganancia",
      value: summary.revenue > 0 ? `${Math.round((summary.profit / summary.revenue) * 100)}%` : "0%",
      icon: summary.profit >= 0 ? ArrowUpRight : ArrowDownRight,
      color: summary.profit >= 0 ? "text-[var(--success)]" : "text-red-500",
      bg: summary.profit >= 0 ? "bg-[var(--success)]/10" : "bg-red-500/10",
    },
  ];
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { period: rawPeriod, date: rawDate } = await searchParams;

  const hasSpecificDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate);

  const period: Period = hasSpecificDate
    ? "today"
    : (["today", "week", "month", "year"].includes(rawPeriod ?? "")
      ? (rawPeriod as Period)
      : "month");

  const now = new Date();
  const currentYear = now.getFullYear();

  let periodLabel: string;
  let summary: PeriodSummary;

  if (hasSpecificDate) {
    const d = new Date(rawDate! + "T00:00:00");
    periodLabel = d.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    summary = await getDaySummary(rawDate!);
  } else {
    periodLabel = getDateRange(period).label;
    summary = await getPeriodSummary(period);
  }

  const todayStr = now.toISOString().split("T")[0];

  const [monthlyData, topProducts, weekdayData, { recentSales, recentPurchases, upcomingAppointments }] =
    await Promise.all([
      getMonthlyData(currentYear),
      getTopProducts(currentYear),
      getWeekdayData(currentYear),
      getRecentItems(),
    ]);

  const dayCards = getDayStats(summary);
  const metricCards = getMetricCards(summary);

  const periods: { key: Period; label: string }[] = [
    { key: "today", label: "Hoy" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
            <BarChart3 className="h-5 w-5 text-[var(--secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Reportes</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Análisis y estadísticas del negocio</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {periods.map(({ key, label }) => (
          <a
            key={key}
            href={`/reports?period=${key}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              !hasSpecificDate && period === key
                ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--primary)]/20"
                : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
          >
            {label}
          </a>
        ))}
        <div className="h-6 w-px bg-[var(--border)] mx-1" />
        <DatePicker selectedDate={hasSpecificDate ? rawDate! : ""} />
        {hasSpecificDate && (
          <a
            href="/reports?period=month"
            className="text-xs text-[var(--muted-foreground)] underline hover:text-[var(--primary)]"
          >
            Limpiar
          </a>
        )}
      </div>

      {/* Period Label */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
        <span className="text-sm text-[var(--muted-foreground)]">
          Resumen de <strong className="text-[var(--foreground)]">{periodLabel}</strong>
        </span>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dayCards.map(({ label, value, icon: Icon, gradient, light, format }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${light}`}>
                <Icon className={`h-4 w-4 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {format === "currency" ? formatCurrency(value) : value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metricCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Ingresos vs Gastos Mensuales</h2>
          <MonthlySalesChart data={monthlyData} />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Productos Más Vendidos</h2>
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Calendar className="h-4 w-4 text-[var(--secondary)]" />
            Citas por Día de la Semana
          </h2>
          <WeekdayAppointmentsChart data={weekdayData} />
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--secondary)]" />
              <h2 className="font-semibold text-[var(--foreground)]">Próximas Citas</h2>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {upcomingAppointments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
                No hay citas pendientes
              </div>
            ) : (
              upcomingAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--secondary)]/10 text-xs font-bold text-[var(--secondary)]">
                    {a.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{a.clientName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {new Date(a.date).toLocaleDateString("es-CO")} {a.time ? `- ${a.time}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--warning)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--warning)]">
                    {a.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[var(--success)]" />
              <h2 className="font-semibold text-[var(--foreground)]">Últimas Ventas</h2>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentSales.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
                No hay ventas registradas
              </div>
            ) : (
              recentSales.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success)]/10">
                    <DollarSign className="h-4 w-4 text-[var(--success)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{s.clientName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {s.itemsCount} producto{s.itemsCount !== 1 ? "s" : ""} · {new Date(s.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--success)]">{formatCurrency(s.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-semibold text-[var(--foreground)]">Últimas Compras</h2>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentPurchases.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
                No hay compras registradas
              </div>
            ) : (
              recentPurchases.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                    <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{p.concept}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{new Date(p.createdAt).toLocaleDateString("es-CO")}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--primary)]">{formatCurrency(p.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
