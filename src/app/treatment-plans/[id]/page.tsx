import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, User, Calendar, DollarSign, ClipboardList, Plus, Clock, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CompleteButton } from "@/components/complete-button";
import { PlanPayments } from "./plan-payments";

const statusStyles: Record<string, string> = {
  activo: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20",
  completado: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
  cancelado: "bg-red-50 text-red-600 border-red-200",
};

const statusLabels: Record<string, string> = {
  activo: "Activo",
  completado: "Completado",
  cancelado: "Cancelado",
};

const appointmentStatusStyles: Record<string, string> = {
  pendiente: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  completada: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
  cancelada: "bg-red-50 text-red-600 border-red-200",
};

export default async function TreatmentPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = parseInt(id);
  if (isNaN(planId)) notFound();

  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: planId },
    include: {
      client: true,
      appointments: { orderBy: [{ date: "desc" }, { time: "desc" }] },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!plan) notFound();

  const scheduledCount = plan.appointments.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/treatment-plans" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      {/* Plan Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
              <ClipboardList className="h-7 w-7 text-[var(--secondary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{plan.description}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <User className="h-4 w-4" />
                {plan.client.name}
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center self-start rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${statusStyles[plan.status] || statusStyles.activo}`}>
            <span className={`mr-2 h-2 w-2 rounded-full ${
              plan.status === "activo" ? "bg-[var(--info)]" :
              plan.status === "completado" ? "bg-[var(--success)]" : "bg-red-500"
            }`} />
            {statusLabels[plan.status] || plan.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-[var(--muted)] p-4 text-center">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Sesiones</p>
            <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{scheduledCount}/{plan.totalSessions}</p>
          </div>
          <div className="rounded-xl bg-[var(--muted)] p-4 text-center">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Restantes</p>
            <p className="mt-1 text-2xl font-bold text-[var(--primary)]">{plan.remainingSessions}</p>
          </div>
          <div className="rounded-xl bg-[var(--muted)] p-4 text-center">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Precio</p>
            <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
              {plan.price > 0 ? formatCurrency(plan.price) : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--muted)] p-4 text-center">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Creado</p>
            <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{formatDate(plan.createdAt)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {plan.remainingSessions > 0 && (
            <Link
              href={`/appointments/new?planId=${plan.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
            >
              <Plus className="h-4 w-4" />
              Programar siguiente sesión
            </Link>
          )}
          {plan.price > 0 && (
            <Link
              href={`/sales/new?planId=${plan.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)]/5"
            >
              <DollarSign className="h-4 w-4" />
              Facturar Plan
            </Link>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Citas del Plan</h2>
          </div>
          <Link
            href={`/appointments/new?planId=${plan.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Link>
        </div>

        {plan.appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12">
            <Calendar className="h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">No hay citas programadas para este plan</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {plan.appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--card-hover)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                    {a.sessionNumber || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        Sesión {a.sessionNumber || "—"}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${appointmentStatusStyles[a.status]}`}>
                        {a.status === "pendiente" ? "Pendiente" : a.status === "completada" ? "Completada" : "Cancelada"}
                      </span>
                      {a.saleId && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--success)]">
                          <CheckCircle className="h-3 w-3" /> Pagado
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                      <span>{formatDate(a.date)}</span>
                      {a.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {a.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === "pendiente" && <CompleteButton id={a.id} planId={a.treatmentPlanId} />}
                  {a.status === "completada" && (
                    <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--success)]">
                      <CheckCircle className="h-3.5 w-3.5" /> Completada
                    </span>
                  )}
                  <Link
                    href={`/appointments/${a.id}/edit`}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PlanPayments
        planId={plan.id}
        price={plan.price}
        paidAmount={plan.paidAmount}
        remainingSessions={plan.remainingSessions}
      />
    </div>
  );
}
