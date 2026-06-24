import { createTreatmentPlan } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ClipboardList, DollarSign, User, Calendar } from "lucide-react";
import Link from "next/link";
import { TimePicker } from "@/components/time-picker";

export default async function NewTreatmentPlanPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/treatment-plans" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
          <ClipboardList className="h-5 w-5 text-[var(--secondary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nuevo Plan de Tratamiento</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Crea un plan de secciones para un cliente</p>
        </div>
      </div>

      <form action={createTreatmentPlan} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <User className="h-4 w-4 text-[var(--muted-foreground)]" />
            Cliente
          </label>
          {clients.length > 0 && (
            <>
              <select name="clientId" className="form-input">
                <option value="">Seleccionar cliente existente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <span className="flex-1 border-t border-[var(--border)]" />
                <span>o escribe un nombre nuevo</span>
                <span className="flex-1 border-t border-[var(--border)]" />
              </div>
            </>
          )}
          <input
            name="clientName"
            className="form-input"
            placeholder="Nombre del cliente"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Si seleccionas un cliente existente, el nombre de arriba se ignorará
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">Descripción del Plan</label>
          <input
            name="description"
            required
            className="form-input"
            placeholder="Ej: Tratamiento capilar intensivo"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">Número de Sesiones</label>
            <input name="totalSessions" type="number" min="1" required className="form-input" defaultValue={1} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
              Precio Total (opcional)
            </label>
            <input name="price" type="number" step="0.01" min="0" className="form-input" placeholder="$0" />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">Primera Sesión</span>
            <span className="text-xs text-[var(--muted-foreground)]">(se agregará automáticamente al módulo de citas)</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--foreground)]">Fecha</label>
              <input name="firstDate" type="date" required className="form-input" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--foreground)]">Hora</label>
              <TimePicker name="firstTime" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/treatment-plans" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Plan</button>
        </div>
      </form>
    </div>
  );
}
