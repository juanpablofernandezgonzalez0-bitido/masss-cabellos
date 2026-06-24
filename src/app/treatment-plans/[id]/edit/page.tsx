import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTreatmentPlan } from "@/lib/actions";
import { ArrowLeft, ClipboardList, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function EditTreatmentPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = parseInt(id);
  if (isNaN(planId)) notFound();

  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: planId },
    include: { client: true },
  });

  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={`/treatment-plans/${plan.id}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver al plan
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
          <ClipboardList className="h-5 w-5 text-[var(--secondary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Editar Plan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{plan.client.name} — {plan.description}</p>
        </div>
      </div>

      <form action={updateTreatmentPlan.bind(null, plan.id)} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">Nombre / Descripción del Plan</label>
          <input
            name="description"
            required
            defaultValue={plan.description}
            className="form-input"
            placeholder="Ej: Tratamiento capilar intensivo"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
            Precio Total
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan.price || ""}
            className="form-input"
            placeholder="$0"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href={`/treatment-plans/${plan.id}`} className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
}
