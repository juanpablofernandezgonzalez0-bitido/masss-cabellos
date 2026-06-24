import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Package, Users, Calendar, ShoppingCart, AlertTriangle, TrendingUp, DollarSign, ArrowRight, Clock, Star, Receipt } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86_400_000);

    const [productCount, clientCount, appointmentCount, salesCount, allProducts, todaySalesDetailed, recentAppointments, totalRevenue, todaySalesCount, todayAppts] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.client.count(),
        prisma.appointment.count({ where: { status: "pendiente" } }),
        prisma.sale.count(),
        prisma.product.findMany({ where: { isActive: true } }),
        prisma.sale.findMany({
          where: { createdAt: { gte: todayStart, lte: todayEnd } },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { client: true, items: { include: { product: true } } },
        }),
        prisma.appointment.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }], take: 5, include: { client: true }, where: { status: "pendiente", date: { gte: todayStart } } }),
        prisma.sale.aggregate({ _sum: { total: true } }),
        prisma.sale.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
        prisma.appointment.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: "pendiente" } }),
      ]);

    const lowStockProducts = allProducts.filter((p) => p.stock < p.minStock).slice(0, 5);
    const todayRevenue = todaySalesDetailed.reduce((s, x) => s + x.total, 0);

    return {
      productCount, clientCount, appointmentCount, salesCount,
      lowStockProducts, todaySalesDetailed, recentAppointments,
      totalRevenue: totalRevenue._sum.total || 0,
      todaySales: todaySalesCount, todayRevenue, todayAppts,
    };
  } catch (error) {
    console.error("Error cargando dashboard:", error);
    return {
      productCount: 0, clientCount: 0, appointmentCount: 0, salesCount: 0,
      lowStockProducts: [], todaySalesDetailed: [], recentAppointments: [],
      totalRevenue: 0, todaySales: 0, todayRevenue: 0, todayAppts: 0,
    };
  }
}

export default async function Home() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const d = await getDashboardData();
  const today = new Date();
  const dateStr = today.toLocaleDateString("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const cards = [
    { label: "Productos", value: d.productCount, icon: Package, href: "/products", color: "pink" },
    { label: "Clientes", value: d.clientCount, icon: Users, href: "/clients", color: "blue" },
    { label: "Citas Pendientes", value: d.appointmentCount, icon: Calendar, href: "/appointments", color: "orange" },
    { label: "Ventas Totales", value: d.salesCount, icon: ShoppingCart, href: "/sales", color: "green" },
  ] as const;

  const colorMap: Record<string, { from: string; to: string; light: string; ring: string; icon: string }> = {
    pink:    { from: "from-pink-400", to: "to-rose-500", light: "bg-pink-50", ring: "ring-pink-200", icon: "text-pink-500" },
    blue:    { from: "from-sky-400", to: "to-blue-500", light: "bg-sky-50", ring: "ring-sky-200", icon: "text-sky-500" },
    orange:  { from: "from-orange-400", to: "to-amber-500", light: "bg-orange-50", ring: "ring-orange-200", icon: "text-orange-500" },
    green:   { from: "from-emerald-400", to: "to-teal-500", light: "bg-emerald-50", ring: "ring-emerald-200", icon: "text-emerald-500" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{dateStr}</p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 px-5 py-3">
            <DollarSign className="h-5 w-5 text-pink-500" />
            <div>
              <p className="text-xs font-medium text-pink-600/70 uppercase tracking-wider">Ingresos Hoy</p>
              <p className="text-lg font-bold text-pink-600">${d.todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Today mini-bar */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50">
            <TrendingUp className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Ventas hoy</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{d.todaySales}{isAdmin && <span className="text-sm font-normal text-[var(--muted-foreground)]"> · ${d.todayRevenue.toLocaleString()}</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
            <Calendar className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Citas hoy</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{d.todayAppts}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Star className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Clientes registrados</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{d.clientCount}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => {
          const c = colorMap[color];
          return (
            <Link key={href} href={href}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
            >
              <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${c.from} ${c.to} opacity-[0.06]`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
                  <p className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.light} ring-1 ${c.ring}`}>
                  <Icon className={`h-5.5 w-5.5 ${c.icon}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-pink-500 opacity-0 transition-opacity group-hover:opacity-100">
                Ver detalles <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Low Stock & Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {d.lowStockProducts.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="font-semibold text-[var(--foreground)]">Stock Bajo</h2>
            </div>
            <div className="space-y-3">
              {d.lowStockProducts.map((p) => {
                const ratio = p.minStock > 0 ? p.stock / p.minStock : 1;
                const barColor = ratio < 0.3 ? "bg-red-500" : ratio < 0.6 ? "bg-amber-500" : "bg-yellow-400";
                return (
                  <div key={p.id} className="group rounded-xl bg-red-50/40 px-4 py-3 transition-all hover:bg-red-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--foreground)]">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-500">{p.stock}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">/ {p.minStock}</span>
                        <Link href={`/products/${p.id}/edit`}
                          className="ml-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-pink-500 shadow-sm opacity-0 transition-all group-hover:opacity-100">
                          Reponer
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-red-100">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
              <h2 className="font-semibold text-[var(--foreground)]">Próximas Citas</h2>
            </div>
            {d.recentAppointments.length > 0 && (
              <Link href="/appointments" className="text-xs font-medium text-pink-500 hover:underline">Ver todas</Link>
            )}
          </div>
          {d.recentAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-[var(--accent)] py-10">
              <Calendar className="h-8 w-8 text-[var(--muted-foreground)]" />
              <p className="text-sm text-[var(--muted-foreground)]">No hay citas pendientes</p>
              <Link href="/appointments/new"
                className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">
                Agendar cita
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {d.recentAppointments.map((a) => (
                <div key={a.id}
                  className="group flex items-center justify-between rounded-xl bg-[var(--accent)] px-4 py-3 transition-all hover:bg-orange-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                      {a.client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{a.client.name}</p>
                      <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Clock className="h-3 w-3" />
                        {new Date(a.date).toLocaleDateString("es-CO", { timeZone: "America/Bogota", weekday: "short", day: "numeric", month: "short" })}
                        {a.time ? ` - ${a.time}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-orange-400/10 to-amber-400/10 px-3 py-1 text-xs font-medium text-orange-600 capitalize">
                    {a.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Sales */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="font-semibold text-[var(--foreground)]">
              Ventas de Hoy
              {d.todaySales > 0 && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{d.todaySales}</span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {d.todaySales > 0 && (
              <Link href="/sales"
                className="text-xs font-medium text-pink-500 hover:underline">Ver todas</Link>
            )}
            <Link href="/sales/new"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md">
              <ShoppingCart className="h-3.5 w-3.5" />
              Nueva venta
            </Link>
          </div>
        </div>
        {d.todaySalesDetailed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-[var(--accent)] py-10">
            <ShoppingCart className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">No hay ventas hoy</p>
            <Link href="/sales/new"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">
              Registrar venta
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {d.todaySalesDetailed.map((s) => {
              const saleDate = new Date(s.createdAt);
              const saleTime = saleDate.toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true });
              return (
                <Link key={s.id} href={`/sales/${s.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-colors hover:bg-[var(--accent)] -mx-5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <Receipt className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {s.client?.name || "Cliente General"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {s.items.length} producto{s.items.length !== 1 ? "s" : ""} · #{String(s.id).padStart(5, "0")} · {saleTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--foreground)]">${s.total.toLocaleString()}</p>
                    <p className="text-xs text-[var(--muted-foreground)] capitalize">
                      {s.paymentMethod === "transferencia" ? "Transferencia" : "Efectivo"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
