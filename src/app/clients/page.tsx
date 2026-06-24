import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Users, Phone, Mail, Calendar, ShoppingBag, SearchX } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime } from "@/lib/utils";
import { ClientsFilter } from "./clients-filter";

async function getClients(q?: string) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { apodo: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  return prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { appointments: true, sales: true } } },
  });
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8ab4c8]/10 to-[#7098b0]/10">
            <Users className="h-5 w-5 text-[#8ab4c8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Clientes</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {q
                ? `Resultados para "${q}"`
                : "Gestiona la información de tus clientes"}
            </p>
          </div>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Link>
      </div>

      <ClientsFilter q={q} />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)] to-[var(--accent)]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Nombre</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Teléfono</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)] md:table-cell">Email</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase text-[var(--muted-foreground)]">Citas</th>
                <th className="hidden px-4 py-3.5 text-center text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:table-cell">Compras</th>
                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)] lg:table-cell">Registrado</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {clients.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-[var(--card-hover)]">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8ab4c8]/10 to-[#7098b0]/10 text-sm font-bold text-[#8ab4c8]">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{client.name}</span>
                        {client.apodo && <span className="ml-1.5 text-xs text-[var(--muted-foreground)]">"{client.apodo}"</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                      <Phone className="h-3.5 w-3.5" />
                      {client.phone || "—"}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm text-[var(--muted-foreground)] md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {client.email || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#8ab4c8]/10 px-2.5 py-1 text-xs font-medium text-[#8ab4c8]">
                      <Calendar className="h-3 w-3" />
                      {client._count.appointments}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-center sm:table-cell">
                    <div className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
                      <ShoppingBag className="h-3 w-3" />
                      {client._count.sales}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-sm text-[var(--muted-foreground)] lg:table-cell">
                    {formatDateTime(client.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/clients/${client.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={client.id} type="client" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && (
          <div className="flex flex-col items-center gap-4 p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              {q ? (
                <SearchX className="h-8 w-8 text-[var(--muted-foreground)]" />
              ) : (
                <Users className="h-8 w-8 text-[var(--muted-foreground)]" />
              )}
            </div>
            <div className="text-center">
              {q ? (
                <>
                  <p className="text-lg font-medium text-[var(--foreground)]">Sin resultados</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    No encontramos clientes con <strong>"{q}"</strong>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-[var(--foreground)]">No hay clientes registrados</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Comienza agregando tu primer cliente</p>
                </>
              )}
            </div>
            {!q && (
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                Crear primer cliente
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
