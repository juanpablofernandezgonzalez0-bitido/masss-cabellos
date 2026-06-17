import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { MonthlySalesChart } from "./monthly-sales-chart";
import { TopProductsChart } from "./top-products-chart";
import { WeekdayAppointmentsChart } from "./weekday-chart";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const yearStart = new Date(currentYear, 0, 1);
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  const [sales, purchases, products, appointments] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: yearStart } },
      include: { items: { include: { product: true } } },
    }),
    prisma.purchase.findMany({
      where: { createdAt: { gte: yearStart } },
    }),
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.appointment.findMany({
      where: { createdAt: { gte: yearStart } },
    }),
  ]);

  const monthSales = sales.filter((s) => s.createdAt >= monthStart && s.createdAt <= monthEnd);
  const monthPurchases = purchases.filter((p) => p.createdAt >= monthStart && p.createdAt <= monthEnd);
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  const monthExpenses = monthPurchases.reduce((sum, p) => sum + p.total, 0);
  const monthProfit = monthRevenue - monthExpenses;
  const totalSalesYTD = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpensesYTD = purchases.reduce((sum, p) => sum + p.total, 0);

  // Monthly sales data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const ms = sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d.getMonth() === i && d.getFullYear() === currentYear;
    });
    const mp = purchases.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === i && d.getFullYear() === currentYear;
    });
    return {
      month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
      ingresos: ms.reduce((sum, s) => sum + s.total, 0),
      gastos: mp.reduce((sum, p) => sum + p.total, 0),
    };
  });

  // Top products
  const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      if (item.productId == null) continue;
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product?.name ?? "", quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Weekday appointments
  const weekdayCount = Array(7).fill(0);
  for (const a of appointments) {
    weekdayCount[new Date(a.date).getDay()]++;
  }
  const weekdayData = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((name, i) => ({
    day: name,
    citas: weekdayCount[i],
  }));

  const summaryCards = [
    { label: "Ingresos del Mes", value: monthRevenue, icon: DollarSign, gradient: "from-[#7ab893] to-[#5fa07a]", light: "bg-[#7ab893]/10" },
    { label: "Gastos del Mes", value: monthExpenses, icon: ShoppingCart, gradient: "from-[#e88aa5] to-[#d4708e]", light: "bg-[#e88aa5]/10" },
    { label: "Ganancia del Mes", value: monthProfit, icon: TrendingUp, gradient: "from-[#8ab4c8] to-[#7098b0]", light: "bg-[#8ab4c8]/10" },
    { label: "Productos", value: products.length, icon: BarChart3, gradient: "from-[#f2b5a3] to-[#e09a88]", light: "bg-[#f2b5a3]/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
          <BarChart3 className="h-5 w-5 text-[var(--secondary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Reportes</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Análisis y estadísticas del negocio</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, gradient, light }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${light}`}>
                <Icon className={`h-4 w-4 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {label === "Productos" ? value : formatCurrency(value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
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
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Resumen Anual</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--success)]/5 px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Ingresos totales ({currentYear})</span>
              <span className="text-sm font-bold text-[var(--success)]">{formatCurrency(totalSalesYTD)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--primary)]/5 px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Gastos totales ({currentYear})</span>
              <span className="text-sm font-bold text-[var(--primary)]">{formatCurrency(totalExpensesYTD)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[var(--info)]/5 to-[var(--info)]/10 px-4 py-3">
              <span className="text-sm font-semibold text-[var(--foreground)]">Balance neto</span>
              <span className={`text-sm font-bold ${totalSalesYTD - totalExpensesYTD >= 0 ? "text-[var(--success)]" : "text-red-500"}`}>
                {totalSalesYTD - totalExpensesYTD >= 0 ? "+" : ""}{formatCurrency(totalSalesYTD - totalExpensesYTD)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--muted)]/50 px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Total ventas registradas</span>
              <span className="text-sm font-bold text-[var(--foreground)]">{sales.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--muted)]/50 px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Total citas agendadas</span>
              <span className="text-sm font-bold text-[var(--foreground)]">{appointments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}