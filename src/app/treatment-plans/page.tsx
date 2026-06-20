import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, ClipboardList, User, DollarSign, Calendar } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PlansFilter } from "./plans-filter";

async function getTreatmentPlans(q?: string) {
  return prisma.treatmentPlan.findMany({
    ...(q ? {
      where: { client: { name: { contains: q, mode: "insensitive" } } },
    } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      _count: { select: { appointments: true } },
    },
  });
}

function PaymentProgress({ paid, total }: { paid: number; total: number }) {
  if (total <= 0) return null;
  const pct = Math.min(100, Math.round((paid / total) * 100));
  const isPaid = paid >= total;
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full rounded-full transition-all ${isPaid ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`whitespace-nowrap text-xs font-medium ${isPaid ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}>
        {pct}%
      </span>
    </div>
  );
}

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

export default async function TreatmentPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const plans = await getTreatmentPlans(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
            <ClipboardList className="h-5 w-5 text-[var(--secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Planes de Tratamiento</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Gestiona los planes de secciones de tus clientes</p>
          </div>
        </div>
        <Link
          href="/treatment-plans/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </Link>
      </div>

      <PlansFilter q={q} />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        {q && (
          <div className="border-b border-[var(--border)] bg-[var(--accent)] px-5 py-2.5 text-sm text-[var(--muted-foreground)]">
            {plans.length} resultado{plans.length !== 1 ? "s" : ""}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)] to-[var(--accent)]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Cliente</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Descripción</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase text-[var(--muted-foreground)]">Sesiones</th>
                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)] md:table-cell">Precio</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Estado</th>
                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)] lg:table-cell">Creado</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {plans.map((plan) => {
                const scheduledCount = plan._count.appointments;
                return (
                  <tr key={plan.id} className="transition-colors hover:bg-[var(--card-hover)]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10">
                          <User className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{plan.client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--foreground)]">{plan.description}</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 rounded-full bg-[var(--info)]/10 px-2.5 py-1 text-xs font-medium text-[var(--info)]">
                        <Calendar className="h-3 w-3" />
                        {scheduledCount}/{plan.totalSessions}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-right md:table-cell">
                      {plan.price > 0 ? (
                        <div>
                          <div className="inline-flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
                            <DollarSign className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                            {formatCurrency(plan.price)}
                          </div>
                          <PaymentProgress paid={plan.paidAmount} total={plan.price} />
                        </div>
                      ) : <span className="text-sm text-[var(--muted-foreground)]">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles[plan.status] || statusStyles.activo}`}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          plan.status === "activo" ? "bg-[var(--info)]" :
                          plan.status === "completado" ? "bg-[var(--success)]" : "bg-red-500"
                        }`} />
                        {statusLabels[plan.status] || plan.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-right text-sm text-[var(--muted-foreground)] lg:table-cell">
                      {formatDate(plan.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/treatment-plans/${plan.id}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        >
                          Ver
                        </Link>
                        <DeleteButton id={plan.id} type="treatmentPlan" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {plans.length === 0 && (
          <div className="flex flex-col items-center gap-4 p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <ClipboardList className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--foreground)]">
                {q ? "No se encontraron planes" : "No hay planes de tratamiento"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {q ? "Intenta con otro término de búsqueda" : "Crea un plan para empezar a programar sesiones"}
              </p>
            </div>
            {!q && (
              <Link
                href="/treatment-plans/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                Crear primer plan
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
