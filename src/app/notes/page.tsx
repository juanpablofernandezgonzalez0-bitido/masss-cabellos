import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, StickyNote, SearchX, Calendar, Edit3 } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { formatDateTime } from "@/lib/utils";
import { NotesFilter } from "./notes-filter";
import { getCurrentUser } from "@/lib/session";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  const { q } = await searchParams;

  const where: Record<string, unknown> = q
    ? { title: { contains: q, mode: "insensitive" as const } }
    : {};

  if (user && user.role !== "admin") {
    where.userId = user.id;
  }

  const notes = await prisma.note.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a18cd1]/10 to-[#fbc2eb]/10">
            <StickyNote className="h-5 w-5 text-[#a18cd1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Notas</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {q ? `Resultados para "${q}"` : "Toma nota de lo que necesites"}
            </p>
          </div>
        </div>
        <Link
          href="/notes/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
        >
          <Plus className="h-4 w-4" />
          Nueva Nota
        </Link>
      </div>

      <NotesFilter q={q} />

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 p-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
            {q ? (
              <SearchX className="h-8 w-8 text-[var(--muted-foreground)]" />
            ) : (
              <StickyNote className="h-8 w-8 text-[var(--muted-foreground)]" />
            )}
          </div>
          <div className="text-center">
            {q ? (
              <>
                <p className="text-lg font-medium text-[var(--foreground)]">Sin resultados</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  No encontramos notas con <strong>"{q}"</strong>
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-[var(--foreground)]">No hay notas</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Crea tu primera nota</p>
              </>
            )}
          </div>
          {!q && (
            <Link
              href="/notes/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Crear primera nota
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug line-clamp-2">
                  {note.title}
                </h3>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={`/notes/${note.id}/edit`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                    title="Editar"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Link>
                  <DeleteButton id={note.id} type="note" />
                </div>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-[var(--muted-foreground)] line-clamp-4 whitespace-pre-wrap">
                {note.content || "Sin contenido"}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                <Calendar className="h-3 w-3" />
                {formatDateTime(note.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
