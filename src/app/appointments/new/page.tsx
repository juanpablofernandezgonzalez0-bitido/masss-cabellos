import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { TimePicker } from "@/components/time-picker";
import { AppointmentFormWrapper } from "@/components/appointment-form-wrapper";
import { ClientSearch } from "@/components/client-search";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const params = await searchParams;
  const planId = params.planId;

  if (planId) {
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id: parseInt(planId) },
      include: { client: true, appointments: true },
    });
    if (!plan || plan.remainingSessions <= 0) notFound();

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/treatment-plans/${plan.id}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
          <ArrowLeft className="h-4 w-4" /> Volver al plan
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
            <Calendar className="h-5 w-5 text-[var(--secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Nueva Cita del Plan</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Programa la siguiente sesión del plan</p>
          </div>
        </div>

        <AppointmentFormWrapper>
          <input type="hidden" name="treatmentPlanId" value={plan.id} />
          <input type="hidden" name="clientName" value={plan.client.name} />
          <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
              <User className="h-4 w-4" />
              {plan.description}
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Cliente: {plan.client.name} — Sesión {plan.totalSessions - plan.remainingSessions + 1} de {plan.totalSessions}
            </p>
          </div>

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
              <option value="tratamiento">Tratamiento</option>
              <option value="saneo">Saneo de puntas</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">Notas</label>
            <textarea name="notes" rows={3} className="form-input" placeholder="Notas sobre la cita..." />
          </div>
        </AppointmentFormWrapper>
      </div>
    );
  }

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

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

      <AppointmentFormWrapper>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <User className="h-4 w-4 text-[var(--muted-foreground)]" />
            Nombre del cliente
          </label>
          <ClientSearch clients={clients} />
        </div>

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
            <option value="tratamiento">Tratamiento</option>
            <option value="saneo">Saneo de puntas</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">Notas</label>
          <textarea name="notes" rows={3} className="form-input" placeholder="Notas sobre la cita..." />
        </div>
      </AppointmentFormWrapper>
    </div>
  );
}
