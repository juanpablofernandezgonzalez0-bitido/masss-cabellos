import { prisma } from "@/lib/prisma";
import {
  DollarSign, ShoppingCart, TrendingUp, Calendar, Users, Package, Truck, Receipt, Sun,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DayPicker } from "./day-picker";
import { HourlySalesChart } from "./hourly-sales-chart";
import { TopProductsChart } from "./top-products-chart";

interface DaySummary {
  revenue: number;
  expenses: number;
  profit: number;
  productsSold: number;
  productsPurchased: number;
  salesCount: number;
  appointmentsCount: number;
  purchasesCount: number;
  uniqueClients: number;
  newClients: number;
}

async function getDayData(dateStr: string) {
  const start = new Date(dateStr + "T00:00:00");
  const end = new Date(dateStr + "T23:59:59.999");

  const [sales, purchases, appointments, newClients] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: { include: { product: true } }, client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: { include: { product: true } } },
    }),
    prisma.appointment.findMany({
      where: { date: { gte: start, lte: end } },
      include: { client: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.client.count({ where: { createdAt: { gte: start, lte: end } } }),
  ]);

  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const expenses = purchases.reduce((s, x) => s + x.total, 0);
  const productsSold = sales.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const productsPurchased = purchases.reduce((s, x) => s + x.items.reduce((si, item) => si + item.quantity, 0), 0);
  const uniqueClients = new Set(sales.filter((s) => s.clientId).map((s) => s.clientId)).size;

  const hourlyMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyMap[i] = 0;
  for (const sale of sales) {
    const hour = new Date(sale.createdAt).getHours();
    hourlyMap[hour] += sale.total;
  }
  const hourlyData = Object.entries(hourlyMap).map(([hour, total]) => ({
    hour: `${hour.padStart(2, "0")}:00`,
    ingresos: total,
  }));

  const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      if (item.productId == null) continue;
      const key = item.product?.name ?? `Producto #${item.productId}`;
      if (!productMap[key]) productMap[key] = { name: key, quantity: 0, revenue: 0 };
      productMap[key].quantity += item.quantity;
      productMap[key].revenue += item.subtotal;
    }
  }
  const topProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

  const summary: DaySummary = {
    revenue,
    expenses,
    profit: revenue - expenses,
    productsSold,
    productsPurchased,
    salesCount: sales.length,
    appointmentsCount: appointments.length,
    purchasesCount: purchases.length,
    uniqueClients,
    newClients,
  };

  return { sales, purchases, appointments, summary, hourlyData, topProducts };
}

export default async function DaySummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: rawDate } = await searchParams;
  const todayStr = new Date().toISOString().split("T")[0];
  const dateStr = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayStr;

  const data = await getDayData(dateStr);

  const selectedDate = new Date(dateStr + "T00:00:00");
  const dateLabel = selectedDate.toLocaleDateString("es-CO", {
    timeZone: "America/Bogota", weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const { summary, sales, appointments, hourlyData, topProducts } = data;

  const summaryCards = [
    { label: "Ingresos", value: summary.revenue, icon: DollarSign, color: "emerald", format: "currency" as const },
    { label: "Gastos", value: summary.expenses, icon: ShoppingCart, color: "rose", format: "currency" as const },
    { label: "Ganancia", value: summary.profit, icon: TrendingUp, color: "blue", format: "currency" as const },
    { label: "Ventas", value: summary.salesCount, icon: Receipt, color: "teal", format: "number" as const },
    { label: "Citas", value: summary.appointmentsCount, icon: Calendar, color: "violet", format: "number" as const },
    { label: "Clientes Nuevos", value: summary.newClients, icon: Users, color: "pink", format: "number" as const },
    { label: "Prod. Vendidos", value: summary.productsSold, icon: Package, color: "orange", format: "number" as const },
    { label: "Prod. Comprados", value: summary.productsPurchased, icon: Truck, color: "amber", format: "number" as const },
  ];

  const colorStyles: Record<string, { gradient: string; bg: string; icon: string; border: string }> = {
    emerald: { gradient: "from-emerald-400 to-emerald-500", bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100" },
    rose: { gradient: "from-rose-400 to-rose-500", bg: "bg-rose-50", icon: "text-rose-500", border: "border-rose-100" },
    blue: { gradient: "from-blue-400 to-blue-500", bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
    teal: { gradient: "from-teal-400 to-teal-500", bg: "bg-teal-50", icon: "text-teal-500", border: "border-teal-100" },
    violet: { gradient: "from-violet-400 to-violet-500", bg: "bg-violet-50", icon: "text-violet-500", border: "border-violet-100" },
    pink: { gradient: "from-pink-400 to-pink-500", bg: "bg-pink-50", icon: "text-pink-500", border: "border-pink-100" },
    orange: { gradient: "from-orange-400 to-orange-500", bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
    amber: { gradient: "from-amber-400 to-amber-500", bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20">
            <Sun className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Resumen del Día</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{dateLabel}</p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <DayPicker selectedDate={dateStr} todayStr={todayStr} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color, format }) => {
          const cs = colorStyles[color];
          return (
            <div key={label} className={`group rounded-xl border ${cs.border} ${cs.bg} p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-md`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cs.gradient} shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                  <p className={`text-base font-bold ${cs.icon}`}>
                    {format === "currency" ? formatCurrency(value) : value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Ventas por Hora</h2>
          <HourlySalesChart data={hourlyData} />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Productos Más Vendidos</h2>
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      {/* Sales List */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--foreground)]">Ventas del Día</h2>
            <span className="ml-auto text-sm text-[var(--muted-foreground)]">
              {summary.salesCount} venta{summary.salesCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {sales.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
              No hay ventas registradas este día
            </div>
          ) : (
            sales.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {s.client?.name || "Cliente General"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {s.items.length} producto{s.items.length !== 1 ? "s" : ""} ·
                    #{String(s.id).padStart(5, "0")} ·
                    {new Date(s.createdAt).toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true })}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(s.total)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--secondary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Citas del Día</h2>
            <span className="ml-auto text-sm text-[var(--muted-foreground)]">
              {appointments.length} cita{appointments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {appointments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
              No hay citas registradas este día
            </div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--secondary)]/10 text-xs font-bold text-[var(--secondary)]">
                  {a.client?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {a.client?.name || "Sin cliente"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {a.time ? `${a.time} · ` : ""}{a.type}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  a.status === "pendiente" ? "bg-amber-50 text-amber-600" :
                  a.status === "realizada" ? "bg-green-50 text-green-600" :
                  "bg-gray-50 text-gray-500"
                }`}>
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
