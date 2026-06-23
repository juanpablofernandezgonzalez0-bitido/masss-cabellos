import { prisma } from "@/lib/prisma";
import { createManufacture } from "@/lib/actions";
import { Plus, FlaskConical, Factory, Calendar, Package, Edit3 } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { InventoryFilter } from "./inventory-filter";
import { InventorySearch } from "./inventory-search";

type Period = "week" | "month" | "year";

function getDateRange(period: Period) {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period) {
    case "week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      return { start, label: "Esta Semana" };
    }
    case "month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        label: "Este Mes",
      };
    case "year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        label: "Este Año",
      };
  }
}

async function getData(period: Period, q?: string) {
  const { start } = getDateRange(period);

  const [products, records] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, stock: true },
    }),
    prisma.manufacture.findMany({
      where: {
        createdAt: { gte: start },
        ...(q ? { product: { name: { contains: q, mode: "insensitive" as const } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { id: true, name: true } } },
    }),
  ]);

  const totalQuantity = records.reduce((s, r) => s + r.quantity, 0);

  const byProduct: Record<number, { name: string; quantity: number }> = {};
  for (const r of records) {
    if (!byProduct[r.productId]) {
      byProduct[r.productId] = { name: r.product.name, quantity: 0 };
    }
    byProduct[r.productId].quantity += r.quantity;
  }

  return { products, records, totalQuantity, byProduct: Object.values(byProduct).sort((a, b) => b.quantity - a.quantity) };
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; q?: string }>;
}) {
  const { period: rawPeriod, q } = await searchParams;
  const period: Period = ["week", "month", "year"].includes(rawPeriod ?? "")
    ? (rawPeriod as Period)
    : "month";

  const { products, records, totalQuantity, byProduct } = await getData(period, q);
  const { label } = getDateRange(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
            <FlaskConical className="h-5 w-5 text-[#a18cd1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Inventario</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Control de fabricación de productos</p>
          </div>
        </div>
      </div>

      <InventoryFilter period={period} />

      <div className="flex items-center gap-2">
        <Factory className="h-4 w-4 text-[var(--muted-foreground)]" />
        <span className="text-sm text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">{totalQuantity}</strong> producto{totalQuantity !== 1 ? "s" : ""} fabricado{totalQuantity !== 1 ? "s" : ""} en <strong className="text-[var(--foreground)]">{label.toLowerCase()}</strong>
        </span>
      </div>

      {/* Register form */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
            <Plus className="h-4 w-4 text-[#a18cd1]" />
          </div>
          <h2 className="font-semibold text-[var(--foreground)]">Registrar Fabricación</h2>
        </div>
        <form action={createManufacture} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Producto</label>
            <select
              name="productId"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
            >
              <option value="">Seleccionar...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Cantidad</label>
            <input
              name="quantity"
              type="number"
              min="1"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
              placeholder="0"
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Notas</label>
            <input
              name="notes"
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
              placeholder="Opcional"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#a18cd1] to-[#d57eeb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Registrar
          </button>
        </form>
      </div>

      {/* Summary by product */}
      {byProduct.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Fabricación por Producto</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {byProduct.map(({ name, quantity }) => (
              <div key={name} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#a18cd1]/5 to-[#fbc2eb]/5 px-4 py-3">
                <span className="text-sm font-medium text-[var(--foreground)]">{name}</span>
                <span className="inline-flex items-center rounded-full bg-[#a18cd1]/10 px-2.5 py-1 text-sm font-bold text-[#a18cd1]">
                  {quantity} ud{quantity !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search for history */}
      <InventorySearch q={q} />

      {/* Records list */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#a18cd1]" />
            <h2 className="font-semibold text-[var(--foreground)]">Historial</h2>
            {q && <span className="text-xs text-[var(--muted-foreground)]">filtrado por &quot;{q}&quot;</span>}
          </div>
        </div>
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-5 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <FlaskConical className="h-7 w-7 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {q ? "No se encontraron registros con ese filtro" : `No hay registros de fabricación en ${label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {records.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--card-hover)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
                  <FlaskConical className="h-4 w-4 text-[#a18cd1]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{r.product.name}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(r.createdAt)}
                    {r.notes && <span className="truncate">· {r.notes}</span>}
                  </div>
                </div>
                <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#a18cd1]/10 to-[#fbc2eb]/10 px-3 py-1 text-sm font-bold text-[#a18cd1]">
                  +{r.quantity}
                </span>
                <Link
                  href={`/inventory/${r.id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-all hover:bg-[#a18cd1]/10 hover:text-[#a18cd1]"
                  title="Editar"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Link>
                <DeleteButton id={r.id} type="manufacture" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
