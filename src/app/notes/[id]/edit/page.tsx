import { prisma } from "@/lib/prisma";
import { updateNote } from "@/lib/actions";
import { ArrowLeft, StickyNote } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const note = await prisma.note.findUnique({ where: { id: parseInt(id) } });
  if (!note) notFound();
  if (user.role !== "admin" && note.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a notas
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
          <StickyNote className="h-5 w-5 text-[#a18cd1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Editar Nota</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Modifica el contenido de la nota</p>
        </div>
      </div>

      <form
        action={updateNote.bind(null, note.id)}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Título</label>
            <input name="title" required defaultValue={note.title} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Contenido</label>
            <textarea
              name="content"
              rows={10}
              defaultValue={note.content}
              className="form-input resize-y"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/notes" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
}
