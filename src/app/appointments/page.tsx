import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Calendar, Clock, User, CheckCircle, DollarSign } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDate } from "@/lib/utils";
import { CompleteButton } from "@/components/complete-button";
import { AppointmentsFilter } from "./appointments-filter";

async function getAppointments(q?: string, dateFilter?: string) {
  const where: Record<string, unknown> = {};

  if (q) {
    where.client = { name: { contains: q } };
  }

  if (dateFilter) {
    const date = new Date(dateFilter);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  return prisma.appointment.findMany({
    where,
    orderBy: [{ date: "desc" }, { time: "desc" }],
    include: { client: true, treatmentPlan: true },
  });
}

const statusStyles: Record<string, string> = {
  pendiente: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  completada: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
  cancelada: "bg-red-50 text-red-600 border-red-200",
};

const typeLabels: Record<string, string> = {
  revision: "Revisión",
  tratamiento: "Tratamiento",
  consulta: "Consulta",
  seguimiento: "Seguimiento",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; date?: string }>;
}) {
  const { q, date: dateFilter } = await searchParams;
  const appointments = await getAppointments(q, dateFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
            <Calendar className="h-5 w-5 text-[var(--secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Citas</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Gestiona las citas de tus clientes</p>
          </div>
        </div>
        <Link
          href="/appointments/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
        >
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Link>
      </div>

      <AppointmentsFilter q={q} dateFilter={dateFilter} />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)] to-[var(--accent)]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Cliente</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Fecha</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:table-cell">Hora</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] md:table-cell">Tipo</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] lg:table-cell">Plan</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Estado</th>
                <th className="hidden max-w-[200px] px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] lg:table-cell">Notas</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] xl:table-cell">Pago</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {appointments.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-[var(--card-hover)]">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
                        <User className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]">{a.client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[var(--foreground)]">{formatDate(a.date)}</td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                      <Clock className="h-3.5 w-3.5" />
                      {a.time || "—"}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm capitalize text-[var(--foreground)] md:table-cell">
                    <span className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-[var(--accent-foreground)]">
                      {typeLabels[a.type] || a.type}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    {a.treatmentPlan ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)]/5 px-2.5 py-1 text-xs font-medium text-[var(--primary)]">
                        {a.treatmentPlan.description}
                        {a.sessionNumber && <>({a.sessionNumber}/{a.treatmentPlan.totalSessions})</>}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles[a.status] || statusStyles.pendiente}`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        a.status === "pendiente" ? "bg-[var(--warning)]" :
                        a.status === "completada" ? "bg-[var(--success)]" : "bg-red-500"
                      }`} />
                      {a.status === "pendiente" ? "Pendiente" : a.status === "completada" ? "Completada" : "Cancelada"}
                    </span>
                  </td>
                  <td className="hidden max-w-[200px] truncate px-4 py-3.5 text-sm text-[var(--muted-foreground)] lg:table-cell">
                    {a.notes || "—"}
                  </td>
                  <td className="hidden px-4 py-3.5 xl:table-cell">
                    {a.saleId ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
                        <CheckCircle className="h-3 w-3" /> Pagado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-2.5 py-1 text-xs font-medium text-[var(--warning)]">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {a.saleId ? (
                        <Link
                          href={`/sales/${a.saleId}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--info)] transition-all hover:bg-[var(--info)]/10"
                        >
                          Ver Factura
                        </Link>
                      ) : a.status === "pendiente" && !a.treatmentPlanId ? (
                        <Link
                          href={`/sales/new?appointmentId=${a.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--success)] transition-all hover:bg-[var(--success)]/10"
                        >
                          <DollarSign className="h-3.5 w-3.5" /> Facturar
                        </Link>
                      ) : null}
                      {a.status === "pendiente" && <CompleteButton id={a.id} planId={a.treatmentPlanId} />}
                      <Link
                        href={`/appointments/${a.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={a.id} type="appointment" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {appointments.length === 0 && (
          <div className="flex flex-col items-center gap-4 p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <Calendar className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--foreground)]">
                {q || dateFilter ? "No se encontraron citas" : "No hay citas registradas"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {q || dateFilter ? "Intenta con otros filtros" : "Agenda la primera cita para tus clientes"}
              </p>
            </div>
            <Link
              href="/appointments/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Crear primera cita
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
