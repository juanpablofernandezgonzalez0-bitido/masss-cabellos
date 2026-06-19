"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Error capturado:", error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#fdf8f6] via-[#fdf0f4] to-[#fce4ec] p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-[var(--foreground)]">Algo salió mal</h1>
      <p className="max-w-sm text-center text-sm text-[var(--muted-foreground)]">
        Ocurrió un error inesperado. Esto no debería pasar — intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
      >
        Reintentar
      </button>
    </div>
  );
}
