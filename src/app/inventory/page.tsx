import { prisma } from "@/lib/prisma";
import { createManufacture } from "@/lib/actions";
import { Plus, FlaskConical, Factory, Calendar, Package, Edit3 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { InventoryFilter } from "./inventory-filter";
import { InventorySearch } from "./inventory-search";
import { DeleteButton } from "@/components/delete-button";

type Period = "today" | "month" | "year";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function detectPeriod(month: number, date: string | undefined): Period {
  if (date) return "today";
  if (month > 0) return "month";
  return "year";
}

function getDateRange(period: Period, year: number, month: number, date?: string) {
  if (period === "today" && date) {
    return {
      start: new Date(date + "T00:00:00"),
      end: new Date(date + "T23:59:59.999"),
      label: new Date(date + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    };
  }

  if (period === "month" && month > 0) {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59),
      label: MONTHS[month - 1],
    };
  }

  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31, 23, 59, 59),
    label: String(year),
  };
}

async function getData(start: Date, end: Date, q?: string) {
  const [products, records] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, stock: true },
    }),
    prisma.manufacture.findMany({
      where: {
        createdAt: { gte: start, lte: end },
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
  searchParams: Promise<{ year?: string; month?: string; date?: string; q?: string }>;
}) {
  const { year: rawYear, month: rawMonth, date: rawDate, q } = await searchParams;

  const now = new Date();
  const currentYear = now.getFullYear();
  const selectedYear = rawYear ? parseInt(rawYear) : currentYear;
  const selectedMonth = rawMonth ? parseInt(rawMonth) : 0;
  const selectedDate = rawDate || "";

  const period = detectPeriod(selectedMonth, rawDate);
  const { start, end, label } = getDateRange(period, selectedYear, selectedMonth, rawDate);

  const { products, records, totalQuantity, byProduct } = await getData(start, end, q);

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

      <InventoryFilter
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        currentYear={currentYear}
      />

      <div className="flex items-center gap-2">
        <Factory className="h-4 w-4 text-[var(--muted-foreground)]" />
        <span className="text-sm text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">{totalQuantity}</strong> producto{totalQuantity !== 1 ? "s" : ""} fabricado{totalQuantity !== 1 ? "s" : ""} en <strong className="text-[var(--foreground)]">{label.toLowerCase()}</strong>
        </span>
      </div>

      {/* Register form */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
            <Plus className="h-4 w-4 text-[#a18cd1]" />
          </div>
          <h2 className="font-semibold text-[var(--foreground)]">Registrar Fabricación</h2>
        </div>
        <form action={createManufacture} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px_1fr] sm:items-end">
            <div>
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
            <div>
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
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Notas</label>
              <input
                name="notes"
                className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#a18cd1] to-[#d57eeb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Registrar
            </button>
          </div>
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
