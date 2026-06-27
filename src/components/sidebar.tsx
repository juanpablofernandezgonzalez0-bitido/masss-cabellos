"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  ShoppingCart,
  Truck,
  BarChart3,
  ClipboardList,
  Sun,
  DollarSign,
  StickyNote,
  FlaskConical,
  CreditCard,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "worker";
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ...(isAdmin ? [{ href: "/products", label: "Productos", icon: Package }] : []),
    ...(isAdmin ? [{ href: "/inventory", label: "Inventario", icon: FlaskConical }] : []),
    { href: "/clients", label: "Clientes", icon: Users },
    { href: "/appointments", label: "Citas", icon: Calendar },
    { href: "/treatment-plans", label: "Planes", icon: ClipboardList },
    { href: "/sales", label: "Ventas", icon: ShoppingCart },
    ...(isAdmin ? [{ href: "/purchases", label: "Compras", icon: Truck }] : []),
    ...(isAdmin ? [{ href: "/debts", label: "Deudas", icon: CreditCard }] : []),
    ...(isAdmin ? [{ href: "/reports", label: "Indicadores", icon: BarChart3 }] : []),
    ...(isAdmin ? [{ href: "/day-summary", label: "Resumen del Día", icon: Sun }] : []),
    ...(isAdmin ? [{ href: "/payroll", label: "Nómina", icon: DollarSign }] : []),
    { href: "/notes", label: "Notas", icon: StickyNote },
  ];

  return (
    <>
      {/* Mobile: fixed overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-[var(--border)] bg-white shadow-[var(--shadow-lg)] transition-transform duration-300 sm:static sm:z-auto sm:shadow-[var(--shadow-sm)] ${
          isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="relative overflow-hidden border-b border-[var(--border)] px-6 py-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-0.5 shadow-md">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                  <Image src="/logo.png" alt="Masss Caballos" width={32} height={32} className="h-8 w-8 object-contain" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight text-[var(--foreground)]">Masss Cabellos</h1>
                <p className="truncate text-xs text-[var(--muted-foreground)]">Sistema de Gestión</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] sm:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--primary)]" />
                )}
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 ${
                  isActive ? "text-[var(--primary)]" : "group-hover:scale-110"
                }`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--accent)] px-3 py-2.5">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
              isAdmin ? "bg-[var(--primary)]" : "bg-[var(--secondary)]"
            }`} />
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <span className="truncate text-xs font-medium text-[var(--accent-foreground)]">
                {isAdmin ? "Administrador" : "Trabajador"}
              </span>
              <span className="shrink-0 rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                {isAdmin ? "Admin" : "Worker"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
