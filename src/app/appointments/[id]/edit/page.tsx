import { prisma } from "@/lib/prisma";
import { updateAppointment } from "@/lib/actions";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) }, include: { client: true } });
  if (!appointment) notFound();

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  const dateStr = appointment.date instanceof Date
    ? appointment.date.toISOString().split("T")[0]
    : new Date(appointment.date).toISOString().split("T")[0];

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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Editar Cita</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Modifica los datos de la cita</p>
        </div>
      </div>

      <form action={updateAppointment.bind(null, appointment.id)} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Cliente</label>
          <select name="clientId" required defaultValue={appointment.clientId} className="form-input">
            {clients.map((c: { id: number; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Fecha</label>
            <input name="date" type="date" required defaultValue={dateStr} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Hora</label>
            <input name="time" type="time" defaultValue={appointment.time} className="form-input" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Tipo de Cita</label>
            <select name="type" defaultValue={appointment.type} className="form-input">
              <option value="valoracion">Valoración</option>
              <option value="consulta">Consulta</option>
              <option value="saneo">Saneo de puntas</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Estado</label>
            <select name="status" defaultValue={appointment.status} className="form-input">
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Notas</label>
          <textarea name="notes" rows={3} defaultValue={appointment.notes} className="form-input" />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/appointments" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Actualizar Cita</button>
        </div>
      </form>
    </div>
  );
}
