"use client";

import { LogOut, CalendarDays, UserCircle, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/logout";

interface HeaderProps {
  user: { name: string; username: string; role: string };
  onToggleSidebar: () => void;
}

export function Header({ user, onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/80 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] sm:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10">
          <UserCircle className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight">
            Bienvenido, <span className="text-[var(--primary)]">{user.name || user.username}</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {user.role === "admin" ? "Administrador" : "Trabajador"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full bg-[var(--accent)] px-3.5 py-1.5 sm:flex">
          <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--accent-foreground)]">
            {new Date().toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted-foreground)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          title="Configuración"
        >
          <Settings className="h-4.5 w-4.5" />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="group flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--muted-foreground)] shadow-[var(--shadow-sm)] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 hover:shadow-md"
          >
            <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </header>
  );
}
