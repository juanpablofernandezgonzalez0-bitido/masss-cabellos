import { prisma } from "@/lib/prisma";
import { updateManufacture } from "@/lib/actions";
import { ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditManufacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.manufacture.findUnique({
    where: { id: parseInt(id) },
    include: { product: { select: { id: true, name: true } } },
  });
  if (!record) notFound();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/inventory" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[#a18cd1]">
        <ArrowLeft className="h-4 w-4" /> Volver a inventario
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
          <FlaskConical className="h-5 w-5 text-[#a18cd1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Editar Fabricación</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Modifica los datos de la fabricación</p>
        </div>
      </div>

      <form action={updateManufacture.bind(null, record.id)} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Producto</label>
            <select
              disabled
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] py-2.5 pl-3 pr-3 text-sm text-[var(--muted-foreground)] outline-none"
            >
              <option>{record.product.name}</option>
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">No se puede cambiar el producto</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Cantidad</label>
            <input
              name="quantity"
              type="number"
              min="1"
              required
              defaultValue={record.quantity}
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Stock actual: {record.product.name} se ajustará automáticamente
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Notas</label>
            <input
              name="notes"
              defaultValue={record.notes}
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[#a18cd1] focus:ring-1 focus:ring-[#a18cd1]"
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/inventory" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
}
