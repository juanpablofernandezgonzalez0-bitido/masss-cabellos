import { prisma } from "@/lib/prisma";
import { Package, Users, Calendar, ShoppingCart, AlertTriangle, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const [productCount, clientCount, appointmentCount, salesCount, lowStockProducts, recentSales, recentAppointments, totalRevenue] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.client.count(),
      prisma.appointment.count({ where: { status: "pendiente" } }),
      prisma.sale.count(),
      prisma.product.findMany({ where: { stock: { lte: prisma.product.fields.minStock }, isActive: true }, take: 5 }),
      prisma.sale.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { client: true, items: { include: { product: true } } } }),
      prisma.appointment.findMany({ orderBy: { date: "asc" }, take: 5, include: { client: true }, where: { status: "pendiente" } }),
      prisma.sale.aggregate({ _sum: { total: true } }),
    ]);
  return { productCount, clientCount, appointmentCount, salesCount, lowStockProducts, recentSales, recentAppointments, totalRevenue: totalRevenue._sum.total || 0 };
}

export default async function Home() {
  const data = await getDashboardData();

  const cards = [
    { label: "Productos", value: data.productCount, icon: Package, href: "/products", gradient: "from-[#e88aa5] to-[#d4708e]", light: "bg-[#e88aa5]/10" },
    { label: "Clientes", value: data.clientCount, icon: Users, href: "/clients", gradient: "from-[#8ab4c8] to-[#7098b0]", light: "bg-[#8ab4c8]/10" },
    { label: "Citas Pendientes", value: data.appointmentCount, icon: Calendar, href: "/appointments", gradient: "from-[#f2b5a3] to-[#e09a88]", light: "bg-[#f2b5a3]/10" },
    { label: "Ventas Totales", value: data.salesCount, icon: ShoppingCart, href: "/sales", gradient: "from-[#7ab893] to-[#5fa07a]", light: "bg-[#7ab893]/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-[var(--muted-foreground)]">Resumen general del negocio</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 px-4 py-2.5 sm:flex">
          <DollarSign className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--primary-dark)]">
            Ingresos totales: <span className="font-bold">${data.totalRevenue.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href, gradient, light }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br opacity-5" />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
                <p className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${light}`}>
                <Icon className={`h-5.5 w-5.5 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
              Ver detalles <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile revenue badge (visible only on small screens) */}
      <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 px-4 py-2.5 sm:hidden">
        <DollarSign className="h-4 w-4 text-[var(--primary)]" />
        <span className="text-sm font-medium text-[var(--primary-dark)]">
          Ingresos totales: <span className="font-bold">${data.totalRevenue.toLocaleString()}</span>
        </span>
      </div>

      {/* Low Stock & Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {data.lowStockProducts.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
              </div>
              <h2 className="font-semibold text-[var(--foreground)]">Productos con Stock Bajo</h2>
            </div>
            <div className="space-y-3">
              {data.lowStockProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between rounded-xl bg-red-50/50 px-4 py-3 transition-all hover:bg-red-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-600">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-[var(--foreground)]">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-500">{p.stock}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">uds.</span>
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="ml-2 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-[var(--primary)] shadow-sm max-sm:opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                    >
                      Reponer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--secondary)]/10">
                <Calendar className="h-4 w-4 text-[var(--secondary)]" />
              </div>
              <h2 className="font-semibold text-[var(--foreground)]">Próximas Citas</h2>
            </div>
            {data.recentAppointments.length > 0 && (
              <Link
                href="/appointments"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Ver todas
              </Link>
            )}
          </div>
          {data.recentAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-[var(--muted)] py-10">
              <Calendar className="h-8 w-8 text-[var(--muted-foreground)]" />
              <p className="text-sm text-[var(--muted-foreground)]">No hay citas pendientes</p>
              <Link
                href="/appointments/new"
                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--primary-dark)]"
              >
                Agendar cita
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentAppointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--accent)] px-4 py-3 transition-all hover:bg-[var(--primary)]/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10">
                      <Users className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{a.client.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(a.date).toLocaleDateString()} {a.time ? `- ${a.time}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary-dark)] capitalize">
                    {a.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <TrendingUp className="h-4 w-4 text-[var(--success)]" />
            </div>
            <h2 className="font-semibold text-[var(--foreground)]">Últimas Ventas</h2>
          </div>
          {data.recentSales.length > 0 && (
            <Link
              href="/sales/new"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Nueva venta
            </Link>
          )}
        </div>
        {data.recentSales.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-[var(--muted)] py-10">
            <ShoppingCart className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">No hay ventas registradas</p>
            <Link
              href="/sales/new"
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--primary-dark)]"
            >
              Registrar venta
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {data.recentSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
                    <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {s.client?.name || "Cliente General"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {s.items.length} producto{s.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--foreground)]">
                  ${s.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
