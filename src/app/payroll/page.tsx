import { prisma } from "@/lib/prisma";
import { DollarSign, Users, Receipt, Trash2 } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { WorkerForm } from "./worker-form";
import { PayButton } from "./pay-button";
import { PayrollFilter } from "./payroll-filter";
import { PayrollActions } from "./payroll-actions";
import { DeleteWorkerButton } from "./delete-worker-button";

interface SearchParams {
  q?: string;
  date?: string;
}

async function getPayrollData(params: SearchParams) {
  const wherePayroll: Record<string, unknown> = {};
  const AND: Record<string, unknown>[] = [];

  if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    const start = new Date(params.date + "T00:00:00-05:00");
    const end = new Date(params.date + "T23:59:59.999-05:00");
    AND.push({ paidAt: { gte: start, lte: end } });
  }

  if (params.q) {
    AND.push({ worker: { name: { contains: params.q, mode: "insensitive" } } });
  }

  if (AND.length > 0) wherePayroll.AND = AND;

  const [workers, payments] = await Promise.all([
    prisma.worker.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        payrolls: { orderBy: { paidAt: "desc" }, take: 1 },
        _count: { select: { payrolls: true } },
      },
    }),
    prisma.payroll.findMany({
      where: Object.keys(wherePayroll).length > 0 ? wherePayroll : undefined,
      orderBy: { paidAt: "desc" },
      take: 50,
      include: { worker: { select: { name: true } } },
    }),
  ]);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return { workers, payments, totalPaid };
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { workers, payments, totalPaid } = await getPayrollData(params);
  const activeCount = workers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20">
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Nómina</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Gestión de pagos a trabajadoras</p>
          </div>
        </div>
        <WorkerForm />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Trabajadoras activas</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{activeCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Receipt className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Pagos registrados</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{payments.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Total pagado</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PayrollFilter q={params.q} date={params.date} />

      {/* Workers Table */}
      {!params.q && !params.date && (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="font-semibold text-[var(--foreground)]">Trabajadoras</h2>
          </div>
          {workers.length === 0 ? (
            <div className="flex flex-col items-center gap-4 p-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
                <Users className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-[var(--foreground)]">No hay trabajadoras registradas</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Registra la primera trabajadora para comenzar</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {workers.map((w) => {
                const lastPay = w.payrolls[0];
                return (
                  <div key={w.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--card-hover)]">
                    {w.image ? (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[var(--border)]">
                        <img src={w.image} alt={w.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">{w.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {w._count.payrolls} pago{w._count.payrolls !== 1 ? "s" : ""}
                        {lastPay ? ` · Último: ${formatCurrency(lastPay.amount)} (${lastPay.daysWorked}d)` : ""}
                      </p>
                    </div>
                    <PayButton workerId={w.id} workerName={w.name} />
                    <DeleteWorkerButton workerId={w.id} workerName={w.name} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payments List */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--foreground)]">
              {params.q || params.date ? "Resultados de búsqueda" : "Últimos Pagos"}
            </h2>
            {(params.q || params.date) && (
              <span className="ml-auto text-sm text-[var(--muted-foreground)]">
                {payments.length} resultado{payments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {payments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
            No hay pagos registrados
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--card-hover)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{p.worker.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {p.daysWorked} día{p.daysWorked !== 1 ? "s" : ""}
                    {p.notes ? ` · ${p.notes}` : ""}
                    {" · "}
                    {formatDateTime(new Date(p.paidAt))}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
                <PayrollActions
                  payrollId={p.id}
                  workerName={p.worker.name}
                  daysWorked={p.daysWorked}
                  amount={p.amount}
                  notes={p.notes}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
