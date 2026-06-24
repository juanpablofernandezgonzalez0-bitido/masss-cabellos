import { createAppointment } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { TimePicker } from "@/components/time-picker";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const [{ planId }, plans, clients] = await Promise.all([
    searchParams,
    prisma.treatmentPlan.findMany({
      where: { status: "activo", remainingSessions: { gt: 0 } },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  const preselectedPlan = planId
    ? plans.find((p) => p.id === parseInt(planId))
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/appointments" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a citas
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
          <Calendar className="h-5 w-5 text-[var(--secondary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nueva Cita</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Agenda una cita para un cliente</p>
        </div>
      </div>

      <form action={createAppointment} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        {preselectedPlan ? (
          <>
            <input type="hidden" name="treatmentPlanId" value={preselectedPlan.id} />
            <input type="hidden" name="clientName" value={preselectedPlan.client.name} />
            <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
                <User className="h-4 w-4" />
                Plan: {preselectedPlan.description}
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Cliente: {preselectedPlan.client.name} — Sesión {preselectedPlan.totalSessions - preselectedPlan.remainingSessions + 1} de {preselectedPlan.totalSessions}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                Nombre del cliente
              </label>
              <input
                name="clientName"
                list="clients-list"
                required
                className="form-input"
                placeholder="Ej: María Pérez"
              />
              <datalist id="clients-list">
                {clients.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <p className="text-xs text-[var(--muted-foreground)]">
                Solo clientes registrados — crea uno nuevo desde Clientes si no aparece
              </p>
            </div>

            {plans.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Plan de Tratamiento (opcional)
                </label>
                <select name="treatmentPlanId" className="form-input">
                  <option value="">Sin plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.client.name} — {p.description} ({p.remainingSessions} sesiones restantes)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">Fecha</label>
            <input name="date" type="date" required className="form-input" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">Hora</label>
            <TimePicker name="time" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">Tipo de Cita</label>
          <select name="type" className="form-input">
            <option value="valoracion">Valoración</option>
            <option value="consulta">Consulta</option>
            <option value="saneo">Saneo de puntas</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">Notas</label>
          <textarea name="notes" rows={3} className="form-input" placeholder="Notas sobre la cita..." />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/appointments" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cita</button>
        </div>
      </form>
    </div>
  );
}
