"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fdf8f6] via-[#fdf0f4] to-[#fce4ec] p-4">
      <div className="relative w-full max-w-md animate-in">
        {/* Decorative elements */}
        <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 blur-2xl" />
        <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10 blur-2xl" />

        <div className="relative rounded-2xl border border-[var(--border)] bg-white/90 p-8 shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {/* Decorative top bar */}
          <div className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[var(--primary)] via-[var(--primary-light)] to-[var(--secondary)]" />

          <div className="text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-0.5 shadow-lg shadow-[var(--primary)]/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                <img src="/logo.png" alt="Masss Cabellos" className="h-16 w-16 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Masss Cabellos</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Inicia sesión para gestionar tu negocio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Usuario</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Scissors className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3.5 text-sm outline-none transition-all placeholder:text-[var(--muted-foreground)]/60 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-3.5 pr-10 text-sm outline-none transition-all placeholder:text-[var(--muted-foreground)]/60 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/25 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} Masss Cabellos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
