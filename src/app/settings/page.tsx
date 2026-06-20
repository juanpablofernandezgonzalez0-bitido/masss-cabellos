"use client";

import { useState } from "react";
import { Settings, Moon, Sun, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al cambiar contraseña" });
      } else {
        setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10">
          <Settings className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Configuración</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Personaliza tu experiencia</p>
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--muted)]">
            <Moon className="h-4.5 w-4.5 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Apariencia</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Cambia entre modo claro y oscuro</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4">
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-[var(--warning)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">Tema oscuro</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--muted)]">
            <Lock className="h-4.5 w-4.5 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Cambiar Contraseña</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Actualiza tu contraseña de acceso</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-red-50 text-red-600"
          }`}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="form-input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Repite la nueva contraseña"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
