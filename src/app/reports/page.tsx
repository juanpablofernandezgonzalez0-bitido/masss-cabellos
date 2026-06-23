import { prisma } from "@/lib/prisma";
import {
  BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar,
  Package, Users, Receipt, Truck, Clock, Star, Factory,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { MonthlySalesChart } from "./monthly-sales-chart";
import { TopProductsChart } from "./top-products-chart";
import { WeekdayAppointmentsChart } from "./weekday-chart";
import { ReportsFilter } from "./reports-filter";
import { formatCurrency } from "@/lib/utils";
import type { Period, PeriodSummary, MonthlyData, TopProduct, WeekdayData, RecentSale, RecentPurchase, UpcomingAppointment } from "./types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function detectPeriod(year: number, month: number, date: string | undefined): Period {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) return "today";
  if (month > 0) return "month";
  return "year";
}

function getDateRange(period: Period, year: number, month: number, date?: string) {
  const now = new Date();

  if (period === "today" && date) {
    const d = new Date(date + "T00:00:00");
    return {
      start: d,
      end: new Date(date + "T23:59:59.999"),
      label: d.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    };
  }

  if (period === "month" && month > 0) {
    const m = month - 1;
    return {
      start: new Date(year, m, 1),
      end: new Date(year, m + 1, 0, 23, 59, 59),
      label: `${MONTHS[m]} ${year}`,
    };
  }

  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31, 23, 59, 59),
    label: year === now.getFullYear() ? "Este Año" : `Año ${year}`,
  };
}

async function getSummary(start: Date, end: Date): Promise<PeriodSummary> {
  const [sales, purchases, appointments, activePlans, payrolls, manufactures] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: true, client: { select: { id: true, name: true } } },
    }),
    prisma.purchase.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: true },
    }),
    prisma.appointment.findMany({
      where: { date: { gte: start, lte: end } },
    }),
    prisma.treatmentPlan.findMany({
      where: { status: "activo" },
    }),
    prisma.payroll.findMany({
      where: { paidAt: { gte: start, lte: end } },
    }),
    prisma.manufacture.findMany({
      where: { createdAt: { gte: start, lte: end } },
    }),
  ]);

  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const purchaseExpenses = purchases.reduce((s, x) => s + x.total, 0);
  const payrollExpenses = payrolls.reduce((s, x) => s + x.amount, 0);
  const expenses = purchaseExpenses + payrollExpenses;
  const productsSold = sales.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const productsPurchased = purchases.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const productsManufactured = manufactures.reduce((s, x) => s + x.quantity, 0);
  const uniqueClients = new Set([
    ...sales.filter((s) => s.clientId).map((s) => s.clientId),
    ...appointments.map((a) => a.clientId),
  ]).size;
  const salesCount = sales.length;
  const purchasesCount = purchases.length;

  return {
    revenue,
    expenses,
    payrollExpenses,
    profit: revenue - expenses,
    productsSold,
    appointments: appointments.length,
    activePlans: activePlans.length,
    productsPurchased,
    productsManufactured,
    uniqueClients,
    salesCount,
    purchasesCount,
    avgTicket: salesCount > 0 ? Math.round(revenue / salesCount) : 0,
  };
}

async function getMonthlyData(year: number): Promise<MonthlyData[]> {
  const [sales, purchases, payrolls] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } },
    }),
    prisma.purchase.findMany({
      where: { createdAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } },
    }),
    prisma.payroll.findMany({
      where: { paidAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } },
    }),
  ]);

  return Array.from({ length: 12 }, (_, i) => {
    const ms = sales.filter((s) => s.createdAt.getMonth() === i);
    const mp = purchases.filter((p) => p.createdAt.getMonth() === i);
    const mpr = payrolls.filter((p) => new Date(p.paidAt).getMonth() === i);
    const gastosCompras = mp.reduce((s, x) => s + x.total, 0);
    const gastosNomina = mpr.reduce((s, x) => s + x.amount, 0);
    return {
      month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
      ingresos: ms.reduce((s, x) => s + x.total, 0),
      gastos: gastosCompras + gastosNomina,
    };
  });
}

async function getTopProducts(start: Date, end: Date): Promise<TopProduct[]> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
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

async function getWeekdayData(start: Date, end: Date): Promise<WeekdayData[]> {
  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lte: end } },
  });
  const count = Array(7).fill(0);
  for (const a of appointments) {
    count[new Date(a.date).getDay()]++;
  }
  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, i) => ({ day, citas: count[i] }));
}

async function getManufacturedProducts(start: Date, end: Date): Promise<TopProduct[]> {
  const records = await prisma.manufacture.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { product: { select: { name: true } } },
  });

  const acc: Record<number, TopProduct> = {};
  for (const r of records) {
    if (!acc[r.productId]) {
      acc[r.productId] = { name: r.product.name, quantity: 0, revenue: 0 };
    }
    acc[r.productId].quantity += r.quantity;
  }
  return Object.values(acc).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
}

async function getRecentItems(start: Date, end: Date): Promise<{
  recentSales: RecentSale[];
  recentPurchases: RecentPurchase[];
  upcomingAppointments: UpcomingAppointment[];
}> {
  const [sales, purchases, appointments] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } }, _count: { select: { items: true } } },
    }),
    prisma.purchase.findMany({
      where: { createdAt: { gte: start, lte: end } },
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
    { label: "Nómina", value: summary.payrollExpenses, icon: DollarSign, gradient: "from-[#e88aa5] to-[#d4708e]", light: "bg-[#e88aa5]/10", format: "currency" as const },
    { label: "Ganancia", value: summary.profit, icon: TrendingUp, gradient: "from-[#8ab4c8] to-[#7098b0]", light: "bg-[#8ab4c8]/10", format: "currency" as const },
    { label: "Prod. Vendidos", value: summary.productsSold, icon: Package, gradient: "from-[#f2b5a3] to-[#e09a88]", light: "bg-[#f2b5a3]/10", format: "number" as const },
    { label: "Fabricados", value: summary.productsManufactured, icon: Factory, gradient: "from-[#6ee7b7] to-[#34d399]", light: "bg-[#6ee7b7]/10", format: "number" as const },
    { label: "Citas", value: summary.appointments, icon: Calendar, gradient: "from-[#a78bfa] to-[#8b5cf6]", light: "bg-[#a78bfa]/10", format: "number" as const },
    { label: "Clientes Atend.", value: summary.uniqueClients, icon: Users, gradient: "from-[#f472b6] to-[#ec4899]", light: "bg-[#f472b6]/10", format: "number" as const },
  ];
}

function getMetricCards(summary: PeriodSummary) {
  return [
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
  searchParams: Promise<{ year?: string; month?: string; date?: string }>;
}) {
  const { year: rawYear, month: rawMonth, date: rawDate } = await searchParams;

  const now = new Date();
  const currentYear = now.getFullYear();
  const selectedYear = rawYear ? parseInt(rawYear) : currentYear;
  const selectedMonth = rawMonth ? parseInt(rawMonth) : 0;

  const period = detectPeriod(selectedYear, selectedMonth, rawDate);
  const { start, end, label } = getDateRange(period, selectedYear, selectedMonth, rawDate);
  const summary = await getSummary(start, end);

  const [monthlyData, topProducts, manufacturedProducts, weekdayData, { recentSales, recentPurchases, upcomingAppointments }] =
    await Promise.all([
      getMonthlyData(selectedYear),
      getTopProducts(start, end),
      getManufacturedProducts(start, end),
      getWeekdayData(start, end),
      getRecentItems(start, end),
    ]);

  const dayCards = getDayStats(summary);
  const metricCards = getMetricCards(summary);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
            <BarChart3 className="h-5 w-5 text-[var(--secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Indicadores</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Métricas y estadísticas del negocio</p>
          </div>
        </div>
      </div>

      <ReportsFilter
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={rawDate || ""}
        currentYear={currentYear}
      />

      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
        <span className="text-sm text-[var(--muted-foreground)]">
          Resumen de <strong className="text-[var(--foreground)]">{label}</strong>
        </span>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Factory className="h-4 w-4 text-[#34d399]" />
            Productos Fabricados
          </h2>
          <TopProductsChart data={manufacturedProducts} manufactured />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Calendar className="h-4 w-4 text-[var(--secondary)]" />
            Citas por Día de la Semana
          </h2>
          <WeekdayAppointmentsChart data={weekdayData} />
        </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
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
