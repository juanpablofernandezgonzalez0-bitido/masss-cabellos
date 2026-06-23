import { createClient } from "@/lib/actions";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nuevo Cliente</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Registra un nuevo cliente</p>
        </div>
      </div>

      <form action={createClient} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Nombre completo</label>
            <input name="name" required className="form-input" placeholder="Nombre del cliente" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Apodo</label>
            <input name="apodo" className="form-input" placeholder="Ej: Mari" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Dirección</label>
            <input name="direccion" className="form-input" placeholder="Cra 1 # 2-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Teléfono</label>
            <input name="phone" type="tel" className="form-input" placeholder="+57 300 000 0000" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Email</label>
            <input name="email" type="email" className="form-input" placeholder="cliente@email.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Notas</label>
            <textarea name="notes" rows={3} className="form-input" placeholder="Información adicional sobre el cliente..." />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/clients" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cliente</button>
        </div>
      </form>
    </div>
  );
}
