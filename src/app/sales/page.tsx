import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, ShoppingCart, DollarSign, Receipt, Calculator } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { SalesFilter } from "./sales-filter";

interface SearchParams {
  q?: string;
  date?: string;
}

async function getSales(searchParams: SearchParams) {
  const where: Record<string, unknown> = {};
  const AND: Record<string, unknown>[] = [];

  if (searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)) {
    const start = new Date(searchParams.date + "T00:00:00-05:00");
    const end = new Date(searchParams.date + "T23:59:59.999-05:00");
    AND.push({ createdAt: { gte: start, lte: end } });
  }

  if (searchParams.q) {
    AND.push({
      client: { name: { contains: searchParams.q, mode: "insensitive" } },
    });
  }

  if (AND.length > 0) where.AND = AND;

  return prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { client: true, items: { include: { product: true } } },
  });
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sales = await getSales(params);
  const todayStr = new Date().toISOString().split("T")[0];
  const hasFilters = params.q || params.date;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--success)]/10 to-[var(--success)]/20">
            <ShoppingCart className="h-5 w-5 text-[var(--success)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Ventas</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Registro de ventas realizadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sales/quote"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--info)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--info)] transition-all hover:bg-[var(--info)]/5"
          >
            <Calculator className="h-4 w-4" />
            Cotización
          </Link>
          <Link
            href="/sales/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
          >
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Link>
        </div>
      </div>

      {/* Filters */}
      <SalesFilter q={params.q} date={params.date} />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        {hasFilters && (
          <div className="border-b border-[var(--border)] bg-[var(--accent)] px-5 py-2.5 text-sm text-[var(--muted-foreground)]">
            {sales.length} resultado{sales.length !== 1 ? "s" : ""}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)] to-[var(--accent)]">
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:table-cell">#</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Cliente</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] lg:table-cell">Productos</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total</th>
                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)] md:table-cell">Fecha</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition-colors hover:bg-[var(--card-hover)]">
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm font-medium text-[var(--foreground)]">#{sale.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]">
                        <span className="text-xs font-bold text-[var(--primary)]">
                          {(sale.client?.name || "CG").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-[var(--foreground)]">{sale.client?.name || "Cliente General"}</span>
                    </div>
                  </td>
                  <td className="hidden max-w-[300px] truncate px-4 py-3.5 text-sm text-[var(--muted-foreground)] lg:table-cell">
                    {sale.items.map((i) => `${i.product?.name ?? i.customName} x${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-[var(--success)]/10 px-2.5 py-1 font-semibold text-[var(--success)]">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatCurrency(sale.total)}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-sm text-[var(--muted-foreground)] md:table-cell">
                    {formatDateTime(sale.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--info)] transition-all hover:bg-[var(--info)]/10"
                      >
                        <Receipt className="mr-1 inline h-3.5 w-3.5" />
                        Factura
                      </Link>
                      <DeleteButton id={sale.id} type="sale" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sales.length === 0 && (
          <div className="flex flex-col items-center gap-4 p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <ShoppingCart className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--foreground)]">
                {hasFilters ? "No se encontraron ventas" : "No hay ventas registradas"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {hasFilters ? "Intenta con otros filtros" : "Registra la primera venta del negocio"}
              </p>
            </div>
            {!hasFilters && (
              <Link
                href="/sales/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                Registrar primera venta
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
