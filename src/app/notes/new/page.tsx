import { createNote } from "@/lib/actions";
import { ArrowLeft, StickyNote } from "lucide-react";
import Link from "next/link";

export default function NewNotePage() {
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nueva Nota</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Escribe lo que necesites recordar</p>
        </div>
      </div>

      <form action={createNote} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Título</label>
            <input name="title" required className="form-input" placeholder="Título de la nota" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Contenido</label>
            <textarea
              name="content"
              rows={10}
              className="form-input resize-y"
              placeholder="Escribe aquí el contenido de tu nota..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/notes" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Nota</button>
        </div>
      </form>
    </div>
  );
}
