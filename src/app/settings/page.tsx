"use client";

import { useState, useEffect } from "react";
import { Settings, Lock, CheckCircle, AlertCircle, Shield, UserCircle } from "lucide-react";

interface UserOption {
  id: number;
  username: string;
  name: string;
  role: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        if (data.length > 0) setSelectedUserId(String(data[0].id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedUser = users.find((u) => String(u.id) === selectedUserId);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedUserId) {
      setMessage({ type: "error", text: "Selecciona un usuario" });
      return;
    }
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
        body: JSON.stringify({ userId: selectedUserId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al cambiar contraseña" });
      } else {
        setMessage({ type: "success", text: `Contraseña de ${selectedUser?.name || selectedUser?.username} actualizada` });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10">
          <Settings className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Configuración</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Administra las contraseñas de los usuarios</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--muted)]">
            <Lock className="h-4.5 w-4.5 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Cambiar Contraseña</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Selecciona un usuario y asigna una nueva contraseña</p>
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

        {loading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-lg bg-[var(--muted)]" />
            <div className="h-10 animate-pulse rounded-lg bg-[var(--muted)]" />
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Usuario</label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => { setSelectedUserId(e.target.value); setMessage(null); }}
                  className="form-input appearance-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.username} ({u.role === "admin" ? "Admin" : "Trabajador"})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  {selectedUser?.role === "admin" ? (
                    <Shield className="h-4 w-4 text-[var(--primary)]" />
                  ) : (
                    <UserCircle className="h-4 w-4 text-[var(--muted-foreground)]" />
                  )}
                </div>
              </div>
            </div>

            {selectedUser && (
              <div className="rounded-xl bg-[var(--accent)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 text-xs font-bold text-[var(--primary)]">
                    {(selectedUser.name || selectedUser.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{selectedUser.name || selectedUser.username}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      @{selectedUser.username} · {selectedUser.role === "admin" ? "Administrador" : "Trabajador"}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Confirmar contraseña</label>
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
                {saving ? "Guardando..." : `Cambiar Contraseña`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
