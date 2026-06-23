import { prisma } from "@/lib/prisma";
import { updateClient } from "@/lib/actions";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id: parseInt(id) } });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8ab4c8]/10 to-[#7098b0]/10">
          <Users className="h-5 w-5 text-[#8ab4c8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Editar Cliente</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Modifica los datos del cliente</p>
        </div>
      </div>

      <form action={updateClient.bind(null, client.id)} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Nombre completo</label>
            <input name="name" required defaultValue={client.name} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Apodo</label>
            <input name="apodo" defaultValue={client.apodo} className="form-input" placeholder="Ej: Mari" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Dirección</label>
            <input name="direccion" defaultValue={client.direccion} className="form-input" placeholder="Cra 1 # 2-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Teléfono</label>
            <input name="phone" type="tel" defaultValue={client.phone} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Email</label>
            <input name="email" type="email" defaultValue={client.email} className="form-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Notas</label>
            <textarea name="notes" rows={3} defaultValue={client.notes} className="form-input" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/clients" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Actualizar Cliente</button>
        </div>
      </form>
    </div>
  );
}
